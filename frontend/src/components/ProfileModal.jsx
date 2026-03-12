import React from 'react';
import { X, Building, BookOpen, BrainCircuit, ExternalLink, Tag, CheckCircle, Clock, PenTool } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PitchPredictor from './PitchPredictor';
import RelatedJournalists from './RelatedJournalists';

export default function ProfileModal({ isOpen, onClose, journalist, onSelectRelated, onPitch }) {
    if (!journalist || !isOpen) return null;
    
    const name = journalist.name || 'Unknown Journalist';
    const initials = name
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || '??';

    const snippets = (journalist.ai_summary || '')
        .split(' | ')
        .filter(s => s.trim() && !s.includes('No specific'));

    const bd = journalist.score_breakdown;
    const bars = bd ? [
        { label: 'Keyword Match', val: bd.keyword_overlap || 0, color: 'bg-violet-500', text: 'text-violet-700' },
        { label: 'Beat Alignment', val: bd.beat_match || 0, color: 'bg-blue-500', text: 'text-blue-700' },
        { label: 'Article Volume', val: bd.volume || 0, color: 'bg-emerald-500', text: 'text-emerald-700' },
        { label: 'Outlet Authority', val: bd.outlet_tier || 0, color: 'bg-amber-500', text: 'text-amber-700' },
    ] : [];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 opacity-100 transition-opacity">
                    <motion.div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 20 }}
                        className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
                    >
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between gap-4 flex-shrink-0 bg-slate-50/50">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl flex-shrink-0 border-2 border-white shadow-sm">
                                    {initials}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-1">{name}</h2>
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 font-medium">
                                        <span className="flex items-center gap-1.5"><Building size={16} />{journalist.outlet}</span>
                                        <span className="flex items-center gap-1.5 capitalize"><Tag size={16} />{(journalist.beat || '').replace('-', ' ')}</span>
                                    </div>
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Relevance Score</span>
                                        <span className="text-sm font-bold px-2 py-0.5 rounded-full text-emerald-700 bg-emerald-50 border border-emerald-200 flex items-center gap-1">
                                            <CheckCircle size={14} /> {journalist.relevance_score || 0}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => onPitch(journalist)}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                                >
                                    <PenTool size={16} /> Draft Pitch
                                </button>
                                <button className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors flex-shrink-0" onClick={onClose}>
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 bg-white">

                            {/* Score bars */}
                            {bars.length > 0 && (
                                <section>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Score Breakdown</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {bars.map(({ label, val, color, text }) => (
                                            <div key={label} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{label}</span>
                                                    <span className={`text-sm font-black ${text}`}>+{val}%</span>
                                                </div>
                                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                                    <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${(val / 100) * 100}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* AI Context */}
                            {snippets.length > 0 && (
                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <BrainCircuit size={18} className="text-indigo-500" />
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Topic Context</p>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        {snippets.map((raw, i) => {
                                            const [text, url] = raw.split('|||');
                                            return (
                                                <div key={i} className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                                                    <p className="text-sm text-emerald-900 leading-relaxed italic font-medium">"{text}"</p>
                                                    {url && (
                                                        <a href={url} target="_blank" rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors"
                                                        >
                                                            <ExternalLink size={14} /> Read source article
                                                        </a>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}

                            {/* Pitch Prediction */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <Clock size={18} className="text-violet-500" />
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Best Time to Pitch</p>
                                </div>
                                <PitchPredictor prediction={journalist.pitch_prediction} />
                            </section>

                            {/* Articles */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <BookOpen size={18} className="text-blue-500" />
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent Articles</p>
                                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                                        {journalist.recent_articles?.length || 0}
                                    </span>
                                </div>
                                {journalist.recent_articles?.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                        {journalist.recent_articles.map((a, i) => (
                                            <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                                                className="group flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all text-decoration-none"
                                            >
                                                <span className="text-sm font-bold text-slate-300 tabular-nums pt-0.5 group-hover:text-blue-300">
                                                    {String(i + 1).padStart(2, '0')}
                                                </span>
                                                <p className="text-sm font-semibold text-slate-700 leading-snug flex-1 group-hover:text-slate-900">{a.title}</p>
                                                <ExternalLink size={16} className="text-slate-400 group-hover:text-blue-500 mt-0.5 flex-shrink-0" />
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500 italic bg-slate-50 p-4 rounded-xl border border-slate-100">No recent articles found.</p>
                                )}
                            </section>

                            {/* Related Connections */}
                            <RelatedJournalists 
                                journalistId={journalist.id} 
                                onViewProfile={onSelectRelated}
                                onPitch={onPitch}
                            />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
