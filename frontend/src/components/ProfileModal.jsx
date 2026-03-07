import React from 'react';
import { X, Building2, BookOpen, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfileModal({ isOpen, onClose, journalist }) {
    if (!journalist) return null;

    const initials = journalist.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    // Parse AI Summary into bullet points if it's the standard structured output
    const contextSnippets = journalist.ai_summary
        ? journalist.ai_summary.split(" | ").filter(s => s.trim() !== "" && s !== "No specific contextual sentences found for this topic.")
        : [];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-700 text-slate-300 font-mono text-sm"
                    >
                        {/* Header mimicking a terminal title bar */}
                        <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            </div>
                            <div className="text-slate-400 text-xs font-bold tracking-widest">PROFILER_VIEW.EXE</div>
                            <button
                                onClick={onClose}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">

                            {/* Top Identity Block */}
                            <div>
                                <span className="text-indigo-400">Journalist:</span> <span className="text-white font-bold text-base">{journalist.name}</span><br />
                                <span className="text-indigo-400">Publication:</span> <span className="text-slate-300">{journalist.outlet}</span><br />
                                <span className="text-indigo-400">Primary Beat:</span> <span className="text-slate-300 capitalize">{journalist.beat.replace('-', ' ')}</span>
                            </div>

                            {/* Topic Context Block */}
                            <div>
                                <div className="text-emerald-400 mb-2">Extracted Topic Context:</div>
                                {contextSnippets.length > 0 ? (
                                    <div className="space-y-3">
                                        {contextSnippets.map((snippet, i) => {
                                            const parts = snippet.split('|||');
                                            const text = parts[0];
                                            const url = parts.length > 1 ? parts[1] : null;

                                            return (
                                                <div key={i} className="pl-3 border-l-2 border-emerald-500/50 text-slate-400 italic bg-emerald-950/20 py-1.5 pr-2 rounded-r-md">
                                                    "{text}"
                                                    {url && (
                                                        <div className="mt-1">
                                                            <a
                                                                href={url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-emerald-400 hover:text-emerald-300 text-xs not-italic hover:underline transition-colors"
                                                            >
                                                                Read source article →
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="pl-4 text-slate-500 italic">{journalist.ai_summary || "No specific contextual sentences found for this topic."}</div>
                                )}
                            </div>

                            {/* Score Breakdown Block */}
                            {journalist.score_breakdown && (
                                <div>
                                    <div className="text-amber-400 mb-1">Algorithmic Relevance ({journalist.relevance_score || 0}%):</div>
                                    <ul className="pl-4 space-y-1">
                                        <li><span className="text-indigo-400">+{journalist.score_breakdown.keyword_overlap || 0}%</span> Topic keyword overlap</li>
                                        <li><span className="text-indigo-400">+{journalist.score_breakdown.beat_match || 0}%</span> Historical beat match</li>
                                        <li><span className="text-indigo-400">+{journalist.score_breakdown.volume || 0}%</span> Article volume weight</li>
                                        <li><span className="text-indigo-400">+{journalist.score_breakdown.outlet_tier || 0}%</span> Publication authority</li>
                                    </ul>
                                </div>
                            )}

                            {/* Recent Articles Block */}
                            <div>
                                <div className="text-cyan-400 mb-1">Recent Articles ({journalist.recent_articles?.length || 0}):</div>
                                {journalist.recent_articles && journalist.recent_articles.length > 0 ? (
                                    <ul className="pl-4 space-y-2">
                                        {journalist.recent_articles.map((article, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <span className="text-slate-500 mt-0.5">{i + 1}.</span>
                                                <a
                                                    href={article.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:text-cyan-300 hover:underline transition-colors"
                                                >
                                                    {article.title}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="pl-4 text-slate-500 italic">No recent articles found.</div>
                                )}
                            </div>

                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
