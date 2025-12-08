"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    RefreshCw,
    TrendingUp,
    CheckCircle,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    Layers,
    Filter,
    Zap,
    Clock,
    Tag
} from "lucide-react";
import { FluxCard, SnipingData } from "@/components/radar/FluxCard";
import { fetchPolymarketMarkets, ProcessedMarket } from "@/lib/polymarket";
import { calculateSnipability, EventType, UrgencyLevel } from "@/lib/snipability-algo";
import { filterSnipableMarkets } from "@/lib/dynamic-filter";
import { listener, ListenerStatus } from "@/lib/listener";
import { paperStore } from "@/lib/paper-trading";

type FilterCategory = 'All' | 'Crypto' | 'Politics' | 'Sports' | 'Business' | 'Science' | 'Other';
type FilterType = 'ALL' | EventType;
type FilterUrgency = 'ALL' | UrgencyLevel;

type MarketWithSniping = {
    market: ProcessedMarket;
    sniping: SnipingData & { eventType: EventType };
};

type EventGroup = {
    eventSlug: string;
    eventTitle: string;
    markets: MarketWithSniping[];
    bestScore: number;
    totalVolume: number;
};

type Toast = {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
};

export default function RadarView() {
    const [markets, setMarkets] = useState<MarketWithSniping[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [toasts, setToasts] = useState<Toast[]>([]);

    // Advanced Filters
    const [activeCategory, setActiveCategory] = useState<FilterCategory>('All');
    const [activeType, setActiveType] = useState<FilterType>('ALL');
    const [activeUrgency, setActiveUrgency] = useState<FilterUrgency>('ALL');

    useEffect(() => {
        loadMarkets();
        listener.start();
        const refreshInterval = setInterval(loadMarkets, 60000);
        return () => {
            clearInterval(refreshInterval);
            listener.stop();
        };
    }, []);

    const showToast = (type: Toast['type'], message: string) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    };

    async function loadMarkets() {
        setLoading(true);
        try {
            const rawMarkets = await fetchPolymarketMarkets();
            const scored = rawMarkets.map(market => {
                const snipability = calculateSnipability(market);
                return {
                    market,
                    sniping: {
                        score: snipability.score,
                        urgency: snipability.urgency,
                        whaleActivity: snipability.whaleActivity,
                        description: snipability.description,
                        eventType: snipability.eventType,
                        factors: snipability.factors
                    }
                };
            });

            const filtered = filterSnipableMarkets(scored, 25, 500);

            // Deduplication
            const uniqueMap = new Map();
            const uniqueFiltered = filtered.filter(item => {
                if (uniqueMap.has(item.market.id)) return false;
                uniqueMap.set(item.market.id, true);
                return true;
            });

            setMarkets(uniqueFiltered);
        } catch (error) {
            console.error('[Radar] Failed to load markets:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleSnipe = (marketId: string) => {
        const settings = paperStore.getSettings();
        if (!settings.enabled) {
            showToast('error', 'Paper Trading disabled. Enable in Settings.');
            return;
        }

        const marketData = markets.find(m => m.market.id === marketId);
        if (!marketData) return;

        const { market } = marketData;
        const order = paperStore.placeOrder({
            marketId: market.id,
            marketTitle: market.title,
            marketImage: market.image,
            type: 'BUY',
            outcome: 'YES',
            entryPrice: market.probability / 100,
            source: 'SNIPER',
            notes: `Score: ${marketData.sniping.score}`
        });

        if (order) {
            showToast('success', `Sniped! $${order.amount.toFixed(2)} on ${market.title.slice(0, 20)}...`);
        } else {
            showToast('error', 'Failed: check balance/settings');
        }
    };

    // Filter Logic
    const groupedMarkets = useMemo(() => {
        const filtered = markets.filter(item => {
            // Search
            if (!item.market.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;

            // Category Filter
            if (activeCategory !== 'All' && item.market.category !== activeCategory) return false;

            // Type Filter
            if (activeType !== 'ALL' && item.sniping.eventType !== activeType) return false;

            // Urgency Filter
            if (activeUrgency !== 'ALL' && item.sniping.urgency !== activeUrgency) return false;

            return true;
        });

        // Grouping
        const groups = new Map<string, EventGroup>();
        filtered.forEach(item => {
            const words = item.market.title
                .toLowerCase()
                .replace(/[^\w\s]/g, '')
                .split(/\s+/)
                .filter(w => w.length > 2 && !['will', 'the', 'and', 'for', 'this', 'that', 'with', 'from', 'have', 'has', 'been', 'are', 'was', 'were', 'yes', 'no'].includes(w))
                .slice(0, 4);
            const eventSlug = words.join('_') || item.market.id;

            if (!groups.has(eventSlug)) {
                groups.set(eventSlug, {
                    eventSlug,
                    eventTitle: item.market.title,
                    markets: [],
                    bestScore: 0,
                    totalVolume: 0
                });
            }
            const group = groups.get(eventSlug)!;
            group.markets.push(item);
            group.bestScore = Math.max(group.bestScore, item.sniping.score);

            // Volume Parsing
            const volMatch = item.market.volume.match(/\$?([\d.]+)([MK]?)/);
            if (volMatch) {
                let vol = parseFloat(volMatch[1]);
                if (volMatch[2] === 'M') vol *= 1000000;
                if (volMatch[2] === 'K') vol *= 1000;
                group.totalVolume += vol;
            }
        });

        return Array.from(groups.values()).sort((a, b) => b.bestScore - a.bestScore);
    }, [markets, searchQuery, activeCategory, activeType, activeUrgency]);

    const toggleGroup = (slug: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(slug)) next.delete(slug);
            else next.add(slug);
            return next;
        });
    };

    const formatVolume = (vol: number) => {
        if (vol >= 1000000) return `$${(vol / 1000000).toFixed(1)}M`;
        if (vol >= 1000) return `$${(vol / 1000).toFixed(0)}K`;
        return `$${vol.toFixed(0)}`;
    };

    return (
        <div className="relative min-h-screen pb-20">
            {/* Toast Notifications */}
            <div className="fixed top-24 right-6 z-[60] flex flex-col gap-2">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            className={`px-4 py-3 rounded-xl flex items-center gap-3 shadow-xl backdrop-blur-xl border ${toast.type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
                                    toast.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-400' :
                                        'bg-blue-500/20 border-blue-500/30 text-blue-400'
                                }`}
                        >
                            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                            <span className="text-sm font-medium">{toast.message}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Sticky Header */}
            <div className="sticky top-0 z-40 bg-[#0A0B10] border-b border-white/10 shadow-2xl">
                <div className="p-4 lg:px-8 lg:py-4">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">

                        {/* Title & Search */}
                        <div className="flex flex-col sm:flex-row gap-4 flex-1">
                            <div className="flex items-center gap-3 shrink-0">
                                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                                    <TrendingUp size={20} />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-white leading-tight">Radar</h1>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                        <span className="flex items-center gap-1 text-green-400">
                                            <span className="relative flex h-1.5 w-1.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                                            </span>
                                            Live
                                        </span>
                                        <span>•</span>
                                        <span>{groupedMarkets.length} Events</span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search markets, events..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
                                />
                            </div>
                        </div>

                        {/* Filter Bar */}
                        <div className="flex flex-wrap items-center gap-2 text-xs">

                            {/* Category Filter */}
                            <div className="relative group">
                                <button className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 transition-all">
                                    <Tag size={13} />
                                    <span>{activeCategory === 'All' ? 'Category' : activeCategory}</span>
                                    <ChevronDown size={12} className="opacity-50" />
                                </button>
                                <div className="absolute top-full right-0 mt-2 w-48 bg-[#1A1B23] border border-white/10 rounded-xl shadow-xl p-1 hidden group-hover:block z-50">
                                    {(['All', 'Crypto', 'Politics', 'Sports', 'Business', 'Science', 'Other'] as FilterCategory[]).map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setActiveCategory(cat)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeCategory === cat ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Urgency Filter */}
                            <div className="relative group">
                                <button className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 transition-all">
                                    <Clock size={13} />
                                    <span>{activeUrgency === 'ALL' ? 'Urgency' : activeUrgency}</span>
                                    <ChevronDown size={12} className="opacity-50" />
                                </button>
                                <div className="absolute top-full right-0 mt-2 w-48 bg-[#1A1B23] border border-white/10 rounded-xl shadow-xl p-1 hidden group-hover:block z-50">
                                    {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as FilterUrgency[]).map(urg => (
                                        <button
                                            key={urg}
                                            onClick={() => setActiveUrgency(urg)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeUrgency === urg ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            {urg}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Type Filter */}
                            <div className="relative group">
                                <button className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 transition-all">
                                    <Zap size={13} />
                                    <span>{activeType === 'ALL' ? 'Signal Type' : activeType.replace('_', ' ')}</span>
                                    <ChevronDown size={12} className="opacity-50" />
                                </button>
                                <div className="absolute top-full right-0 mt-2 w-56 bg-[#1A1B23] border border-white/10 rounded-xl shadow-xl p-1 hidden group-hover:block z-50">
                                    {(['ALL', 'new_market', 'price_surge', 'whale_volume', 'social_hype', 'contrarian_opportunity'] as FilterType[]).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setActiveType(type)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeType === type ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            {type === 'ALL' ? 'All Types' : type.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="w-px h-6 bg-white/10 mx-1" />

                            <button
                                onClick={() => loadMarkets()}
                                disabled={loading}
                                className="p-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:shadow-none"
                            >
                                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 lg:p-8 space-y-4">
                <AnimatePresence>
                    {groupedMarkets.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-32 text-slate-500"
                        >
                            <div className="p-4 bg-white/5 rounded-full mb-4">
                                <Layers size={32} className="opacity-50" />
                            </div>
                            <p className="text-lg font-medium text-slate-400">No markets found based on filters</p>
                            <button
                                onClick={() => { setActiveCategory('All'); setActiveType('ALL'); setActiveUrgency('ALL'); setSearchQuery(''); }}
                                className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-indigo-400 font-medium transition-colors"
                            >
                                Clear all filters
                            </button>
                        </motion.div>
                    ) : (
                        groupedMarkets.map((group, groupIndex) => {
                            const isExpanded = expandedGroups.has(group.eventSlug) || group.markets.length === 1;
                            const displayMarkets = isExpanded ? group.markets : group.markets.slice(0, 1);

                            return (
                                <motion.div
                                    key={group.eventSlug}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: groupIndex * 0.05 }}
                                    className="bg-[#0C0D12] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors shadow-lg"
                                >
                                    {/* Group Header */}
                                    {group.markets.length > 1 && (
                                        <div
                                            onClick={() => toggleGroup(group.eventSlug)}
                                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold text-sm shadow-inner ${group.bestScore >= 80 ? 'bg-gradient-to-br from-red-500/20 to-red-600/10 text-red-400 border border-red-500/20' :
                                                            group.bestScore >= 60 ? 'bg-gradient-to-br from-orange-500/20 to-orange-600/10 text-orange-400 border border-orange-500/20' :
                                                                'bg-gradient-to-br from-blue-500/20 to-blue-600/10 text-blue-400 border border-blue-500/20'
                                                        }`}>
                                                        {group.bestScore}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-white font-bold text-sm sm:text-base line-clamp-1">{group.eventTitle}</div>
                                                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5">
                                                            <Layers size={10} />
                                                            {group.markets.length} variants
                                                        </span>
                                                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5">
                                                            <TrendingUp size={10} />
                                                            Vol: {formatVolume(group.totalVolume)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`p-2 rounded-lg bg-white/5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                                <ChevronDown className="text-slate-400" size={16} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Markets Grid */}
                                    <AnimatePresence>
                                        {(isExpanded || group.markets.length === 1) && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className={`p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 bg-[#08090C]`}>
                                                    {displayMarkets.map((item, index) => (
                                                        <motion.div
                                                            key={item.market.id}
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: index * 0.05 }}
                                                        >
                                                            <FluxCard
                                                                market={item.market}
                                                                sniping={item.sniping}
                                                                onSnip={handleSnipe}
                                                                isTracked={false}
                                                            />
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
