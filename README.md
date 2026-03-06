# Media Contact Builder (V2)

An intelligent, AI-powered platform designed for advocacy organizations to intelligently discover, evaluate, and pitch journalists based on semantic resonance and mathematical recency algorithms.

## ✨ V2 "Internship Excellence" Architecture

This application was originally a prototype built on flat scripts. It has been completely rebuilt for production standards to demonstrate senior-level engineering capabilities:

### The Stack
- **Backend**: FastAPI, SQLModel (ORM), BackgroundTasks, Uvicorn
- **Intelligence**: spaCy (Named Entity Recognition), Anthropic Claude 3 Haiku (Generative AI)
- **Database**: SQLite (relational schema spanning Journalists, Articles, Pitches)
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Recharts

---

## 🚀 Core Features

### 1. The Async Intelligence Pipeline
When a user triggers a scrape for a specific beat (e.g., `environment`), FastAPI delegates the heavy lifting to a `BackgroundTask`. 
- **Scraping**: Hits NewsAPI, filtering noise and hydrating the database.
- **Deep NLP Profiling**: Uses `spaCy` to run Named Entity Recognition (NER) on the journalist's recent articles, extracting common Organizations, People, and Geopolitical topics to generate an AI Summary of their exact beat slice.

### 2. Weighted V2 Scoring Engine (`scorer.py`)
Journalists aren't just listed; they are ranked through a mathematical relevancy funnel:
- **Topic Volume Match (50%)**: Assigns weights based on the density of beat-matching articles.
- **Recency Decay (30%)**: Articles published within 24 hours receive 30 points. It decays to 20 points at 3 days, and 10 points at 7 days.
- **Outlet Tier Bonus (20%)**: Employs a simulated tiered media dictionary. If an outlet matches a Tier 1 list (e.g., *NYT, Guardian*), the journalist receives a 20-point prestige bonus.

### 3. Dynamic Strategy Pitching (Anthropic)
Instead of a generic template, users can select a **Pitch Strategy** (Story-driven, Data-heavy, Quick Check-in). The FastAPI backend dynamically restructures the prompt fed to Claude 3, resulting in highly customized, tone-perfect PR pitches.

### 4. Interactive Recharts Dashboard
The frontend isn't just a list; it includes a `Recharts` data visualization dashboard showing the distribution of Journalist Tiers (Premium, Major, Niche) allowing PR teams to understand the gravity of their target list at a glance.

---

## 🛠️ Installation & Setup

### 1. Requirements
- Node.js (v18+)
- Python (3.12+)

### 2. Backend Setup
```bash
cd backend

# Create Virtual Environment
python3 -m venv venv
source venv/bin/activate

# Install Dependencies
pip install fastapi uvicorn sqlmodel requests newsapi-python spacy anthropic python-dotenv

# Download NLP Model
python -m spacy download en_core_web_sm
```

### 3. Environment Variables
Create a `.env` file in the `backend/` directory:
```env
NEWS_API_KEY=your_news_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 4. Running the Application
**Start Backend:**
```bash
cd backend
python3 -m uvicorn main:app --reload
```

**Start Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---
*Built with excellence to demonstrate scalable, full-stack architectural design.*
