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

@router.post("/trigger-scrape/{beat}")
def trigger_data_collection(beat: str, background_tasks: BackgroundTasks, db: Session = Depends(get_session)):
    """Non-blocking background scraping job."""
    background_tasks.add_task(run_full_pipeline, beat, db)
    return {"message": f"Background scraping and NLP analysis started for beat: {beat}"}

def run_full_pipeline(beat: str, db: Session):
    """Orchestrates Scrape -> NLP -> Score."""
    print(f"Pipeline Started: {beat}")
    fetch_and_store_articles(beat, db)
    
    # Run NLP & Scoring on newly added journalists
    journalists = db.exec(select(Journalist).where(Journalist.beat == beat)).all()
    for j in journalists:
        run_nlp_profiling(j.id, db)
        calculate_relevance(j.id, db)
    print(f"Pipeline Completed: {beat}")

@router.get("/journalists")
def get_journalists(beat: str = None, db: Session = Depends(get_session)):
    """Fetch highly-scored journalists with their articles and AI summaries."""
    query = select(Journalist)
    if beat:
        query = query.where(Journalist.beat == beat)
        
    journalists = db.exec(query).all()
    
    # Sort in memory for complex ranking
    sorted_j = sorted(journalists, key=lambda x: x.relevance_score, reverse=True)[:50]
    return sorted_j

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
