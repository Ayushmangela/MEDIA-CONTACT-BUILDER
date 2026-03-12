import React, { useState, useEffect } from 'react';
import { Network, ExternalLink, User, AlertCircle, Eye, PenTool } from 'lucide-react';

export default function RelatedJournalists({ journalistId, onViewProfile, onPitch }) {
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchRelated = async () => {
            if (!journalistId) return;
            setLoading(true);
            setError(false);
            try {
                const res = await fetch(`http://localhost:8000/api/journalists/${journalistId}/related`);
                if (!res.ok) throw new Error("Fetch failed");
                const json = await res.json();
                setRelated(json);
            } catch (err) {
                console.error("Failed to fetch related journalists:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchRelated();
    }, [journalistId]);

    return (
        <div className="mt-8 pt-8 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-4">
                <Network size={18} className="text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Related Connections</h3>
            </div>
            
            {loading ? (
                <div className="flex flex-col gap-3">
                    {[1, 2].map(i => (
                        <div key={i} className="h-20 bg-slate-50 rounded-xl border border-slate-100 animate-pulse" />
                    ))}
                </div>
            ) : error ? (
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-center gap-3 text-orange-700">
                    <AlertCircle size={18} />
                    <p className="text-xs font-bold uppercase tracking-tight">Failed to load connection data</p>
                </div>
            ) : related.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No significant connections found in this beat</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {related.map((j) => (
                        <div key={j.id} className="group bg-white border border-slate-200 rounded-xl p-4 transition-all hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-50/50">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                        <User size={14} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{j.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{j.outlet}</p>
                                    </div>
                                </div>
                                <div className="bg-indigo-50 px-2 py-0.5 rounded-full text-[10px] font-bold text-indigo-600 border border-indigo-100">
                                    {j.connection_score} Strength
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {j.reasons.map((reason, idx) => (
                                    <span key={idx} className="bg-slate-50 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded-md border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                                        {reason}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => onViewProfile(j.id)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg hover:bg-slate-800 transition-colors"
                                >
                                    <Eye size={12} /> View Profile
                                </button>
                                <button 
                                    onClick={() => onPitch(j)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    <PenTool size={12} /> Draft Pitch
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
