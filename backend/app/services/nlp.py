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

def run_nlp_profiling(journalist_id: int, topic: str, db: Session):
    """Analyze a single journalist's corpus to generate an AI Context Summary using spaCy."""
    stmt = select(Article).where(Article.journalist_id == journalist_id)
    articles = db.exec(stmt).all()
    
    if not articles:
        return None
        
    context_sentences = []
    topic_lower = topic.lower() if topic else ""
    
    for article in articles:
        if len(context_sentences) >= 2:
            break
            
        text = f"{article.title}. {article.description}."
        if not text.strip() or text == ". .":
            continue
            
        # Use spaCy for sentence boundary detection on THIS article
        doc = nlp(text)
        
        for sent in doc.sents:
            sent_text = sent.text.strip().replace("\n", " ")
            if topic_lower and topic_lower in sent_text.lower():
                # Basic cleanup: Ignore very short or weird fragments
                if len(sent_text) > 30:
                    already_exists = any(sent_text in item for item in context_sentences)
                    if not already_exists:
                        # Append sentence and associate its original URL
                        url_str = article.url if article.url else ""
                        context_sentences.append(f"{sent_text}|||{url_str}")
                        if len(context_sentences) >= 2: # Limit to Top 2 Context Sentences
                            break
                            
    if not context_sentences:
        summary = "No specific contextual sentences found for this topic."
    else:
        # Join multiple context hits with a distinct separator
        summary = " | ".join(context_sentences)
        
    journalist = db.get(Journalist, journalist_id)
    if journalist:
        journalist.ai_summary = summary
        db.add(journalist)
        db.commit()
        
    return summary
