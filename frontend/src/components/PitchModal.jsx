import React, { useState, useEffect } from 'react';
import { X, Sparkles, Building, UserCircle, Copy, RefreshCw, CheckCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TONES = [
    { id: 'Story-driven', desc: 'Human impact angle', accentClass: 'text-violet-600 bg-violet-50 border-violet-200' },
    { id: 'Data-heavy', desc: 'Stats & exclusives', accentClass: 'text-blue-600 bg-blue-50 border-blue-200' },
    { id: 'Quick Check-in', desc: 'Soft, brief intro', accentClass: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
];

const BRIEF_FIELDS = [
    { key: 'org_name', label: 'Organization', placeholder: 'e.g. Green Future NGO' },
    { key: 'key_stat', label: 'Key Stat', placeholder: 'e.g. 40% rise in ocean temps since 2000' },
    { key: 'story_angle', label: 'Story Angle', placeholder: 'e.g. Local fishermen losing livelihoods' },
    { key: 'target_outcome', label: 'Target Outcome', placeholder: 'e.g. Cover our report launching March 20' },
];

export default function PitchModal({ isOpen, onClose, journalist, campaignTopic }) {
    const [pitch, setPitch] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [tone, setTone] = useState('Story-driven');
    const [copied, setCopied] = useState(false);
    const [briefOpen, setBriefOpen] = useState(true);
    const [brief, setBrief] = useState({
        org_name: '', key_stat: '', story_angle: '', target_outcome: '',
    });

    useEffect(() => { if (isOpen && journalist) gen(tone); }, [isOpen]);

    const updateBrief = (key, val) => setBrief(prev => ({ ...prev, [key]: val }));

    const gen = (t, briefOverride) => {
        const b = briefOverride ?? brief;
        setLoading(true); setError(''); setPitch('');
        fetch(`http://localhost:8000/api/generate-pitch/${journalist.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                topic: campaignTopic || 'Our advocacy initiative',
                tone: t,
                ...b,
            }),
        })
            .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
            .then(d => { setPitch(d.pitch); setLoading(false); })
            .catch(e => { setError(e.message); setLoading(false); });
    };

    const copy = () => { navigator.clipboard.writeText(pitch); setCopied(true); setTimeout(() => setCopied(false), 2000); };

    if (!isOpen || !journalist) return null;
    const initials = journalist.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const briefFilled = Object.values(brief).some(v => v.trim().length > 0);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                <motion.div
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                />

                <motion.div
                    initial={{ scale: 0.96, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.96, opacity: 0, y: 20 }}
                    className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
                >
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50 flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles size={16} className="text-indigo-500" />
                                <h3 className="text-lg font-bold text-slate-800 tracking-tight">AI Strategy Pitch</h3>
                            </div>
                            <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                                <span className="flex items-center gap-1.5 truncate"><UserCircle size={14} className="text-slate-400" />{journalist.name}</span>
                                <span className="flex items-center gap-1.5 truncate"><Building size={14} className="text-slate-400" />{journalist.outlet}</span>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors flex-shrink-0">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">

                        {/* Left sidebar: Tone + Brief */}
                        <div className="w-full sm:w-64 bg-slate-50 border-b sm:border-b-0 sm:border-r border-slate-200 flex flex-col flex-shrink-0 overflow-y-auto">

                            {/* Tone selector */}
                            <div className="p-5 flex flex-col gap-3 border-b border-slate-200">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Strategy</p>
                                {TONES.map(t => {
                                    const isActive = tone === t.id;
                                    return (
                                        <button
                                            key={t.id}
                                            onClick={() => { setTone(t.id); gen(t.id); }}
                                            className={`text-left rounded-xl p-3 border transition-all ${isActive
                                                ? t.accentClass
                                                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            <p className="text-sm font-bold">{t.id}</p>
                                            <p className={`text-xs mt-1 ${isActive ? 'opacity-80' : 'text-slate-500'}`}>{t.desc}</p>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Campaign Brief */}
                            <div className="p-5 flex flex-col gap-3">
                                <button
                                    onClick={() => setBriefOpen(o => !o)}
                                    className="flex items-center justify-between w-full"
                                >
                                    <div className="flex items-center gap-2">
                                        <FileText size={14} className={briefFilled ? 'text-indigo-500' : 'text-slate-400'} />
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Campaign Brief</p>
                                        {briefFilled && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                        )}
                                    </div>
                                    {briefOpen ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                                </button>

                                <AnimatePresence>
                                    {briefOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden flex flex-col gap-3"
                                        >
                                            {BRIEF_FIELDS.map(({ key, label, placeholder }) => (
                                                <div key={key}>
                                                    <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
                                                    <input
                                                        type="text"
                                                        value={brief[key]}
                                                        onChange={e => updateBrief(key, e.target.value)}
                                                        placeholder={placeholder}
                                                        className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                                                    />
                                                </div>
                                            ))}

                                            <button
                                                onClick={() => gen(tone)}
                                                disabled={loading}
                                                className="mt-1 w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
                                            >
                                                <Sparkles size={13} />
                                                {loading ? 'Generating...' : 'Generate with Brief'}
                                            </button>

                                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                                Fill in any fields to give the AI richer context. Leave blank to skip.
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Email preview */}
                        <div className="flex-1 overflow-y-auto p-6 bg-white">
                            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                {/* Email header */}
                                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 space-y-3">
                                    <div className="flex items-center text-sm">
                                        <span className="text-slate-500 font-semibold w-16 flex-shrink-0">To:</span>
                                        {journalist.email ? (
                                            <span className="flex items-center gap-1.5 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-0.5">
                                                <CheckCircle size={14} /> {journalist.email}
                                            </span>
                                        ) : (
                                            <span className="font-medium text-rose-600 bg-rose-50 border border-rose-100 rounded-md px-2 py-0.5">
                                                No public email
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <span className="text-slate-500 font-semibold w-16 flex-shrink-0">Subject:</span>
                                        <span className="text-slate-900 font-bold truncate">Pitch: {campaignTopic || `${journalist.beat} story idea`}</span>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-5 min-h-[250px] sm:min-h-[300px]">
                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500 py-12">
                                            <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-indigo-600 animate-spin" />
                                            <p className="font-semibold text-sm">Analyzing articles & generating {tone} pitch…</p>
                                        </div>
                                    ) : error ? (
                                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-sm font-medium">{error}</div>
                                    ) : (
                                        <motion.div
                                            key={pitch}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                            className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium"
                                        >
                                            {pitch}
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3 flex-shrink-0">
                        <button
                            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
                            onClick={() => gen(tone)}
                            disabled={loading}
                        >
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                            Regenerate
                        </button>
                        <button
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50 shadow-sm w-[100px] justify-center"
                            onClick={copy}
                            disabled={loading || !pitch}
                        >
                            {copied ? <><CheckCircle size={16} className="text-emerald-500" /> Copied</> : <><Copy size={16} /> Copy</>}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
