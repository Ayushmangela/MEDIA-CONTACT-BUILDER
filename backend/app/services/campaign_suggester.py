from sqlmodel import Session, select
from collections import Counter
from datetime import datetime, timedelta
from typing import List, Dict, Any
import spacy
import os

from ..models.schemas import Journalist, Article, Pitch

try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    os.system("python -m spacy download en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

# Stop words and noise terms to exclude from topic extraction
STOP_WORDS = {
    "say", "says", "said", "new", "year", "year's", "first", "last", "one",
    "two", "three", "report", "reports", "reported", "data", "study", "show",
    "shows", "may", "could", "would", "will", "get", "got", "make", "made",
    "use", "used", "find", "found", "know", "knew", "help", "helps", "helped",
    "time", "day", "week", "month", "way", "part", "people", "man", "men",
    "woman", "women", "world", "news", "update", "today", "latest", "big",
    "high", "low", "old", "right", "top", "back", "look", "come", "need",
    "work", "works", "set", "sets", "take", "takes", "give", "gives",
}

# Curated thematic seed topics per beat — used to bootstrap suggestions
# when the database has limited data (e.g., fresh install)
BEAT_SEED_TOPICS: Dict[str, List[Dict[str, Any]]] = {
    "environment": [
        {
            "topic": "climate change and extreme weather",
            "reason": "Extreme weather events tied to climate change are among the most-covered issues this season — a prime pitch window.",
            "urgency": "high",
        },
        {
            "topic": "plastic pollution ocean impact",
            "reason": "Ocean plastic is consistently trending in environmental journalism and drives high reader engagement.",
            "urgency": "medium",
        },
        {
            "topic": "renewable energy transition",
            "reason": "The global shift away from fossil fuels is a dominant story arc. Journalists are actively looking for localized angles.",
            "urgency": "medium",
        },
    ],
    "animal-welfare": [
        {
            "topic": "factory farming and animal cruelty",
            "reason": "Factory farming legislation is active in multiple states — journalists covering food policy are primed for this angle.",
            "urgency": "high",
        },
        {
            "topic": "wildlife conservation and habitat loss",
            "reason": "Habitat destruction stories consistently perform well and connect across environment and welfare beats.",
            "urgency": "medium",
        },
        {
            "topic": "vegan food and plant-based diets",
            "reason": "Plant-based food trends are being covered by food systems, health, and animal welfare reporters simultaneously.",
            "urgency": "low",
        },
    ],
    "food-systems": [
        {
            "topic": "food insecurity and hunger crisis",
            "reason": "Food bank demand and supply chain disruptions make food insecurity a perennial high-impact pitch.",
            "urgency": "high",
        },
        {
            "topic": "regenerative agriculture",
            "reason": "Regenerative farming is at the intersection of climate and food — a growing niche with increasing journalist interest.",
            "urgency": "medium",
        },
        {
            "topic": "ultra-processed food and health",
            "reason": "Ultra-processed food research is generating significant coverage in health and food journalism right now.",
            "urgency": "medium",
        },
    ],
    "science": [
        {
            "topic": "AI and climate modeling",
            "reason": "The intersection of AI and climate science is attracting both tech and science journalists — a rare dual-beat opportunity.",
            "urgency": "high",
        },
        {
            "topic": "CRISPR and genetic research",
            "reason": "Gene editing breakthroughs regularly generate widespread science journalism coverage.",
            "urgency": "medium",
        },
        {
            "topic": "mental health and social media",
            "reason": "Research linking social media to mental health outcomes is actively sought after by health and science journalists.",
            "urgency": "medium",
        },
    ],
}


def _extract_noun_phrases(text: str) -> List[str]:
    """Extract meaningful noun chunks from text using spaCy."""
    if not text or len(text.strip()) < 5:
        return []
    doc = nlp(text[:500])  # Cap to 500 chars for performance
    phrases = []
    for chunk in doc.noun_chunks:
        clean = chunk.text.lower().strip()
        words = clean.split()
        # Filter out stopwords and short/noisy chunks
        if (
            len(words) >= 2
            and len(clean) > 6
            and not any(w in STOP_WORDS for w in words[:2])
        ):
            phrases.append(clean)
    return phrases


def get_campaign_suggestions(beat: str, db: Session) -> List[Dict[str, Any]]:
    """
    Analyze Pitch history and recent Article coverage for a given beat to
    produce context-aware campaign suggestions.

    Strategy:
    1. Extract past campaign topics from Pitch history (avoid repeating).
    2. Mine recent Articles (last 14 days) for recurring noun-phrase themes.
    3. Count journalists per theme to surface 'hot' topics.
    4. Merge with curated seed topics and rank by freshness + coverage.
    5. Return top 3–5 suggestions with reasons and metadata.
    """
    suggestions: List[Dict[str, Any]] = []
    past_topics: set = set()

    # ── 1. Mine past Pitch history for context ────────────────────────────
    pitches = db.exec(select(Pitch)).all()
    for p in pitches:
        if p.campaign_topic:
            past_topics.add(p.campaign_topic.lower().strip())

    past_pitch_topics = [p.campaign_topic for p in pitches if p.campaign_topic]
    pitch_counter = Counter(past_pitch_topics)
    most_pitched = [topic for topic, _ in pitch_counter.most_common(3)]

    # ── 2. Mine recent Articles from journalists in this beat ─────────────
    cutoff = datetime.utcnow() - timedelta(days=14)
    beat_journalists = db.exec(
        select(Journalist).where(Journalist.beat == beat)
    ).all()
    journalist_ids = [j.id for j in beat_journalists]

    phrase_to_journalist_ids: Dict[str, set] = {}

    if journalist_ids:
        recent_articles = db.exec(
            select(Article).where(
                Article.journalist_id.in_(journalist_ids),  # type: ignore[attr-defined]
                Article.published_at >= cutoff,
            )
        ).all()

        for article in recent_articles:
            combined = f"{article.title or ''} {article.description or ''}"
            phrases = _extract_noun_phrases(combined)
            for phrase in phrases:
                if phrase not in phrase_to_journalist_ids:
                    phrase_to_journalist_ids[phrase] = set()
                if article.journalist_id:
                    phrase_to_journalist_ids[phrase].add(article.journalist_id)

    # ── 3. Rank extracted phrases by journalist count ─────────────────────
    phrase_scores = {
        phrase: len(jids)
        for phrase, jids in phrase_to_journalist_ids.items()
        if len(jids) >= 1  # At least 1 journalist covering it
    }
    top_phrases = sorted(phrase_scores.items(), key=lambda x: x[1], reverse=True)[:5]

    # ── 4. Build data-driven suggestions from article mining ──────────────
    for phrase, journalist_count in top_phrases:
        jids = phrase_to_journalist_ids[phrase]
        # Determine urgency based on coverage breadth
        if journalist_count >= 3:
            urgency = "high"
        elif journalist_count == 2:
            urgency = "medium"
        else:
            urgency = "low"

        is_repeat = any(phrase in past for past in past_topics)

        reason_parts = [
            f"{journalist_count} journalist{'s' if journalist_count > 1 else ''} "
            f"you track {'are' if journalist_count > 1 else 'is'} actively covering this right now."
        ]
        if is_repeat:
            reason_parts.append("You've pitched a related topic before — consider a fresh angle.")

        suggestions.append(
            {
                "topic": phrase,
                "reason": " ".join(reason_parts),
                "journalist_count": journalist_count,
                "beat": beat,
                "urgency": urgency,
                "source": "live_data",
            }
        )

    # ── 5. Fill remaining slots with curated seed topics ──────────────────
    seeds = BEAT_SEED_TOPICS.get(beat, [])
    for seed in seeds:
        if len(suggestions) >= 5:
            break
        # Don't duplicate something we already surfaced from live data
        topic_lower = seed["topic"].lower()
        already_covered = any(
            topic_lower in s["topic"] or s["topic"] in topic_lower
            for s in suggestions
        )
        if not already_covered:
            j_count = len(beat_journalists)
            seed_suggestion = {
                "topic": seed["topic"],
                "reason": seed["reason"],
                "journalist_count": min(j_count, 3) if j_count > 0 else 0,
                "beat": beat,
                "urgency": seed["urgency"],
                "source": "curated",
            }
            suggestions.append(seed_suggestion)

    # ── 6. Add "repeat pitch" suggestion if history exists ────────────────
    if most_pitched and len(suggestions) < 5:
        top_pitched = most_pitched[0]
        if not any(top_pitched.lower() in s["topic"] for s in suggestions):
            suggestions.append(
                {
                    "topic": top_pitched,
                    "reason": f"You've pitched this topic {pitch_counter[top_pitched]} time(s) before. A fresh follow-up can reinforce your narrative.",
                    "journalist_count": len(beat_journalists),
                    "beat": beat,
                    "urgency": "low",
                    "source": "history",
                }
            )

    return suggestions[:5]
