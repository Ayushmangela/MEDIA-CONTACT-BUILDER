import React from 'react';
import { Users, FileText, Send } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = { Premium: '#8b5cf6', Major: '#3b82f6', Niche: '#10b981', Standard: '#94a3b8' };

const Tip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow-lg">
            {payload[0].value} journalists
        </div>
    );
};

export default function Dashboard({ stats = {} }) {
    const stats3 = [
        { label: 'Journalists', value: stats.journalists_total ?? 0, icon: Users, colorClass: 'text-violet-600', bgClass: 'bg-violet-50' },
        { label: 'Articles', value: stats.articles_total ?? 0, icon: FileText, colorClass: 'text-blue-600', bgClass: 'bg-blue-50' },
        { label: 'Pitches', value: stats.pitches_generated ?? 0, icon: Send, colorClass: 'text-emerald-600', bgClass: 'bg-emerald-50' },
    ];

    const chartData = Object.entries(stats.tier_distribution || {}).map(([name, count]) => ({ name, count }));

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Intelligence</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                {stats3.map(({ label, value, icon: Icon, colorClass, bgClass }) => (
                    <div key={label} className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center transition-colors hover:bg-slate-100">
                        <div className={`w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center ${bgClass}`}>
                            <Icon size={16} className={colorClass} />
                        </div>
                        <p className={`text-lg font-black leading-none tabular-nums ${colorClass}`}>{value}</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide mt-1.5">{label}</p>
                    </div>
                ))}
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
                <>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Outlet Mix</p>
                    <div className="h-24">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} barSize={24} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} tickLine={false} axisLine={false} />
                                <Tooltip content={<Tip />} cursor={false} />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                    {chartData.map((e, i) => (
                                        <Cell key={i} fill={COLORS[e.name] || '#94a3b8'} fillOpacity={0.9} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}
        </div>
    );
}
