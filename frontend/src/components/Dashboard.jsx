import React from 'react';
import { Users, FileText, Send, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

export default function Dashboard({ stats }) {
    if (!stats) return null;

    const data = [
        { name: 'Premium', count: stats.tier_distribution?.Premium || 0, color: '#4f46e5' },
        { name: 'Major', count: stats.tier_distribution?.Major || 0, color: '#0ea5e9' },
        { name: 'Niche', count: stats.tier_distribution?.Niche || 0, color: '#10b981' },
        { name: 'Standard', count: stats.tier_distribution?.Standard || 0, color: '#94a3b8' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass rounded-2xl p-6 lg:p-8 space-y-8"
        >
            <div className="flex items-center gap-3">
                <Award className="text-indigo-600" size={24} />
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Intelligence Dashboard</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <motion.div whileHover={{ y: -5 }} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-2 text-slate-500">
                        <span className="text-xs font-bold uppercase tracking-wider">Targets</span>
                        <Users size={16} />
                    </div>
                    <p className="text-3xl font-black text-indigo-600">{stats.journalists_total}</p>
                </motion.div>

                <motion.div whileHover={{ y: -5 }} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-2 text-slate-500">
                        <span className="text-xs font-bold uppercase tracking-wider">Articles</span>
                        <FileText size={16} />
                    </div>
                    <p className="text-3xl font-black text-blue-500">{stats.articles_total}</p>
                </motion.div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm w-full">
                <h3 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">Outlet Quality Distribution</h3>
                <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </motion.div>
    );
}
