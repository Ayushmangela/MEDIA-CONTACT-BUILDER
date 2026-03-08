import React, { useState, useEffect } from 'react';
import { X, Send, Copy, Sparkles, Building2, UserCircle, SlidersHorizontal, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PitchModal({ isOpen, onClose, journalist, campaignTopic }) {
    const [pitch, setPitch] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [tone, setTone] = useState("Story-driven");

    // Only run when 'isOpen' turns true
    useEffect(() => {
        if (isOpen && journalist) {
            generatePitch(tone);
        }
    }, [isOpen]); // Intentionally leaving out dependencies to prevent re-fetching constantly

    const generatePitch = (selectedTone) => {
        setIsLoading(true);
        setError("");
        setPitch("");

        fetch(`http://localhost:8000/api/generate-pitch/${journalist.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                topic: campaignTopic || "Our latest advocacy initiative",
                tone: selectedTone
            })
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to generate pitch");
                return res.json();
            })
            .then(data => {
                setPitch(data.pitch);
                setIsLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setIsLoading(false);
            });
    };

    const handleToneChange = (newTone) => {
        setTone(newTone);
        generatePitch(newTone);
    };

    if (!isOpen || !journalist) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                >
                    {/* Header Ribbon */}
                    <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-full"></div>

                    {/* Header */}
                    <div className="p-6 sm:p-8 flex justify-between items-start border-b border-slate-100 bg-slate-50">
                        <div className="flex gap-4 items-center">
                            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl flex-shrink-0 relative overflow-hidden">
                                <Sparkles size={28} className="relative z-10" />
                                <div className="absolute inset-0 bg-indigo-200/50 animate-pulse"></div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">AI Strategy Pitch</h2>
                                <div className="flex items-center gap-3 mt-1.5 text-sm font-medium text-slate-500">
                                    <span className="flex items-center gap-1.5">
                                        <UserCircle size={16} /> {journalist.name}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Building2 size={16} /> {journalist.outlet}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors bg-white"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row flex-grow overflow-hidden">
                        {/* Sidebar Settings */}
                        <div className="w-full sm:w-64 bg-slate-50 border-r border-slate-200 p-6 space-y-6 flex-shrink-0 overflow-y-auto">
                            <div>
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <SlidersHorizontal size={14} /> Pitch Strategy
                                </h3>
                                <div className="space-y-2">
                                    {["Story-driven", "Data-heavy", "Quick Check-in"].map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => handleToneChange(t)}
                                            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${tone === t ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-200">
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Changing the pitch strategy will trigger the Anthropic API to regenerate the content based on specialized PR guidelines.
                                </p>
                            </div>
                        </div>

                        {/* Email Preview Area */}
                        <div className="p-6 sm:p-8 overflow-y-auto bg-white flex-grow">
                            <div className="bg-white border text-sm text-slate-700 border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                                <div className="pb-4 border-b border-slate-100 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-slate-500 w-16">To:</span>
                                        {journalist.email ? (
                                            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded flex items-center gap-1.5 font-medium">
                                                <CheckCircle size={12} />
                                                {journalist.email}
                                            </span>
                                        ) : (
                                            <span className="bg-rose-100 px-2 py-0.5 rounded text-rose-700 font-medium">
                                                [No Public Email Found]
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-slate-500 w-16">Subject:</span>
                                        <span className="font-bold">Pitch Idea: {campaignTopic ? campaignTopic : `Data on ${journalist.beat} Trends`}</span>
                                    </div>
                                </div>

                                <div className="pt-2 text-base leading-relaxed space-y-4 font-normal whitespace-pre-line min-h-[250px]">
                                    {isLoading ? (
                                        <div className="flex flex-col items-center justify-center p-10 text-slate-500 gap-4 h-full">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                            <p className="font-medium animate-pulse">Running {tone} strategy model...</p>
                                        </div>
                                    ) : error ? (
                                        <div className="text-red-500 p-4 bg-red-50 rounded-lg border border-red-100">{error}</div>
                                    ) : (
                                        <motion.div
                                            key={pitch} // animate when pitch changes
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            {pitch}
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 sm:gap-4 flex-col sm:flex-row items-center">
                        <button
                            onClick={onClose}
                            className="w-full sm:w-auto px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-200 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>

                        <button
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:border-slate-300 hover:bg-slate-100 transition-all"
                            onClick={() => navigator.clipboard.writeText(pitch)}
                            disabled={isLoading}
                        >
                            <Copy size={18} />
                            Copy to Clipboard
                        </button>

                        <button
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                            disabled={isLoading}
                        >
                            <Send size={18} />
                            Send Email
                        </button>
                    </div>

                </motion.div>
            </div>
        </AnimatePresence>
    );
}
