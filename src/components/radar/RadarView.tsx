"use client";

import { useState, useMemo } from "react";
import { useRadar } from "@/lib/radar-context";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, RefreshCw, Zap, TrendingUp, Filter, Star,
    ArrowUpRight, Clock, Activity, BarChart3, AlertTriangle, Layers
} from "lucide-react";
import { paperStore } from "@/lib/paper-trading";

// --- Sub-components for cleanliness ---

const ScoreBadge = ({ score }: { score: number }) => {
    let color = "text-blue-400 bg-blue-500/10 border-blue-500/20";
    if (score >= 80) color = "text-red-400 bg-red-500/10 border-red-500/20";
    else if (score >= 60) color = "text-amber-400 bg-amber-500/10 border-amber-500/20";

    return (
        <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl border ${color}`}>
            <span className="text-lg font-bold">{score}</span>
        </div>
    );
};

const MarketCard = ({ data, isFavorite, onToggleFav, onSnip }: any) => {
    const { market, analysis } = data;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative bg-[#0C0D12] border border-white/5 hover:border-indigo-500/30 rounded-2xl p-4 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col gap-4"
        >
            <div className="flex justify-between items-start gap-3">
                <div className="flex gap-3">
                    <ScoreBadge score={analysis.score} />
                    <div>
                        <h3 className="text-sm font-bold text-white line-clamp-2 leading-tight group-hover:text-indigo-400 transition-colors">
                            {market.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                            <span className="bg-white/5 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">{market.category}</span>
                            <span>•</span>
                            <span className="text-green-400 font-mono">Vol: {market.volume}</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleFav(market.id); }}
                    className={`p-2 rounded-lg transition-colors ${isFavorite ? 'text-yellow-400 bg-yellow-400/10' : 'text-slate-600 hover:text-slate-400 bg-white/5'}`}
                >
                    <Star size={16} fill={isFavorite ? "currentColor" : "none"} />
                </button>
            </div>

            {/* Analysis Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                    <div className="text-slate-500 mb-0.5 flex items-center gap-1">
                        <Activity size={10} /> Urgency
                    </div>
                    <div className={`font-bold ${analysis.urgency === 'HIGH' ? 'text-red-400' : 'text-slate-300'}`}>
                        {analysis.urgency}
                    </div>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                    <div className="text-slate-500 mb-0.5 flex items-center gap-1">
                        <Zap size={10} /> Type
                    </div>
                    <div className="font-bold text-indigo-400">
                        {analysis.eventType.replace('_', ' ')}
                    </div>
                </div>
            </div>

            {/* Footer Action */}
            <div className="pt-2 mt-auto border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-white">{market.probability}%</span>
                    <span className="text-xs text-slate-500">Chance</span>
                </div>
                <button
                    onClick={() => onSnip(market.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-indigo-500/20"
                >
                    SNIP <ArrowUpRight size={14} />
                </button>
            </div>
        </motion.div>
    );
};

export default function RadarView() {
    const { markets, isLoading, lastUpdated, refreshMarkets, toggleFavorite, favorites } = useRadar();
    const [search, setSearch] = useState("");
    const [filterPriority, setFilterPriority] = useState<'ALL' | 'HIGH'>('ALL');
    const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');

    const filtered = useMemo(() => {
        return markets.filter(m => {
            if (search && !m.market.title.toLowerCase().includes(search.toLowerCase())) return false;
            if (filterPriority === 'HIGH' && m.analysis.urgency !== 'HIGH') return false;
            return true;
        });
    }, [markets, search, filterPriority]);

    const handleSnip = (id: string) => {
        const market = markets.find(m => m.market.id === id);
        if (!market) return;

        // Simpler snip logic for now, using the paperStore directly
        const order = paperStore.placeOrder({
            marketId: market.market.id,
            marketTitle: market.market.title,
            marketImage: market.market.image,
            type: 'BUY',
            outcome: 'YES',
            entryPrice: market.market.probability / 100,
            source: 'SNIPER',
            notes: `Score: ${market.analysis.score}`
        });

        if (order) {
            // In a real app we would show a toast here, but the context doesn't expose it yet.
            // We can rely on the PaperTradingWidget to update.
            console.log("Order placed:", order);
        }
    };

    return (
        <div className="p-6 max-w-[1920px] mx-auto space-y-6">

            {/* Control Bar - "Terminal Style" */}
            <div className="bg-[#0A0B10] border border-white/10 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-2xl">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="SEARCH TICKER OR KEYWORD..."
                            className="w-full bg-[#050505] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white uppercase placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="h-8 w-px bg-white/10" />
                    <button
                        onClick={() => setFilterPriority(prev => prev === 'ALL' ? 'HIGH' : 'ALL')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${filterPriority === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-slate-400 hover:text-white border border-transparent'}`}
                    >
                        <AlertTriangle size={14} /> HIGH URGENCY ONLY
                    </button>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end text-xs text-slate-500 font-mono">
                    <span className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-ping' : 'bg-green-500'}`} />
                        {isLoading ? 'SCANNING...' : 'LIVE'}
                    </span>
                    <span>LAST UPDATE: {lastUpdated?.toLocaleTimeString()}</span>
                    <button
                        onClick={() => refreshMarkets()}
                        className="p-2 hover:bg-white/5 rounded-lg text-white transition-colors"
                        disabled={isLoading}
                    >
                        <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Markets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                <AnimatePresence>
                    {filtered.map(item => (
                        <MarketCard
                            key={item.market.id}
                            data={item}
                            isFavorite={favorites.has(item.market.id)}
                            onToggleFav={toggleFavorite}
                            onSnip={handleSnip}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {filtered.length === 0 && !isLoading && (
                <div className="text-center py-20 text-slate-500">
                    <Layers size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-mono text-sm">NO OPPORTUNITIES FOUND MATCHING CRITERIA</p>
                </div>
            )}
        </div>
    );
}
