import React from 'react';
import { PenTool, CheckCircle, TrendingUp, Building2 } from 'lucide-react';

export default function JournalistCard({ name, outlet, beat, score, onDraftPitch }) {
    // Generate initials for the avatar
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    // Dynamic color for score
    const isHighMatch = score >= 90;
    const scoreBadgeColor = isHighMatch
        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
        : 'bg-amber-100 text-amber-700 border-amber-200';

    // Dynamic icon for score
    const ScoreIcon = isHighMatch ? CheckCircle : TrendingUp;

    return (
        <div className="group glass rounded-2xl p-5 border border-white/40 shadow-md hover:shadow-xl hover:border-indigo-100 transition-all duration-300 transform hover:-translate-y-1 flex flex-col sm:flex-row gap-5 items-start sm:items-center">

            {/* Avatar Section */}
            <div className="flex-shrink-0 relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-inner flex items-center justify-center text-white font-bold text-xl ring-4 ring-white">
                    {initials}
                </div>
                <div className={`absolute -bottom-2 -nav-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-sm flex items-center gap-1 ${isHighMatch ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                    <ScoreIcon size={10} />
                    {score}
                </div>
            </div>

            {/* Info Section */}
            <div className="flex-grow">
                <h3 className="text-xl font-bold text-slate-800 mb-1 leading-tight group-hover:text-indigo-700 transition-colors">
                    {name}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                        <Building2 size={15} className="text-slate-400" />
                        {outlet}
                    </div>
                    <span className="hidden sm:inline text-slate-300">•</span>
                    <div className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-600 font-medium text-xs border border-slate-200">
                        {beat}
                    </div>
                </div>
            </div>

            {/* Action Section */}
            <div className="w-full sm:w-auto mt-2 sm:mt-0">
                <button
                    onClick={onDraftPitch}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-indigo-600 font-bold py-2.5 px-6 rounded-xl border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 active:scale-95 transition-all shadow-sm"
                >
                    <PenTool size={18} />
                    Draft Pitch
                </button>
            </div>

        </div>
    );
}
