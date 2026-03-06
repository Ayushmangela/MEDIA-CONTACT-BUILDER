import React from 'react';
import { PenTool, CheckCircle, TrendingUp, Building2, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

export default function JournalistCard({ name, outlet, beat, score, ai_summary, tier, onDraftPitch }) {
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
                    {score}
                </div>
            </div>

            {/* Info Section */}
            <div className="flex-grow w-full">
                <h3 className="text-xl font-bold text-slate-800 mb-1 leading-tight group-hover:text-indigo-700 transition-colors pr-10">
                    {name}
                </h3>

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

                {/* AI Insight Section */}
                {ai_summary && (
                    <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 mt-2 text-sm text-indigo-900/80 flex gap-2">
                        <BrainCircuit size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                        <span className="leading-relaxed">
                            <strong className="font-semibold text-indigo-700">AI Profiler:</strong> {ai_summary}
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
