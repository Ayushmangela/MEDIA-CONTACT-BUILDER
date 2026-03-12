import React, { useState } from 'react';
import { PenTool, Building, Tag, CheckCircle, BarChart3, Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BREAKDOWN_LABELS = {
    keyword_overlap: { label: 'Topic Keyword Match', max: 25, desc: 'How closely their articles mention your exact campaign topic.' },
    beat_match: { label: 'Beat Alignment', max: 35, desc: 'Whether their coverage beat matches the campaign category.' },
    volume: { label: 'Article Volume', max: 25, desc: 'How many recent articles they have written on this beat.' },
    outlet_tier: { label: 'Outlet Authority', max: 15, desc: 'Quality and reach of their publication.' },
};

function ScoreBar({ value, max, color }) {
    const pct = Math.round((value / max) * 100);
    return (
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className={`h-2 rounded-full ${color}`}
            />
        </div>
    );
}

export default function JournalistCard({ journalist, onDraftPitch, onViewProfile, index }) {
    const [showBreakdown, setShowBreakdown] = useState(false);
    const { name, outlet, beat, relevance_score: score, ai_summary, tier, score_breakdown } = journalist;

    const getScoreColor = (s) => {
        if (s >= 80) return { badge: 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100', bar: 'bg-emerald-500' };
        if (s >= 50) return { badge: 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100', bar: 'bg-blue-500' };
        return { badge: 'text-gray-700 bg-gray-50 border-gray-200 hover:bg-gray-100', bar: 'bg-gray-400' };
    };

    const getTierBadge = (t) => {
        switch (t) {
            case 'Premium': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'Major': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Niche': return 'bg-teal-100 text-teal-800 border-teal-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const colors = getScoreColor(score);
    const contextText = ai_summary
        ? (ai_summary.includes(' | ') ? ai_summary.split(' | ')[0] : ai_summary).split('|||')[0]
        : null;
    const showContext = contextText && !contextText.includes('No specific contextual');
    const totalMax = Object.values(BREAKDOWN_LABELS).reduce((s, v) => s + v.max, 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: typeof index === 'number' ? Math.min(index * 0.05, 0.3) : 0 }}
            className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4"
        >
            {/* Header row */}
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

                {/* Clickable score badge */}
                <button
                    onClick={() => score_breakdown && setShowBreakdown(prev => !prev)}
                    title={score_breakdown ? 'Click to see match breakdown' : undefined}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg border font-bold flex items-center gap-2 text-sm transition-colors ${colors.badge} ${score_breakdown ? 'cursor-pointer' : 'cursor-default'}`}
                >
                    {score >= 80 ? <CheckCircle size={16} /> : <BarChart3 size={16} />}
                    {score}% Match
                </button>
            </div>

            {/* AI context strip */}
            {showContext && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-sm text-slate-700 leading-relaxed shadow-sm">
                    <strong className="font-semibold text-slate-900 mr-2">AI Context:</strong>
                    {contextText}
                </div>
            )}

            {/* Score breakdown panel */}
            <AnimatePresence>
                {showBreakdown && score_breakdown && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                            {/* Panel header */}
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">Why {score}% Match?</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">Score out of {totalMax} possible points</p>
                                </div>
                                <button
                                    onClick={() => setShowBreakdown(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Score rows */}
                            <div className="flex flex-col gap-3.5">
                                {Object.entries(BREAKDOWN_LABELS).map(([key, { label, max, desc }]) => {
                                    const val = score_breakdown[key] ?? 0;
                                    const earned = val > 0;
                                    return (
                                        <div key={key}>
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${earned ? colors.bar : 'bg-gray-300'}`} />
                                                    <span className="text-sm font-medium text-gray-800">{label}</span>
                                                </div>
                                                <span className={`text-sm font-bold tabular-nums ${earned ? 'text-indigo-600' : 'text-gray-400'}`}>
                                                    {val} / {max}
                                                </span>
                                            </div>
                                            <ScoreBar value={val} max={max} color={earned ? colors.bar : 'bg-gray-300'} />
                                            <p className="text-xs text-gray-500 mt-1 ml-4">{desc}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Action buttons */}
            <div className="flex items-center gap-3 mt-2 pt-4 border-t border-gray-100">
                <button
                    onClick={onDraftPitch}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <PenTool size={16} /> Pitch
                </button>
                <button
                    onClick={onViewProfile}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <Eye size={16} /> Profile
                </button>
            </div>
        </motion.div>
    );
}
