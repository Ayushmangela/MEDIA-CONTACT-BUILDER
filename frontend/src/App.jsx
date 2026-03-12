import React, { useState, useEffect } from 'react';
import { Newspaper, Search, SearchX, RefreshCw } from 'lucide-react';
import SearchPanel from './components/SearchPanel';
import JournalistCard from './components/JournalistCard';
import PitchModal from './components/PitchModal';
import ProfileModal from './components/ProfileModal';
import logo from './assets/logo.png';

import CampaignSuggestions from './components/CampaignSuggestions';

function App() {
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedJournalist, setSelectedJournalist] = useState(null);
  const [results, setResults] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [beat, setBeat] = useState('environment');
  const [topic, setTopic] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (overrideTopic = null, overrideBeat = null) => {
    const searchTopic = overrideTopic || topic;
    const searchBeat = overrideBeat || beat;
    if (!searchTopic) return;
    
    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch('http://localhost:8000/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ beat: searchBeat, topic: searchTopic }),
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProfile = (j) => {
    setSelectedJournalist(j);
    setShowProfileModal(true);
  };

  const handleSelectRelated = async (id) => {
    const existing = results.find(r => r.id === id);
    if (existing) {
      setSelectedJournalist(existing);
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/api/journalists/${id}?topic=${encodeURIComponent(topic)}&beat=${encodeURIComponent(beat)}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedJournalist(data);
      }
    } catch (err) {
      console.error("Failed to fetch journalist detail:", err);
    }
  };

  const handleDraftPitch = (j) => {
    setSelectedJournalist(j);
    setShowPitchModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Navigation / Header */}
      <nav className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
            <img src={logo} alt="Logo" className="w-full h-full object-contain brightness-0" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-800">Paw<span className="text-indigo-600">Pitch</span></h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">PR Intelligence</p>
          </div>
        </div>
      </nav>

      {/* Main Layout: 2 Columns */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left: Campaign Input & Suggestions */}
        <aside className="w-[380px] border-r border-slate-200 bg-white flex flex-col flex-shrink-0 shadow-sm z-30">
          <div className="p-6 flex flex-col gap-6 overflow-y-auto">
            <div className="flex flex-col gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Campaign Topic</label>
                <input
                  type="text"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 font-medium"
                  placeholder="e.g. Climate change in 2024"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Target Beat</label>
                <select
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium appearance-none"
                  value={beat}
                  onChange={(e) => setBeat(e.target.value)}
                >
                  <option value="environment">Environment</option>
                  <option value="animal-welfare">Animal Welfare</option>
                  <option value="food-systems">Food Systems</option>
                  <option value="science">Science</option>
                </select>
              </div>

              <button
                onClick={() => handleSearch()}
                disabled={isLoading || !topic}
                className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-200"
              >
                {isLoading ? <RefreshCw className="animate-spin" size={18} /> : <Search size={18} />}
                <span>{isLoading ? "Analyzing..." : "Find Journalists"}</span>
              </button>
            </div>

            <CampaignSuggestions currentBeat={beat} onUseSuggestion={(t) => {
              setTopic(t);
              handleSearch(t, beat);
            }} />
          </div>
        </aside>

        {/* Right: Results List */}
        <section className="flex-1 overflow-y-auto bg-slate-50/50 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Best Matches</h2>
                <p className="text-sm font-medium text-slate-500">AI-ranked contacts most likely to cover your topic</p>
              </div>
              {results.length > 0 && (
                <div className="text-xs font-bold px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 shadow-sm">
                  {results.length} found
                </div>
              )}
            </div>

            {results.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 text-center bg-white border border-slate-200 rounded-3xl border-dashed">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
                  <Search size={32} />
                </div>
                <h3 className="text-slate-800 font-bold mb-1">Begin your search</h3>
                <p className="text-sm text-slate-400 max-w-xs mx-auto">Enter a topic and select a beat to discover the best journalist matches.</p>
              </div>
            ) : isLoading ? (
              <LoadingSkeleton />
            ) : (
              <div className="grid grid-cols-1 gap-4 pb-12">
                {results.map((j, idx) => (
                  <JournalistCard
                    key={j.id}
                    journalist={j}
                    index={idx}
                    onDraftPitch={() => handleDraftPitch(j)}
                    onViewProfile={() => handleViewProfile(j)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Modals */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        journalist={selectedJournalist}
        onSelectRelated={handleSelectRelated}
        onPitch={handleDraftPitch}
      />

      <PitchModal
        isOpen={showPitchModal}
        onClose={() => setShowPitchModal(false)}
        journalist={selectedJournalist}
        campaignTopic={topic}
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-12 lg:h-[50vh] text-center rounded-2xl border-2 border-dashed border-slate-200 bg-white">
      <div className="w-20 h-20 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
        <Search size={32} className="text-indigo-500" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-2">Ready to find journalists</h2>
      <p className="text-slate-600 max-w-sm text-sm leading-relaxed">
        Select a campaign topic and beat in the left panel, then hit <strong className="text-slate-800 font-semibold">Find Journalists</strong>.
      </p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 flex items-start gap-4 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          <div className="w-12 h-12 rounded-full bg-slate-100 flex-shrink-0 animate-pulse" />
          <div className="flex-1 space-y-3 py-1">
            <div className="h-4 bg-slate-100 rounded w-1/3 animate-pulse" />
            <div className="h-3 bg-slate-100 rounded w-1/4 animate-pulse" />
            <div className="h-3 bg-slate-100 rounded w-3/4 animate-pulse mt-4" />
          </div>
          <div className="w-24 h-10 bg-slate-100 rounded-lg flex-shrink-0 animate-pulse" />
        </div>
      ))}
      <p className="text-center text-slate-500 text-sm font-medium mt-6 animate-pulse">Running AI scoring pipeline…</p>
    </div>
  );
}

function NoResults() {
  return (
    <div className="flex flex-col items-center justify-center p-12 lg:h-[50vh] text-center rounded-2xl border-2 border-dashed border-slate-200 bg-white">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
        <SearchX size={28} />
      </div>
      <p className="text-base font-bold text-slate-800 mb-1">No journalists matched your search.</p>
      <p className="text-sm text-slate-500">Try a broader topic or a different beat.</p>
    </div>
  );
}

export default App;
