from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlmodel import Session, select
from typing import List, Dict, Any
from ..core.db import get_session
from ..models.schemas import Journalist, Article, Pitch
from ..services.scraper import fetch_and_store_articles
from ..services.nlp import run_nlp_profiling
from ..services.scorer import calculate_relevance
from ..services.pitcher import generate_ai_pitch

router = APIRouter(prefix="/api")

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_session)):
    """Advanced Stats for Recharts Dashboard."""
    j_count = db.exec(select(Journalist)).all()
    a_count = db.exec(select(Article)).all()
    p_count = db.exec(select(Pitch)).all()
    
    # Calculate tier distribution
    tiers = {"Premium": 0, "Major": 0, "Niche": 0, "Standard": 0}
    for j in j_count:
        tiers[j.tier] = tiers.get(j.tier, 0) + 1
        
    return {
        "journalists_total": len(j_count),
        "articles_total": len(a_count),
        "pitches_generated": len(p_count),
        "tier_distribution": tiers
    }

@router.post("/search")
def search_and_process(payload: Dict[str, Any], db: Session = Depends(get_session)):
    """Synchronous pipeline that scrapes, analyzes, scores, and returns results for a specific topic."""
    topic = payload.get("topic")
    beat = payload.get("beat", "general")
    
    if not topic:
        raise HTTPException(status_code=400, detail="Topic required")
        
    print(f"Pipeline Started for topic: {topic}")
    
    # 1. Scrape NewsAPI for the exact "Topic"
    fetch_and_store_articles(topic, beat, db)
    
    # 2. Run NLP & Scoring on journalists attached to this beat
    journalists = db.exec(select(Journalist).where(Journalist.beat == beat)).all()
    # Store score breakdown in a temporary dictionary mapped by journalist ID
    score_breakdowns = {}
    for j in journalists:
        run_nlp_profiling(j.id, topic, db)
        score, breakdown = calculate_relevance(j.id, topic, beat, db)
        score_breakdowns[j.id] = breakdown
        
    # 3. Get sorted and filtered results
    query = select(Journalist).where(Journalist.beat == beat)
    all_journalists = db.exec(query).all()
    
    # Strictly filter out journalists who did not mention the topic
    relevant_journalists = [j for j in all_journalists if j.relevance_score > 0]
    sorted_j = sorted(relevant_journalists, key=lambda x: x.relevance_score, reverse=True)[:50]
    
    # 4. Attach Recent Articles and Score Breakdown for UI Display
    results = []
    for j in sorted_j:
        j_dict = j.dict()
        articles = db.exec(select(Article).where(Article.journalist_id == j.id).order_by(Article.published_at.desc())).all()
        j_dict["recent_articles"] = [{"title": a.title, "url": a.url} for a in articles[:15] if a.title] # Fetching more articles for the profile view
        j_dict["score_breakdown"] = score_breakdowns.get(j.id, {})
        results.append(j_dict)
        
    return results

@router.post("/generate-pitch/{journalist_id}")
async def create_detailed_pitch(journalist_id: int, payload: Dict[str, Any], db: Session = Depends(get_session)):
    """Generates strategy-driven AI pitches."""
    topic = payload.get("topic", "Company Announcement")
    tone = payload.get("tone", "Story-driven")
    
    journalist = db.get(Journalist, journalist_id)
    if not journalist:
        raise HTTPException(status_code=404, detail="Journalist not found")
        
    articles = db.exec(select(Article).where(Article.journalist_id == journalist_id)).all()
    
    pitch = generate_ai_pitch(journalist, articles, topic, tone, db)
    return {"pitch": pitch}
