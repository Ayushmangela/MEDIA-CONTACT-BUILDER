# Media-Contact-Builder

An AI-powered application to build journalist profiles, score relevance based on beats, and auto-generate personalized PR pitches. 

## Tech Stack
- **Backend:** Python, FastAPI, SQLite
- **Data Collection:** NewsAPI, `requests`, `spaCy`
- **Generative AI:** Anthropic API (Claude)
- **Frontend:** React (Vite), Tailwind CSS

---

## 🚀 How to Run the Project

You will need two terminal windows open—one for the backend API and one for the frontend React app.

### 1. Prerequisites and API Keys
Before running, you need to add your API keys. Edit the `.env.example` file in the root folder, rename it to `.env`, and fill in your keys:

```ini
NEWS_API_KEY=your_news_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 2. Start the Backend (API Server)
The backend requires Python. In your first terminal:

```bash
cd backend

# Activate the virtual environment
source venv/bin/activate

# Start the FastAPI server on http://localhost:8000
python3 main.py
```

### 3. Run the Data Scraper (Optional but Recommended)
To populate your SQLite database with real journalists from NewsAPI, run the `scraper.py` script while inside the `backend` folder:

```bash
# Ensure your virtual environment is still activated
python3 scraper.py
```
*This will fetch recent articles on your beats and auto-create `database/journalists.db`.*

### 4. Start the Frontend (React App)
The frontend uses Node/npm and runs a local Vite server. Open a **second terminal**:

```bash
cd frontend

# Install packages (only needed once)
npm install

# Start the React development server
npm run dev
```
Open your browser to `http://localhost:5173` to view the app!
