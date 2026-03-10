import React, { useState } from 'react';
import { PenTool, ChevronDown, Building, Tag, CheckCircle, BarChart3, ChevronUp, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function JournalistCard({ journalist, onDraftPitch, onViewProfile, index }) {
    const [expanded, setExpanded] = useState(false);
    const { name, outlet, beat, relevance_score: score, ai_summary, tier, score_breakdown } = journalist;

    const getScoreColor = (s) => {
        if (s >= 80) return "text-emerald-700 bg-emerald-50 border-emerald-200";
        if (s >= 50) return "text-blue-700 bg-blue-50 border-blue-200";
        return "text-gray-700 bg-gray-50 border-gray-200";
    };

    const getTierBadge = (t) => {
        switch (t) {
            case 'Premium': return "bg-amber-100 text-amber-800 border-amber-200";
            case 'Major': return "bg-blue-100 text-blue-800 border-blue-200";
            case 'Niche': return "bg-teal-100 text-teal-800 border-teal-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const contextText = ai_summary
        ? (ai_summary.includes(' | ') ? ai_summary.split(' | ')[0] : ai_summary).split('|||')[0]
        : null;
    const showContext = contextText && !contextText.includes('No specific contextual');

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: typeof index === 'number' ? Math.min(index * 0.05, 0.3) : 0 }}
            className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4"
        >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex-shrink-0 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
                        {name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <button
                                onClick={onViewProfile}
                                className="text-lg font-bold text-gray-900 hover:text-indigo-600 transition-colors text-left"
                            >
                                {name}
                            </button>
                            <span className={`px-2 py-0.5 text-xs font-semibold border rounded-full ${getTierBadge(tier)}`}>
                                {tier}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1.5"><Building size={14} className="text-gray-400" /> {outlet}</span>
                            <span className="flex items-center gap-1.5"><Tag size={14} className="text-gray-400" /> {beat.replace('-', ' ')}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-shrink-0">
                    <div className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-2 text-sm ${getScoreColor(score)}`}>
                        {score >= 80 ? <CheckCircle size={16} /> : <BarChart3 size={16} />}
                        {score}% Match
                    </div>
                </div>
            </div>

            {showContext && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-sm text-slate-700 leading-relaxed shadow-sm">
                    <strong className="font-semibold text-slate-900 mr-2">AI Context:</strong>
                    {contextText}
                </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={onDraftPitch}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        <PenTool size={16} /> Pitch
                    </button>
                    <button
                        onClick={onViewProfile}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <Eye size={16} /> Profile
                    </button>
                </div>

                {score_breakdown && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors ml-auto"
                    >
                        Match Details {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                )}
            </div>

            {score_breakdown && (
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                                <h4 className="font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">Why is this a match?</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-gray-600 max-w-2xl">
                                    <div className="flex justify-between items-center pb-1 border-b border-gray-100 sm:border-0">
                                        <span>Topic Keyword</span>
                                        <span className="font-semibold text-indigo-600">+{score_breakdown.keyword_overlap || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-1 border-b border-gray-100 sm:border-0">
                                        <span>Beat Alignment</span>
                                        <span className="font-semibold text-indigo-600">+{score_breakdown.beat_match || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-1 border-b border-gray-100 sm:border-0">
                                        <span>Recent Volume</span>
                                        <span className="font-semibold text-indigo-600">+{score_breakdown.volume || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Outlet Authority</span>
                                        <span className="font-semibold text-indigo-600">+{score_breakdown.outlet_tier || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </motion.div>
    );
}
