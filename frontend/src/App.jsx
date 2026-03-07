import React, { useState, useEffect } from 'react';
import { Newspaper } from 'lucide-react';
import SearchPanel from './components/SearchPanel';
import JournalistCard from './components/JournalistCard';
import PitchModal from './components/PitchModal';
import ProfileModal from './components/ProfileModal';
import Dashboard from './components/Dashboard';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedJournalist, setSelectedJournalist] = useState(null);

  // State for backend data
  const [journalists, setJournalists] = useState([]);
  const [stats, setStats] = useState({ journalists: 0, articles: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Search state
  const [currentBeat, setCurrentBeat] = useState("environment");
  const [currentTopic, setCurrentTopic] = useState("");

  // Fetch Stats
  useEffect(() => {
    fetch('http://localhost:8000/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Could not fetch stats:", err));
  }, []);

  // Search execution
  const handleSearch = (beatValue, topicValue) => {
    setCurrentBeat(beatValue);
    if (topicValue) setCurrentTopic(topicValue);

    setIsLoading(true);
    fetch(`http://localhost:8000/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ beat: beatValue, topic: topicValue })
    })
      .then(res => res.json())
      .then(data => {
        setJournalists(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Could not fetch journalists:", err);
        setIsLoading(false);
      });
  };

  const handleOpenPitch = (journalist) => {
    setSelectedJournalist(journalist);
    setIsModalOpen(true);
  };

  const handleOpenProfile = (journalist) => {
    setSelectedJournalist(journalist);
    setIsProfileModalOpen(true);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Background Animated Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-12 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-2xl mb-4 text-indigo-600 shadow-sm border border-indigo-200">
            <Newspaper size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-600 tracking-tight">
            Media Contact Builder
          </h1>
          <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto font-medium">
            AI-powered platform to intelligently discover, score, and pitch journalists covering your critical mission areas.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Controls */}
          <div className="lg:col-span-4 space-y-6 animate-slide-up">
            <SearchPanel onSearch={handleSearch} currentBeat={currentBeat} />
            <Dashboard stats={stats} />
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-8 space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex justify-between items-center mb-2 px-1">
              <h2 className="text-xl font-bold text-slate-800">Top Matches</h2>
              <span className="text-sm font-semibold text-slate-500 bg-slate-200 px-3 py-1 rounded-full">{journalists.length} Results</span>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <div className="glass rounded-2xl p-8 text-center text-slate-500 font-medium">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  Analyzing journalist database...
                </div>
              ) : journalists.length === 0 ? (
                <div className="glass rounded-2xl p-8 text-center text-slate-500 font-medium">
                  No journalists found for your search criteria.
                </div>
              ) : (
                journalists.map((j) => (
                  <JournalistCard
                    key={j.id}
                    name={j.name}
                    beat={j.beat}
                    outlet={j.outlet}
                    score={j.relevance_score || 0}
                    tier={j.tier}
                    ai_summary={j.ai_summary}
                    recent_articles={j.recent_articles}
                    score_breakdown={j.score_breakdown}
                    onDraftPitch={() => handleOpenPitch(j)}
                    onViewProfile={() => handleOpenProfile(j)}
                  />
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      <PitchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        journalist={selectedJournalist}
        campaignTopic={currentTopic}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        journalist={selectedJournalist}
      />
    </div>
  );
}

export default App;
