import networkx as nx
from sqlmodel import Session, select
from ..models.schemas import Journalist, Article
from .nlp import extract_entities
from typing import List, Dict, Any
from collections import defaultdict

def build_influence_network(beat: str, db: Session) -> Dict[str, Any]:
    """
    Builds a journalist influence network based on shared entities and citations.
    Returns data in a format suitable for D3/force-directed graphs.
    """
    # 1. Fetch journalists and their articles for the beat
    journalists = db.exec(select(Journalist).where(Journalist.beat == beat)).all()
    j_map = {j.id: j for j in journalists}
    j_ids = list(j_map.keys())
    
    G = nx.Graph()
    
    # Track entity-to-journalist relationships
    entity_to_journalists = defaultdict(set)
    
    # Add nodes and extract entities
    for j in journalists:
        G.add_node(j.id, name=j.name, outlet=j.outlet, score=j.relevance_score)
        
        # Get all articles for this journalist
        articles = db.exec(select(Article).where(Article.journalist_id == j.id)).all()
        
        for art in articles:
            text = f"{art.title} {art.description} {art.content or ''}"
            entities = extract_entities(text)
            for ent in entities:
                entity_to_journalists[ent].add(j.id)
                
            # Citation check: Does another journalist's name appear in the text?
            for other_j in journalists:
                if other_j.id != j.id and other_j.name in text:
                    # Directional citation: J cites Other_J
                    if G.has_edge(j.id, other_j.id):
                        G[j.id][other_j.id]['weight'] += 2
                        G[j.id][other_j.id]['reasons'].add(f"Citation: {other_j.name}")
                    else:
                        G.add_edge(j.id, other_j.id, weight=2, reasons={f"Citation: {other_j.name}"})

    # 2. Create edges based on shared entities
    for entity, j_set in entity_to_journalists.items():
        if len(j_set) > 1:
            j_list = list(j_set)
            for i in range(len(j_list)):
                for k in range(i + 1, len(j_list)):
                    u, v = j_list[i], j_list[k]
                    if G.has_edge(u, v):
                        G[u][v]['weight'] += 1
                        G[u][v]['reasons'].add(f"Shared Source: {entity}")
                    else:
                        G.add_edge(u, v, weight=1, reasons={f"Shared Source: {entity}"})

    # 3. Calculate centrality/influence
    centrality = nx.degree_centrality(G)
    for node_id in G.nodes():
        G.nodes[node_id]['influence'] = round(centrality.get(node_id, 0) * 100, 2)

    # 4. Format for Frontend (JSON)
    nodes = []
    for node_id, data in G.nodes(data=True):
        nodes.append({
            "id": str(node_id),
            "name": data["name"],
            "outlet": data["outlet"],
            "val": data["influence"] + 5, # Minimum size for visibility
            "influence": data["influence"]
        })
        
    links = []
    for u, v, data in G.edges(data=True):
        links.append({
            "source": str(u),
            "target": str(v),
            "weight": data["weight"],
            "reasons": list(data["reasons"])[:3] # Limit to top 3
        })
        
    return {"nodes": nodes, "links": links}

def get_related_journalists(journalist_id: int, db: Session) -> List[Dict[str, Any]]:
    """
    Finds related journalists for a specific journalist based on shared entities and citations.
    Optimized for performance: 
    1. Filter candidates by beat and topic overlap first.
    2. Only deep analyze (spaCy) the most promising candidates.
    3. Cap processed articles per journalist.
    """
    import time
    start_time = time.time()
    
    target_j = db.get(Journalist, journalist_id)
    if not target_j:
        return []
        
    # 1. Get a restricted pool of candidates (Same beat, top 40 for speed)
    candidates = db.exec(
        select(Journalist)
        .where(Journalist.beat == target_j.beat)
        .where(Journalist.id != journalist_id)
        .limit(40) # Safety cap
    ).all()
    
    # 2. Extract entities for target journalist (ONLY ONCE)
    target_articles = db.exec(select(Article).where(Article.journalist_id == journalist_id).limit(3)).all()
    target_entities = set()
    target_text_block = ""
    for art in target_articles:
        text = f"{art.title} {art.description} {art.content or ''}"
        target_entities.update(extract_entities(text))
        target_text_block += text + " "
    
    target_entities = {e.lower() for e in target_entities} # Lowercase for matching
    target_words = set(target_text_block.lower().split())

    related = []
    
    for other_j in candidates:
        if time.time() - start_time > 4.0: # Soft timeout (4s)
            break
            
        score = 0
        reasons = []
        
        # A. Quick Check: Same beat + Outlet match (Base connection)
        if other_j.beat == target_j.beat:
            score += 2
            
        # B. Check Citations (Fast)
        if other_j.name in target_text_block:
            score += 20
            reasons.append(f"Cites {other_j.name}")
            
        # C. Keyword overlap (Fast) - skip detailed NLP if no overlap
        # Get one article to check keywords first
        other_articles = db.exec(select(Article).where(Article.journalist_id == other_j.id).limit(2)).all()
        other_text_block = ""
        for art in other_articles:
            other_text_block += f"{art.title} {art.description} {art.content or ''} "
            
        other_words = set(other_text_block.lower().split())
        common_words = target_words.intersection(other_words)
        meaningful_common = [w for w in common_words if len(w) > 6] # Longer words = better 
        
        if len(meaningful_common) > 2:
            score += 5
            reasons.append(f"Topic overlap: {', '.join(meaningful_common[:2])}")
            
        # D. Deep Entity Check (ONLY if they are already a candidate or overlap)
        if score >= 5:
            other_entities = {e.lower() for e in extract_entities(other_text_block)}
            shared = target_entities.intersection(other_entities)
            if shared:
                score += len(shared) * 10
                reasons.append(f"Shared sources: {', '.join(list(shared)[:2])}")
        
        if score > 2:
            related.append({
                "id": other_j.id,
                "name": other_j.name,
                "outlet": other_j.outlet,
                "connection_score": score,
                "reasons": list(dict.fromkeys(reasons))[:3]
            })
            
    # Sort and return top 5
    related.sort(key=lambda x: x["connection_score"], reverse=True)
    return related[:5]
