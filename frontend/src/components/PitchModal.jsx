import React from 'react';
import { X, Send, Copy, Sparkles, Building2, UserCircle } from 'lucide-react';

export default function PitchModal({ isOpen, onClose, journalist }) {
    if (!isOpen || !journalist) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-fade-in"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col transform transition-all animate-slide-up border border-slate-100 overflow-hidden">

                {/* Header Ribbon */}
                <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-full"></div>

                {/* Header */}
                <div className="p-6 sm:p-8 flex justify-between items-start border-b border-slate-100">
                    <div className="flex gap-4 items-center">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl flex-shrink-0">
                            <Sparkles size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">AI Generated Pitch</h2>
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
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body Area */}
                <div className="p-6 sm:p-8 overflow-y-auto bg-slate-50/50 flex-grow">
                    {/* Email Preview Layout */}
                    <div className="bg-white border text-sm text-slate-700 border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="pb-4 border-b border-slate-100 space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-500 w-16">To:</span>
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{journalist.name.toLowerCase().replace(' ', '.')}@{journalist.outlet.toLowerCase().replace(' ', '')}.com</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-500 w-16">Subject:</span>
                                <span className="font-bold">Pitch Idea: Data on {journalist.beat} Trends</span>
                            </div>
                        </div>

                        <div className="pt-2 text-base leading-relaxed space-y-4 font-normal whitespace-pre-line">
                            {/* This is a placeholder until we get the real Anthropic Output */}
                            <p>Hi {journalist.name.split(' ')[0]},</p>

                            <p>I saw your recent piece on {journalist.beat} and thought you might be interested in an exclusive look at some new data we've gathered.</p>

                            <p className="bg-indigo-50/50 p-4 border-l-4 border-indigo-500 rounded-r-lg text-indigo-900 italic">
                                (Claude AI will generate a highly personalized, context-aware pitch draft right here once the backend is connected and data is scraped.)
                            </p>

                            <p>Let me know if you’d like to see the full report or set up a quick call with our experts next week.</p>

                            <p>Best,<br />[Your Name]</p>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-white border-t border-slate-100 flex justify-end gap-3 sm:gap-4 flex-col sm:flex-row items-center">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>

                    <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all">
                        <Copy size={18} />
                        Copy to Clipboard
                    </button>

                    <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg shadow-indigo-600/20">
                        <Send size={18} />
                        Send Email
                    </button>
                </div>

            </div>
        </div>
    );
}
