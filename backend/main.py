from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select, create_engine
import sqlite3
import os

app = FastAPI(title="Media-Contact-Builder API")

# Setup CORS for the React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "../database/journalists.db"

def get_db_connection():
    if not os.path.exists(DB_PATH):
        # Create an empty db file if it doesn't exist
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        open(DB_PATH, 'a').close()
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.get("/")
def read_root():
    return {"message": "Media Contact Builder API is running!"}

@app.get("/api/stats")
def get_stats():
    """Return counts of journalists and articles in the DB."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # We need to make sure tables exist first, handle graceful error if not scraped yet
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='journalists'")
        if not cursor.fetchone():
            return {"journalists": 0, "articles": 0}
            
        cursor.execute("SELECT COUNT(*) FROM journalists")
        j_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM articles")
        a_count = cursor.fetchone()[0]
        
        conn.close()
        return {"journalists": j_count, "articles": a_count}
    except Exception as e:
        print(f"Stats Error: {e}")
        return {"journalists": 0, "articles": 0}

@app.get("/api/journalists")
def get_journalists(beat: str = None):
    """Get a list of journalists, optionally filtered by beat, ordered by relevance."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Ensure table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='journalists'")
        if not cursor.fetchone():
            return []
            
        query = "SELECT * FROM journalists"
        params = []
        
        if beat:
            query += " WHERE beat = ?"
            params.append(beat)
            
        query += " ORDER BY relevance_score DESC LIMIT 50"
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        journalists = [dict(row) for row in rows]
        conn.close()
        return journalists
    except Exception as e:
        print(f"DB Error: {e}")
        return []

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
