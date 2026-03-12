from sqlmodel import Session, select
from ..models.schemas import Article
from typing import List, Dict, Any
from datetime import datetime
from collections import Counter

def get_pitch_prediction(journalist_id: int, db: Session) -> Dict[str, Any]:
    """
    Analyzes historical article publication timestamps to predict optimal pitching times.
    """
    articles = db.exec(select(Article).where(Article.journalist_id == journalist_id)).all()
    
    if not articles:
        return {
            "active_days": [],
            "active_hours": [],
            "optimal_window": "Unknown",
            "deadline_risk": "Unknown",
            "message": "Insufficient data for prediction"
        }

    # Extract days and hours
    # Monday=0, Sunday=6
    days = [a.published_at.weekday() for a in articles]
    hours = [a.published_at.hour for a in articles]

    day_counts = Counter(days)
    hour_counts = Counter(hours)

    # Map day indices to names
    day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    
    # Active days (formatted for frontend)
    active_days = [{"day": day_names[i], "count": day_counts.get(i, 0)} for i in range(7)]
    
    # Active hours (full 24h distribution)
    active_hours = [{"hour": h, "count": hour_counts.get(h, 0)} for h in range(24)]

    # Identify peak hour
    if hour_counts:
        peak_hour = hour_counts.most_common(1)[0][0]
        peak_display = f"{peak_hour:02d}:00"
        
        # Optimal window: 1 hour before peak to peak hour
        optimal_window = f"{(peak_hour - 1) % 24:02d}:00 - {peak_display}"
        
        # Deadline risk: 2 hours leading up to peak
        deadline_risk = f"{(peak_hour - 2) % 24:02d}:00 - {peak_display}"
    else:
        optimal_window = "9:00 - 11:00 (Global Avg)"
        deadline_risk = "Afternoon"

    return {
        "active_days": active_days,
        "active_hours": active_hours,
        "optimal_window": optimal_window,
        "deadline_risk": deadline_risk,
        "total_articles_analyzed": len(articles)
    }
