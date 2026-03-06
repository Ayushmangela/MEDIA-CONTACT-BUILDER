import spacy
from sqlmodel import Session, select
from collections import Counter
import os
from ..models.schemas import Journalist, Article

try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    os.system("python -m spacy download en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

def extract_entities(text: str):
    """Deep NLP: Extract Named Entities (Organizations, Geopolitics) from text."""
    if not text:
        return []
    
    doc = nlp(text)
    entities = []
    
    for ent in doc.ents:
        if ent.label_ in ["ORG", "GPE", "PERSON", "EVENT"]:
            # Basic cleanup
            clean_ent = ent.text.replace("'s", "").strip()
            if len(clean_ent) > 2:
                entities.append(clean_ent)
            
    return entities

def run_nlp_profiling(journalist_id: int, db: Session):
    """Analyze a single journalist's corpus to generate an AI Topic Summary profile using spaCy."""
    stmt = select(Article).where(Article.journalist_id == journalist_id)
    articles = db.exec(stmt).all()
    
    if not articles:
        return None
        
    corpus = " ".join([f"{a.title} {a.description}" for a in articles if a.title])
    
    entities = extract_entities(corpus)
    if not entities:
        return "No specific entities identified in recent work."
        
    top_entities = [name for name, count in Counter(entities).most_common(5)]
    
    # Store this rich profile data
    summary = f"Frequently covers topics involving: {', '.join(top_entities)}."
    
    journalist = db.get(Journalist, journalist_id)
    if journalist:
        journalist.ai_summary = summary
        db.add(journalist)
        db.commit()
        
    return summary
