import os
from anthropic import Anthropic
from sqlmodel import Session
from ..models.schemas import Pitch, Journalist, Article

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

TONE_PROMPTS = {
    "Story-driven": "Focus deeply on human impact. Connect our campaign to a hypothetical person or animal their readers would care about.",
    "Data-heavy": "Focus on the hard numbers and statistics from our campaign. Journalists love exclusive data sets.",
    "Quick Check-in": "Be extremely brief. This is just a 'hey, are you covering X this month?' type of soft pitch."
}

def generate_ai_pitch(journalist: Journalist, articles: list[Article], campaign_topic: str, tone: str, db: Session):
    """
    V2 Pitch Generation using Claude. Injects dynamic tone strategy.
    """
    if not ANTHROPIC_API_KEY or ANTHROPIC_API_KEY == "your_anthropic_api_key_here":
        return f"Mock {tone} pitch regarding {campaign_topic} for {journalist.name}. (API Key Missing)"
        
    try:
        client = Anthropic(api_key=ANTHROPIC_API_KEY)
        
        recent_titles = "\n- ".join([a.title for a in articles[:3] if a.title])
        tone_instruction = TONE_PROMPTS.get(tone, TONE_PROMPTS["Story-driven"])
        
        prompt = f"""
        You are a top-tier PR professional.
        
        Task: Write a personalized email pitch.
        
        Journalist: {journalist.name}
        Outlet: {journalist.outlet} ({journalist.tier} tier)
        Recent Headlines:
        - {recent_titles}
        
        Campaign: {campaign_topic}
        
        CRITICAL TONE STRATEGY: {tone_instruction}
        
        Instructions:
        1. Keep it under 150 words.
        2. Reference one of their recent articles.
        3. Explain relevance to their beat.
        4. No subject lines. No placeholders except [Your Name].
        """

        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=300,
            temperature=0.7,
            messages=[{"role": "user", "content": prompt}]
        )
        
        content = response.content[0].text
        
        # Save historical pitch record for analysis Dashboard later
        new_pitch = Pitch(
            campaign_topic=campaign_topic,
            tone=tone,
            content=content,
            journalist_id=journalist.id
        )
        db.add(new_pitch)
        db.commit()
        
        return content
        
    except Exception as e:
        print(f"Anthropic API Error: {e}")
        return "Failed to generate pitch via API."
