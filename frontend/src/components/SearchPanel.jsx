import React from 'react';
import { Search, Hash, Target } from 'lucide-react';

export default function SearchPanel() {
    return (
        <div className="glass rounded-2xl p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
                <Target className="text-indigo-600" size={24} />
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Campaign Query</h2>
            </div>

            <div className="space-y-5 flex flex-col">
                <div className="space-y-1">
                    <label className="block text-sm font-semibold text-slate-700 ml-1">Campaign Topic</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={18} className="text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="e.g. Stop deforestation..."
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm font-medium text-slate-700 placeholder:text-slate-400 placeholder:font-normal"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="block text-sm font-semibold text-slate-700 ml-1">Beat / Focus Area</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Hash size={18} className="text-slate-400" />
                        </div>
                        <select className="appearance-none w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm font-medium text-slate-700 cursor-pointer">
                            <option value="environment">Environment</option>
                            <option value="animal-welfare">Animal Welfare</option>
                            <option value="food-systems">Food Systems</option>
                            <option value="science">Science</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                </div>

                <button className="relative w-full group overflow-hidden bg-indigo-600 text-white font-bold py-3.5 px-4 rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] mt-2">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        <Search size={18} />
                        Find Journalists
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
            </div>
        </div>
    );
}
