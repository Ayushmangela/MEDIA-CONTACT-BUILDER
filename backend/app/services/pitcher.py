import os
from groq import Groq
from sqlmodel import Session
from ..models.schemas import Pitch, Journalist, Article

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

TONE_PROMPTS = {
    "Story-driven": (
        "Craft an emotionally resonant pitch. Lead with a real or hypothetical human/animal story "
        "that connects deeply to the campaign. Make the journalist feel the urgency through a person, "
        "not statistics."
    ),
    "Data-heavy": (
        "Lead with the most compelling statistic or data point. Structure the pitch around exclusive "
        "numbers, trends, or research findings that no other journalist has. Appeal to their evidence-based instincts."
    ),
    "Quick Check-in": (
        "Be extremely concise — max 3 sentences. This is a soft 'are you still covering X?' check-in. "
        "No hard sell. Just a warm, collegial nudge."
    ),
}


def _build_article_corpus(articles: list[Article], max_articles: int = 10) -> str:
    corpus_lines = []
    for i, a in enumerate(articles[:max_articles], 1):
        parts = [f"[{i}] Title: {a.title}"]
        if a.description:
            parts.append(f"    Summary: {a.description}")
        if a.content and len(a.content) > 20:
            parts.append(f"    Excerpt: {a.content[:300].strip()}...")
        corpus_lines.append("\n".join(parts))
    return "\n\n".join(corpus_lines)


def _analyze_journalist(client: Groq, journalist: Journalist, article_corpus: str) -> str:
    analysis_prompt = f"""You are an expert media analyst preparing a journalist intelligence brief.

Journalist: {journalist.name}
Outlet: {journalist.outlet} (Tier: {journalist.tier})
Beat: {journalist.beat}

Below are their recent published articles:

{article_corpus}

---

Based on these articles, produce a structured intelligence brief with the following sections:

1. CORE THEMES: The 3-5 recurring topics or issues this journalist gravitates toward.
2. WRITING ANGLE: Their preferred storytelling style (e.g., data-driven, human interest, investigative, policy analysis).
3. AUDIENCE LENS: What kind of reader they seem to be writing for and what those readers care about.
4. PITCH HOOK: The single most promising angle for a new campaign pitch that aligns with their demonstrated interests.
5. AVOID: What topics, framings, or arguments they clearly don't care about or would find irrelevant.

Be specific. Reference actual article titles where relevant. Keep each section to 1-2 sentences."""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": analysis_prompt}],
        max_tokens=500,
        temperature=0.4,
    )
    return response.choices[0].message.content.strip()


def _build_brief_block(brief: dict) -> str:
    """Format the campaign brief fields into a readable block for the prompt."""
    lines = []
    if brief.get("org_name"):
        lines.append(f"- Organization: {brief['org_name']}")
    if brief.get("key_stat"):
        lines.append(f"- Key Stat / Data Point: {brief['key_stat']}")
    if brief.get("story_angle"):
        lines.append(f"- Story Angle: {brief['story_angle']}")
    if brief.get("target_outcome"):
        lines.append(f"- Target Outcome: {brief['target_outcome']}")
    return "\n".join(lines) if lines else "(No brief provided — use general campaign topic only.)"


def generate_ai_pitch(
    journalist: Journalist,
    articles: list[Article],
    campaign_topic: str,
    tone: str,
    db: Session,
    brief: dict | None = None,
) -> str:
    """
    Two-stage pitch generation using Groq:
      Stage 1 — Analyze all available articles to build a journalist intelligence brief.
      Stage 2 — Use that brief + campaign brief to write a hyper-personalized pitch.
    """
    if not GROQ_API_KEY or GROQ_API_KEY == "your_groq_api_key_here":
        return f"Mock {tone} pitch regarding {campaign_topic} for {journalist.name}. (API Key Missing)"

    try:
        client = Groq(api_key=GROQ_API_KEY)
        tone_instruction = TONE_PROMPTS.get(tone, TONE_PROMPTS["Story-driven"])
        brief_block = _build_brief_block(brief or {})

        # Stage 1: Article Analysis
        if articles:
            article_corpus = _build_article_corpus(articles, max_articles=10)
            journalist_brief = _analyze_journalist(client, journalist, article_corpus)
        else:
            journalist_brief = f"No articles available. Journalist covers the '{journalist.beat}' beat at {journalist.outlet}."

        # Stage 2: Personalized Pitch Generation
        pitch_prompt = f"""You are a world-class PR strategist writing a highly personalized media pitch.

--- JOURNALIST INTELLIGENCE BRIEF ---
{journalist_brief}
-------------------------------------

--- CAMPAIGN BRIEF ---
Topic: {campaign_topic}
{brief_block}
----------------------

Journalist: {journalist.name} at {journalist.outlet}

TONE DIRECTIVE: {tone_instruction}

Write a personalized pitch email body (no subject line) that:
1. Opens by specifically referencing one of their actual articles and why it resonated with you.
2. Bridges that article directly to the campaign topic in a natural, non-salesy way.
3. Uses specific details from the campaign brief (org name, key stat, story angle, outcome) to make the pitch concrete and credible.
4. Explains why THIS journalist — given their specific beat and angle — is the perfect person to cover this.
5. Closes with a clear, low-friction call to action.
6. Stays under 200 words. Sign off with [Your Name] only — no subject line, no other placeholders.

The pitch must feel like it was written specifically for this journalist, not copy-pasted from a template."""

        pitch_response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": pitch_prompt}],
            max_tokens=450,
            temperature=0.75,
        )

        content = pitch_response.choices[0].message.content.strip()

        # Save to DB
        new_pitch = Pitch(
            campaign_topic=campaign_topic,
            tone=tone,
            content=content,
            journalist_id=journalist.id,
        )
        db.add(new_pitch)
        db.commit()

        return content

    except Exception as e:
        print(f"Groq API Error: {e}")
        return "Failed to generate pitch via API."
