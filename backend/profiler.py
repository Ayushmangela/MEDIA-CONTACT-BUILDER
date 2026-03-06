import sqlite3
import spacy
from collections import Counter
import os

DB_PATH = "../database/journalists.db"

# Load spaCy NLP model
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("Downloading spaCy model en_core_web_sm...")
    os.system("python -m spacy download en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def extract_keywords(text):
    """Use spaCy to extract meaningful keywords (nouns, proper nouns) from text."""
    if not text:
        return []
        
    doc = nlp(text)
    keywords = []
    
    for token in doc:
        # We want meaningful words: NOUNs, PROPNs, ignore stop words and punctuation
        if token.pos_ in ["NOUN", "PROPN"] and not token.is_stop and not token.is_punct:
            keywords.append(token.lemma_.lower())
            
    return keywords

def profile_journalists():
    """Analyze all articles by a journalist to build a comprehensive profile."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='articles'")
    if not cursor.fetchone():
        print("Database not populated. Run scraper.py first.")
        return
        
    cursor.execute("SELECT id, name FROM journalists")
    journalists = cursor.fetchall()
    
    print(f"Profiling {len(journalists)} journalists using spaCy...")
    
    for journalist in journalists:
        j_id = journalist['id']
        j_name = journalist['name']
        
        # Get all their articles
        cursor.execute("SELECT title, description FROM articles WHERE journalist_id = ?", (j_id,))
        articles = cursor.fetchall()
        
        all_text = " ".join([f"{a['title']} {a['description']}" for a in articles if a['title'] or a['description']])
        
        if not all_text:
            continue
            
        # Extract keywords using NLP
        keywords = extract_keywords(all_text)
        
        # Get the top 5 most common themes
        if keywords:
            most_common = Counter(keywords).most_common(5)
            top_themes = [word for word, count in most_common]
            
            # For this prototype, we'll store these themes in a new column (if we alter the DB) 
            # or just print them to demonstrate NLP capability.
            print(f"\n[Profile] {j_name}")
            print(f"Top Themes: {', '.join(top_themes)}")
            print(f"Article Count: {len(articles)}")
            
    conn.close()
    print("\nProfiling complete!")

if __name__ == "__main__":
    profile_journalists()
