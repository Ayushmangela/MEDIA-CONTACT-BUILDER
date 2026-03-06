import React from 'react';
import { Users, FileText } from 'lucide-react';

export default function StatsBar() {
    return (
        <div className="glass rounded-2xl p-6 lg:p-8">
            <h2 className="text-xl font-bold mb-5 text-slate-800 tracking-tight">Database Stats</h2>
            <div className="flex flex-col gap-4">

                <div className="flex items-center gap-4 bg-white/60 p-4 rounded-xl border border-white/50 shadow-sm transition-transform hover:-translate-y-1">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                        <Users size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-slate-800 leading-none">0</p>
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mt-1">Journalists</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white/60 p-4 rounded-xl border border-white/50 shadow-sm transition-transform hover:-translate-y-1">
                    <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
                        <FileText size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-slate-800 leading-none">0</p>
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mt-1">Articles</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
