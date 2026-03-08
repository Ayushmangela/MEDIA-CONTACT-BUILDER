from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime

class Journalist(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    email: Optional[str] = None
    outlet: str
    tier: str = Field(default="Standard") # Premium, Standard, Niche
    beat: str
    relevance_score: int = Field(default=0)
    ai_summary: Optional[str] = None
    
    articles: List["Article"] = Relationship(back_populates="journalist")
    pitches: List["Pitch"] = Relationship(back_populates="journalist")

class Article(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    content: Optional[str] = None
    url: str = Field(unique=True)
    published_at: datetime
    
    journalist_id: Optional[int] = Field(default=None, foreign_key="journalist.id")
    journalist: Optional[Journalist] = Relationship(back_populates="articles")

class Pitch(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    campaign_topic: str
    tone: str # Story-driven, Data-heavy, Quick Check-in
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    journalist_id: Optional[int] = Field(default=None, foreign_key="journalist.id")
    journalist: Optional[Journalist] = Relationship(back_populates="pitches")
