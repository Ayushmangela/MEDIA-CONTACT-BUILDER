import React, { useState } from 'react';
import { Search, ChevronDown, ArrowRight } from 'lucide-react';

const BEATS = [
    { value: 'environment', label: '🌍 Environment' },
    { value: 'animal-welfare', label: '🐾 Animal Welfare' },
    { value: 'food-systems', label: '🌾 Food Systems' },
    { value: 'science', label: '🔬 Science' },
];

export default function SearchPanel({ onSearch, currentBeat }) {
    const [topic, setTopic] = useState('');
    const [beat, setBeat] = useState(currentBeat);

    const submit = e => { e?.preventDefault(); onSearch(beat, topic); };

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Campaign Query</p>

            <form onSubmit={submit} className="flex flex-col gap-3">
                {/* Topic */}
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg text-slate-900 py-2.5 pl-9 pr-3 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
                        type="text"
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                        placeholder="Campaign topic…"
                    />
                </div>

                {/* Beat */}
                <div className="relative">
                    <select
                        value={beat}
                        onChange={e => setBeat(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg text-slate-900 py-2.5 pl-3 pr-9 text-sm font-medium outline-none appearance-none cursor-pointer focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                    >
                        {BEATS.map(b => (
                            <option key={b.value} value={b.value}>{b.label}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>

                <button type="submit" className="mt-1 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm">
                    <Search size={14} />
                    <span>Find Journalists</span>
                    <ArrowRight size={14} className="ml-1" />
                </button>
            </form>
        </div>
    );
}
