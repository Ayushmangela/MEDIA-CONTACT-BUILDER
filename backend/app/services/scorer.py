from sqlmodel import Session, select
from datetime import datetime
from ..models.schemas import Journalist, Article

# Define Tiers for Outlets to assign credibility multipliers
TIER_1_OUTLETS = ["The New York Times", "The Guardian", "Wired", "National Geographic", "Bloomberg", "Reuters", "The Associated Press"]
TIER_2_OUTLETS = ["The Verge", "TechCrunch", "Vox", "Vice", "HuffPost", "Forbes", "Insider"]

def calculate_relevance(journalist_id: int, db: Session):
    """
    V2 Scoring Algorithm:
    - 30% Recency Decay
    - 50% Topic Match (Volume)
    - 20% Outlet Tier Bonus
    """
    journalist = db.get(Journalist, journalist_id)
    if not journalist:
        return 0
        
    stmt = select(Article).where(Article.journalist_id == journalist_id)
    articles = db.exec(stmt).all()
    
    if not articles:
        return 0
        
    score = 0
    now = datetime.utcnow()
    
    # 1. Topic Match Volume (up to 50 points)
    # We assign 10 points per article covering the beat, maxing out at 5.
    volume_score = min(len(articles) * 10, 50)
    score += volume_score
    
    # 2. Recency Decay (up to 30 points)
    # The most recent article determines this score.
    # Published today/yesterday = 30 pts. Decays rapidly.
    recency_score = 0
    for article in articles:
        try:
            delta = now - article.published_at
            days = delta.days
            if days <= 1:
                recency_score = max(recency_score, 30)
            elif days <= 3:
                recency_score = max(recency_score, 20)
            elif days <= 7:
                recency_score = max(recency_score, 10)
        except:
            pass
            
    score += recency_score
    
    # 3. Outlet Tier Bonus (up to 20 points)
    tier_score = 5 # Base for niche/unknown
    outlet = journalist.outlet
    
    if any(tier in outlet for tier in TIER_1_OUTLETS):
        tier_score = 20
        journalist.tier = "Premium"
    elif any(tier in outlet for tier in TIER_2_OUTLETS):
        tier_score = 10
        journalist.tier = "Major"
    else:
        journalist.tier = "Niche"
        
    score += tier_score
    
    # Update Record in db
    journalist.relevance_score = min(score, 100)
    db.add(journalist)
    db.commit()
    
    return journalist.relevance_score
