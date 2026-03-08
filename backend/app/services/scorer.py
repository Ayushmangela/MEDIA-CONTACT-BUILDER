from sqlmodel import Session, select
from datetime import datetime
from ..models.schemas import Journalist, Article

# Define Tiers for Outlets to assign credibility multipliers
TIER_1_OUTLETS = ["The New York Times", "The Guardian", "Wired", "National Geographic", "Bloomberg", "Reuters", "The Associated Press"]
TIER_2_OUTLETS = ["The Verge", "TechCrunch", "Vox", "Vice", "HuffPost", "Forbes", "Insider"]

def calculate_relevance(journalist_id: int, topic: str, search_beat: str, db: Session):
    """
    V2 Context-Aware Scoring Algorithm:
    - 25% Article Volume (dedication to beat)
    - 35% Beat-campaign match (does this journalist cover your issue?)
    - 25% Keyword overlap (Specificity of topic alignment)
    - 15% Outlet quality (Tier-1 Bonus)
    """
    journalist = db.get(Journalist, journalist_id)
    if not journalist:
        return 0, {}
        
    stmt = select(Article).where(Article.journalist_id == journalist_id)
    articles = db.exec(stmt).all()
    
    if not articles:
        return 0, {}
        
    score = 0
    now = datetime.utcnow()
    
    # 1. Article Count (Volume) - 25 pts Max
    # 5 pts per article up to 5 articles
    volume_score = min(len(articles) * 5, 25)
    score += volume_score
    
    # 2. Beat-Campaign Match - 35 pts Max
    # Does their historical beat match the dropdown beat the user selected?
    beat_score = 35 if journalist.beat == search_beat else 0
    score += beat_score
    
    # 3. Keyword Overlap (Specificity) - 25 pts Max
    # Does their actual article content contain the user's explicit typed topic?
    topic_lower = topic.lower() if topic else ""
    keyword_score = 0
    
    if topic_lower:
        for article in articles:
            title = (article.title or "").lower()
            desc = (article.description or "").lower()
            content = (article.content or "").lower()
            if topic_lower in title or topic_lower in desc or topic_lower in content:
                keyword_score = 25
                break # Just finding one solid overlap maxes this out
                
    # CRITICAL FILTER: If they don't explicitly mention the user's specific campaign topic, drop them entirely.
    if keyword_score == 0 and topic_lower:
        journalist.relevance_score = 0
        db.add(journalist)
        db.commit()
        return 0, {}
        
    score += keyword_score
    
    # 4. Outlet Quality Bonus - 15 pts Max
    tier_score = 5 # Base for regular outlets
    outlet = journalist.outlet or ""
    
    if any(tier in outlet for tier in TIER_1_OUTLETS):
        tier_score = 15
        journalist.tier = "Premium"
    elif any(tier in outlet for tier in TIER_2_OUTLETS):
        tier_score = 10
        journalist.tier = "Major"
    else:
        journalist.tier = "Niche"
        
    score += tier_score
    
    # Finalize db record
    journalist_score = min(score, 100)
    journalist.relevance_score = journalist_score
    db.add(journalist)
    db.commit()
    
    score_breakdown = {
        "volume": volume_score,
        "beat_match": beat_score,
        "keyword_overlap": keyword_score,
        "outlet_tier": tier_score
    }
    
    return journalist_score, score_breakdown
