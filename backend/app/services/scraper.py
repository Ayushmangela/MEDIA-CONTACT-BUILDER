import os
import requests
from sqlmodel import Session, select
from datetime import datetime, timedelta
from ..models.schemas import Journalist, Article

NEWS_API_KEY = os.getenv("NEWS_API_KEY")

BEATS_MAP = {
    "animal-welfare": ["animal welfare", "animal rights", "wildlife conservation"],
    "environment": ["climate change", "environment", "sustainability", "global warming"],
    "food-systems": ["food supply", "agriculture", "vegan", "plant-based tech"],
    "science": ["scientific research", "biology", "ecology", "astrophysics"]
}

def fetch_and_store_articles(topic: str, beat_key: str, db: Session):
    """
    Fetches articles from NewsAPI for a given topic and stores them and 
    associated journalists using SQLModel ORM.
    """
    if not NEWS_API_KEY:
        print("API Key missing")
        return {"status": "error", "message": "NewsAPI Key missing"}
        
    query = f'"{topic}"'
    
    # Last 28 days (max for free tier)
    from_date = (datetime.utcnow() - timedelta(days=28)).strftime('%Y-%m-%d')
    url = f"https://newsapi.org/v2/everything?q={query}&from={from_date}&language=en&sortBy=relevancy&pageSize=100&apiKey={NEWS_API_KEY}"
    
    try:
        res = requests.get(url)
        data = res.json()
        
        if data.get("status") != "ok":
            return {"status": "error", "message": data.get("message")}
            
        articles = data.get("articles", [])
        added_articles = 0
        added_journalists = 0
        
        for item in articles:
            author = item.get("author")
            if not author or "http" in author or len(author) > 50:
                continue
                
            source_name = item.get("source", {}).get("name", "Unknown")
            title = item.get("title", "")
            desc = item.get("description", "")
            url = item.get("url", "")
            pub_date_str = item.get("publishedAt", "")
            
            try:
                pub_date = datetime.strptime(pub_date_str, "%Y-%m-%dT%H:%M:%SZ")
            except:
                pub_date = datetime.utcnow()
                
            # 1. Check Journalist
            stmt = select(Journalist).where(Journalist.name == author)
            journalist = db.exec(stmt).first()
            
            if not journalist:
                journalist = Journalist(name=author, outlet=source_name, beat=beat_key)
                db.add(journalist)
                db.commit()
                db.refresh(journalist)
                added_journalists += 1
                
            # 2. Check Article
            stmt_art = select(Article).where(Article.url == url)
            existing_article = db.exec(stmt_art).first()
            
            if not existing_article:
                new_article = Article(
                    title=title, 
                    description=desc, 
                    url=url, 
                    published_at=pub_date,
                    journalist_id=journalist.id
                )
                db.add(new_article)
                added_articles += 1
                
        db.commit()
        return {"status": "success", "journalists_added": added_journalists, "articles_added": added_articles}
        
    except Exception as e:
        print(f"Scraper Error: {e}")
        return {"status": "error", "message": str(e)}
