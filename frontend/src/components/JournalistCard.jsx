import React, { useState } from 'react';
import { PenTool, CheckCircle, TrendingUp, Building2, BrainCircuit, BookOpen, ChevronDown, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function JournalistCard({ name, outlet, beat, score, ai_summary, tier, recent_articles, score_breakdown, onDraftPitch, onViewProfile }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    const isHighMatch = score >= 80;
    const ScoreIcon = isHighMatch ? CheckCircle : TrendingUp;

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group glass rounded-2xl p-5 border border-white/40 shadow-sm hover:shadow-xl hover:border-indigo-100 flex flex-col sm:flex-row gap-5 items-start sm:items-center relative overflow-hidden"
        >
            {/* Tier Badge Ribbon */}
            {tier === "Premium" && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-orange-400 text-white text-[10px] font-black uppercase tracking-widest px-8 py-1 transform translate-x-6 translate-y-2 rotate-45 shadow-sm">
                    Premium
                </div>
            )}

            {tier === "Major" && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-400 to-blue-400 text-white text-[10px] font-black uppercase tracking-widest px-8 py-1 transform translate-x-6 translate-y-2 rotate-45 shadow-sm">
                    Major
                </div>
            )}

            {/* Avatar Section */}
            <div className="flex-shrink-0 relative mt-2 sm:mt-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-inner flex items-center justify-center text-white font-bold text-xl ring-4 ring-white">
                    {initials}
                </div>
                <div className={`absolute -bottom-2 -nav-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-sm flex items-center gap-1 ${isHighMatch ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                    <ScoreIcon size={10} />
                    {score}%
                </div>
            </div>

            {/* Info Section */}
            <div className="flex-grow w-full">
                <button
                    onClick={onViewProfile}
                    className="text-xl font-bold text-slate-800 mb-1 leading-tight group-hover:text-indigo-700 hover:underline transition-colors pr-10 text-left focus:outline-none"
                >
                    {name}
                </button>

                <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
                    <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                        <Building2 size={15} className="text-slate-400" />
                        {outlet}
                    </div>
                    <span className="hidden sm:inline text-slate-300">•</span>
                    <div className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-600 font-medium text-xs border border-slate-200">
                        {beat.replace('-', ' ')}
                    </div>
                </div>

                {/* Score Breakdown Section - Algorithmic Thinking UI */}
                {score_breakdown && (
                    <div className="mt-2 mb-3">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors focus:outline-none group/btn"
                        >
                            <Terminal size={12} className="text-indigo-400" />
                            Why this match?
                            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="text-slate-400 group-hover/btn:text-indigo-500">
                                <ChevronDown size={14} />
                            </motion.div>
                        </button>

                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1, marginTop: "8px" }}
                                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="bg-[#1e1e1e] rounded-xl p-3 border border-slate-700 font-mono text-[11px] leading-relaxed shadow-inner">
                                        <div className="text-slate-400 mb-1">Relevance Score: <span className="text-white font-bold">{score}%</span></div>
                                        <div className="text-slate-500">Score Breakdown:</div>
                                        <div className="text-emerald-400 ml-2">
                                            + {score_breakdown.keyword_overlap || 0}% Topic keyword overlap<br />
                                            + {score_breakdown.beat_match || 0}% Historical beat alignment<br />
                                            + {score_breakdown.volume || 0}% Article volume consistency<br />
                                            + {score_breakdown.outlet_tier || 0}% Publication authority
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* Topic Context Section */}
                {ai_summary && (
                    <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 mt-2 text-sm text-emerald-900/80 flex gap-2">
                        <BrainCircuit size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span className="leading-relaxed">
                            <strong className="font-semibold text-emerald-700">Topic Context:</strong> "
                            {ai_summary.includes(' | ') ? ai_summary.split(' | ')[0].split('|||')[0] + '...' : ai_summary.split('|||')[0]}
                            "
                        </span>
                    </div>
                )}
            </div>

            {/* Action Section */}
            <div className="w-full sm:w-auto mt-2 sm:mt-0">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onDraftPitch}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-indigo-600 font-bold py-2.5 px-6 rounded-xl border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 transition-colors shadow-sm"
                >
                    <PenTool size={18} />
                    Draft Pitch
                </motion.button>
            </div>

        </motion.div>
    );
}
