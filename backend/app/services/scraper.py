import os
import re
import requests
from bs4 import BeautifulSoup
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
    
    # Last 30 days (max for free tier)
    from_date = (datetime.utcnow() - timedelta(days=30)).strftime('%Y-%m-%d')
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
                
            # 1. OPTIMIZATION: Check Article first so we don't scrape pages we already have
            stmt_art = select(Article).where(Article.url == url)
            existing_article = db.exec(stmt_art).first()
            
            if existing_article:
                continue # Skip the slow deep scrape if we already have it
                
            # Deep scrape content and OSINT Email
            content_text = ""
            extracted_email = None
            if url:
                try:
                    # Short timeout so one bad link doesn't hang the loop
                    # Added User-Agent to prevent sites from blocking the python default agent
                    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
                    page = requests.get(url, headers=headers, timeout=5)
                    soup = BeautifulSoup(page.content, 'html.parser')
                    paragraphs = soup.find_all('p')
                    content_text = "\n".join([p.get_text().strip() for p in paragraphs if p.get_text().strip()])
                    # Truncate to save DB space
                    content_text = content_text[:10000]
                    
                    # OSINT Scan for public emails in the raw HTML
                    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
                    found_emails = re.findall(email_pattern, page.text)
                    
                    # Filter for plausible journalist emails (not mostly image/asset links like @2x.png)
                    for email in found_emails:
                        email_lower = email.lower()
                        # Avoid scraping weird ad-tracker or image domains
                        if ".png" not in email_lower and ".jpg" not in email_lower and "sentry" not in email_lower and "contact" not in email_lower and "info" not in email_lower:
                            extracted_email = email_lower
                            break # Grab the first solid hit
                            
                except Exception as e:
                    print(f"Failed to deep scrape {url}: {e}")
            
            # 2. Check Journalist
            stmt = select(Journalist).where(Journalist.name == author)
            journalist = db.exec(stmt).first()
            
            if not journalist:
                journalist = Journalist(name=author, email=extracted_email, outlet=source_name, beat=beat_key)
                db.add(journalist)
                db.commit()
                db.refresh(journalist)
                added_journalists += 1
            elif extracted_email and not journalist.email:
                # If we found an email this time but didn't have one before, update it
                journalist.email = extracted_email
                db.add(journalist)
                db.commit()
                db.refresh(journalist)
                
            # 3. Save new Article
            new_article = Article(
                title=title, 
                description=desc, 
                content=content_text,
                url=url, 
                published_at=pub_date,
                journalist_id=journalist.id
            )
            try:
                db.add(new_article)
                db.commit()
                added_articles += 1
            except Exception as e:
                db.rollback()
                print(f"Skipping duplicate or invalid article: {url}")
                
        db.commit()
        return {"status": "success", "journalists_added": added_journalists, "articles_added": added_articles}
        
    except Exception as e:
        print(f"Scraper Error: {e}")
        return {"status": "error", "message": str(e)}
