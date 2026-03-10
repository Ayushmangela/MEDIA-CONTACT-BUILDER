import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, TrendingUp, Clock, Leaf, ChevronRight } from 'lucide-react';

const URGENCY = {
    high: { dotClass: 'bg-rose-500', badgeClass: 'bg-rose-100 text-rose-700 border-rose-200', label: 'Trending', Icon: TrendingUp },
    medium: { dotClass: 'bg-amber-500', badgeClass: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Good Timing', Icon: Clock },
    low: { dotClass: 'bg-emerald-500', badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Evergreen', Icon: Leaf },
};
const SRC = { live_data: 'Live', curated: 'Pick', history: 'Past' };

export default function CampaignSuggestions({ currentBeat, onUseSuggestion }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(false);

    const load = () => {
        setLoading(true); setErr(false);
        fetch(`http://localhost:8000/api/campaign-suggestions?beat=${encodeURIComponent(currentBeat)}`)
            .then(r => { if (!r.ok) throw 0; return r.json(); })
            .then(d => { setData(d); setLoading(false); })
            .catch(() => { setErr(true); setLoading(false); });
    };

    useEffect(load, [currentBeat]);

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                        <Sparkles size={12} className="text-indigo-600" />
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Suggestions</p>
                </div>
                <button
                    onClick={load}
                    className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {loading ? (
                <div className="flex gap-2 items-center text-slate-500 text-xs font-medium py-2">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-200 border-t-indigo-600 animate-spin" />
                    Analyzing trends…
                </div>
            ) : err ? (
                <p className="text-xs text-slate-500">Could not load suggestions.</p>
            ) : (
                <div className="flex flex-col gap-3">
                    {data.map((s, i) => {
                        const u = URGENCY[s.urgency] || URGENCY.medium;
                        return (
                            <div key={i} className="group p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-colors cursor-default">
                                {/* Topic + badge */}
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${u.dotClass}`} />
                                        <p className="text-xs font-bold text-slate-900 truncate capitalize">
                                            {s.topic}
                                        </p>
                                    </div>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0 ${u.badgeClass}`}>
                                        {u.label}
                                    </span>
                                </div>

                                {/* Reason */}
                                <p className="text-[11px] text-slate-500 leading-snug mb-3 pl-3.5">{s.reason}</p>

                                {/* Footer */}
                                <div className="flex items-center justify-between pl-3.5">
                                    <div className="flex items-center gap-2">
                                        {s.journalist_count > 0 && (
                                            <span className="text-[10px] text-slate-500 font-medium">
                                                <span className="text-slate-800 font-bold">{s.journalist_count}</span> journos
                                            </span>
                                        )}
                                        {s.source && (
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-400 uppercase tracking-wide">
                                                {SRC[s.source] || s.source}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => onUseSuggestion(s.topic)}
                                        className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                                    >
                                        Use <ChevronRight size={12} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
