import React from 'react';
import { Clock, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

export default function PitchPredictor({ prediction }) {
    if (!prediction || prediction.active_hours.length === 0) {
        return (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3">
                <Clock className="text-slate-300" size={32} />
                <p className="text-sm text-slate-500 font-medium">Not enough historical data to generate a precise pitch prediction yet.</p>
            </div>
        );
    }

    const { active_hours, active_days, optimal_window, deadline_risk } = prediction;

    // Find max count for scaling/coloring
    const maxCount = Math.max(...active_hours.map(h => h.count));

    return (
        <div className="flex flex-col gap-6">
            {/* Recommendation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Optimal Window</p>
                        <p className="text-lg font-bold text-emerald-900">{optimal_window}</p>
                        <p className="text-xs text-emerald-700/70 mt-1 font-medium italic">High probability of inbox engagement</p>
                    </div>
                </div>

                <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mb-1">Deadline Risk</p>
                        <p className="text-lg font-bold text-rose-900">{deadline_risk}</p>
                        <p className="text-xs text-rose-700/70 mt-1 font-medium italic">Likely on deadline; avoid pitching</p>
                    </div>
                </div>
            </div>

            {/* Hourly Activity Chart */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Clock size={16} className="text-indigo-500" />
                        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Hourly Activity (24h)</h4>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">Based on {prediction.total_articles_analyzed} articles</span>
                </div>
                
                <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={active_hours}>
                            <Tooltip 
                                cursor={{fill: 'rgba(241, 245, 249, 0.5)'}}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-slate-800 text-white px-2 py-1 rounded text-[10px] font-bold shadow-xl border border-slate-700">
                                                {payload[0].payload.hour}:00 - {payload[0].value} articles
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="count">
                                {active_hours.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={entry.count === maxCount ? '#6366f1' : '#e2e8f0'} 
                                        radius={[4, 4, 0, 0]}
                                    />
                                ))}
                            </Bar>
                            <XAxis 
                                dataKey="hour" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}}
                                interval={3}
                                tickFormatter={(val) => `${val}h`}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Weekly Activity */}
            <div className="grid grid-cols-7 gap-2">
                {active_days.map((d, i) => (
                    <div key={i} className={`flex flex-col items-center gap-2 p-2 rounded-lg border transition-all ${d.count > 0 ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
                        <span className={`text-[10px] font-bold ${d.count > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>{d.day}</span>
                        <div className="flex flex-col gap-0.5 items-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                                {d.count > 0 && <div className="w-full h-full bg-indigo-500" />}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
