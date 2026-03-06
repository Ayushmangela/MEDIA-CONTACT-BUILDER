import os
import sqlite3
import requests
from dotenv import load_dotenv
from datetime import datetime, timedelta

# Load env variables
load_dotenv()
NEWS_API_KEY = os.getenv("NEWS_API_KEY")
DB_PATH = "../database/journalists.db"

# Ensure the database directory exists
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

# Define our beats
BEATS = {
    "animal welfare": ["animal welfare", "animal rights", "wildlife conservation"],
    "environment": ["climate change", "environment", "sustainability"],
    "food systems": ["food supply", "agriculture", "vegan", "plant-based"],
    "science": ["scientific research", "biology", "ecology"]
}

def setup_database():
    """Create SQLite tables if they do not exist."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create Journalists table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS journalists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            outlet TEXT,
            beat TEXT,
            relevance_score INTEGER DEFAULT 0,
            pitch_draft TEXT
        )
    ''')
    
    # Create Articles table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            journalist_id INTEGER,
            title TEXT,
            description TEXT,
            url TEXT,
            published_at TEXT,
            FOREIGN KEY (journalist_id) REFERENCES journalists (id)
        )
    ''')
    
    conn.commit()
    return conn

def fetch_articles_for_beat(beat_name, keywords):
    """Fetch recent articles from NewsAPI based on beat keywords."""
    if not NEWS_API_KEY:
        print("Error: NEWS_API_KEY not found in .env file.")
        return []
        
    query = " OR ".join([f'"{kw}"' for kw in keywords])
    
    # Fetch articles from the last 7 days
    from_date = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
    
    url = f"https://newsapi.org/v2/everything?q={query}&from={from_date}&language=en&sortBy=relevancy&apiKey={NEWS_API_KEY}"
    
    try:
        response = requests.get(url)
        data = response.json()
        
        if data.get("status") == "ok":
            print(f"[{beat_name}] Found {data.get('totalResults')} articles.")
            return data.get("articles", [])
        else:
            print(f"Error fetching from NewsAPI: {data.get('message')}")
            return []
    except Exception as e:
        print(f"Request failed: {e}")
        return []

def store_data(conn, articles, beat_name):
    """Process articles and save journalists + their articles to DB."""
    cursor = conn.cursor()
    count = 0
    
    for article in articles:
        # We only care if there is a named author
        author = article.get("author")
        if not author or "http" in author or len(author) > 50:
            continue
            
        source = article.get("source", {}).get("name", "Unknown")
        title = article.get("title", "")
        desc = article.get("description", "")
        url = article.get("url", "")
        published_at = article.get("publishedAt", "")
        
        # 1. Insert or get Journalist
        cursor.execute("SELECT id FROM journalists WHERE name = ?", (author,))
        result = cursor.fetchone()
        
        if result:
            journalist_id = result[0]
        else:
            cursor.execute(
                "INSERT INTO journalists (name, outlet, beat) VALUES (?, ?, ?)",
                (author, source, beat_name)
            )
            journalist_id = cursor.lastrowid
            
        # 2. Insert Article (if not already exists to prevent duplicate runs)
        cursor.execute("SELECT id FROM articles WHERE url = ?", (url,))
        if not cursor.fetchone():
            cursor.execute(
                "INSERT INTO articles (journalist_id, title, description, url, published_at) VALUES (?, ?, ?, ?, ?)",
                (journalist_id, title, desc, url, published_at)
            )
            count += 1
            
    conn.commit()
    print(f"[{beat_name}] Saved {count} new standard articles to database.")

def main():
    print("Starting Media-Contact-Builder Data Scraper...")
    conn = setup_database()
    
    for beat, keywords in BEATS.items():
        print(f"Fetching articles for: {beat}...")
        articles = fetch_articles_for_beat(beat, keywords)
        
        # Free NewsAPI only returns the first 100 results easily, which is fine for prototype
        store_data(conn, articles, beat)
        
    conn.close()
    print("Scraping complete!")

if __name__ == "__main__":
    main()
