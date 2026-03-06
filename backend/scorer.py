import sqlite3
import os
from datetime import datetime

DB_PATH = "../database/journalists.db"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def calculate_relevance_scores():
    """Score journalists based on recent activity and beat alignment."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Ensure tables exist
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='articles'")
    if not cursor.fetchone():
        print("Database not populated. Run scraper.py first.")
        return
        
    cursor.execute("SELECT id, name, beat FROM journalists")
    journalists = cursor.fetchall()
    
    print(f"Scoring {len(journalists)} journalists...")
    
    updates = 0
    for journalist in journalists:
        j_id = journalist['id']
        j_beat = journalist['beat']
        
        cursor.execute("SELECT title, published_at FROM articles WHERE journalist_id = ?", (j_id,))
        articles = cursor.fetchall()
        
        if not articles:
            continue
            
        score = 0
        
        # 1. Base Score: Having articles gives points up to a limit
        score += min(len(articles) * 10, 40)
        
        # 2. Recency Score
        # Add points if they published in the last 48 hours
        try:
            now = datetime.now()
            for article in articles:
                pub_date_str = article['published_at']
                if pub_date_str:
                    # NewsAPI format: 2026-03-05T12:00:00Z
                    pub_date = datetime.strptime(pub_date_str[:10], '%Y-%m-%d')
                    delta = now - pub_date
                    if delta.days <= 2:
                        score += 5
                    elif delta.days <= 7:
                        score += 2
        except Exception as e:
            print(f"Date parsing error: {e}")
            
        # 3. Beat Match: Extra points if their title directly mentions the beat keyword
        keywords = j_beat.split()
        for article in articles:
            title = article['title'].lower() if article['title'] else ""
            for kw in keywords:
                if kw in title:
                    score += 15
                    
        # Cap score at 100
        final_score = min(score, 100)
        
        # Update DB
        cursor.execute("UPDATE journalists SET relevance_score = ? WHERE id = ?", (final_score, j_id))
        updates += 1
        
    conn.commit()
    conn.close()
    print(f"Successfully scored {updates} journalists based on relevance algorithms.")

if __name__ == "__main__":
    calculate_relevance_scores()
