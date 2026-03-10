import React, { useState, useEffect } from 'react';
import { Zap, Newspaper, Search, SearchX } from 'lucide-react';
import SearchPanel from './components/SearchPanel';
import JournalistCard from './components/JournalistCard';
import PitchModal from './components/PitchModal';
import ProfileModal from './components/ProfileModal';
import Dashboard from './components/Dashboard';
import CampaignSuggestions from './components/CampaignSuggestions';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedJournalist, setSelectedJournalist] = useState(null);
  const [journalists, setJournalists] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentBeat, setCurrentBeat] = useState('environment');
  const [currentTopic, setCurrentTopic] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8000/api/stats')
      .then(r => r.json()).then(setStats)
      .catch(() => { });
  }, []);

  const handleSearch = (beat, topic) => {
    setCurrentBeat(beat);
    if (topic) setCurrentTopic(topic);
    setIsLoading(true);
    setHasSearched(true);
    fetch('http://localhost:8000/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ beat, topic }),
    })
      .then(r => r.json())
      .then(d => { setJournalists(d); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">

      {/* ── TOP NAV BAR ─────────────────────────────────── */}
      <header className="h-16 px-6 sm:px-8 border-b border-slate-200 bg-white sticky top-0 z-20 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
            <Zap size={20} className="text-white fill-current" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">Media Contact Builder</h1>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">AI Journalist Intelligence</p>
          </div>
        </div>
      </header>

      {/* ── 3-COLUMN MAIN LAYOUT ────────────────────────── */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 relative">

        {/* Left Column: Search & Suggestions */}
        <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-6 lg:sticky lg:top-[5.5rem] lg:h-[calc(100vh-8rem)] lg:overflow-y-auto pb-4">
          <SearchPanel onSearch={handleSearch} currentBeat={currentBeat} />
          <CampaignSuggestions currentBeat={currentBeat} onUseSuggestion={(topic) => {
            setCurrentTopic(topic);
            handleSearch(currentBeat, topic);
          }} />
        </div>

        {/* Center Column: Results */}
        <div className="flex-1 min-w-0 flex flex-col pt-2 lg:pt-0">
          <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4 shrink-0">
            <div className="flex items-center gap-3">
              <Newspaper size={20} className="text-indigo-600" />
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-800">Top Matches</h2>
                {currentTopic && (
                  <span className="text-sm text-slate-500 font-medium flex items-center gap-1.5 hidden sm:flex">
                    <span className="text-slate-300">•</span> for <span className="text-indigo-600 font-semibold">"{currentTopic}"</span>
                  </span>
                )}
              </div>
            </div>
            {hasSearched && !isLoading && (
              <div className="bg-white text-slate-600 px-3 py-1 rounded-full text-xs font-bold border border-slate-200 shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {journalists.length} results
              </div>
            )}
          </div>

          <div className="pb-10">
            {!hasSearched ? (
              <EmptyState />
            ) : isLoading ? (
              <LoadingSkeleton />
            ) : journalists.length === 0 ? (
              <NoResults />
            ) : (
              <div className="flex flex-col gap-4">
                {journalists.map((j, i) => (
                  <JournalistCard
                    key={j.id}
                    index={i}
                    journalist={j}
                    onDraftPitch={() => { setSelectedJournalist(j); setIsModalOpen(true); }}
                    onViewProfile={() => { setSelectedJournalist(j); setIsProfileOpen(true); }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Dashboard */}
        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6 lg:sticky lg:top-[5.5rem] lg:h-[calc(100vh-8rem)] lg:overflow-y-auto pb-4 pt-4 border-t lg:border-t-0 lg:pt-0 border-slate-200">
          <Dashboard stats={stats} />
        </div>

      </main>

      <PitchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} journalist={selectedJournalist} campaignTopic={currentTopic} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} journalist={selectedJournalist} />
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
