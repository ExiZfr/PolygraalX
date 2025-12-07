"use client";

import { useState, useEffect } from "react";
import { FluxCard, MarketData, SnipingData } from "@/components/radar/FluxCard";
import { HelpCircle, Search, XCircle, RefreshCw, Star, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchPolymarketMarkets, ProcessedMarket } from "@/lib/polymarket";
import { calculateSnipability, filterSnipableMarkets, EventType, UrgencyLevel } from "@/lib/snipability-algo";
import { listener, ListenerStatus } from "@/lib/listener";

type FilterEventType = EventType | 'all';
type FilterUrgency = UrgencyLevel | 'ALL';

export default function RadarPage() {
    const [markets, setMarkets] = useState<Array<{ market: ProcessedMarket; sniping: SnipingData & { eventType: EventType } }>>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"score" | "volume">("score");
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [listenerStatus, setListenerStatus] = useState<ListenerStatus | null>(null);

    // New filters
    const [filterEventType, setFilterEventType] = useState<FilterEventType>('all');
    const [filterUrgency, setFilterUrgency] = useState<FilterUrgency>('ALL');

    // Load markets on mount
    useEffect(() => {
        loadMarkets();

        // Start listener
        listener.start();

        // Update listener status every 10s
        const statusInterval = setInterval(() => {
            setListenerStatus(listener.getStatus());
        }, 10000);

        return () => {
            clearInterval(statusInterval);
            listener.stop();
        };
    }, []);

    // Reload markets every 60 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            loadMarkets();
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    async function loadMarkets() {
        setLoading(true);
        try {
            const rawMarkets = await fetchPolymarketMarkets();

            // Calculate snipability scores
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

            // Filter to maintain ~30 snipable markets
            const filtered = filterSnipableMarkets(scored, 30);

            setMarkets(filtered);

            // Track all markets in listener
            filtered.forEach(({ market }) => {
                listener.trackMarket(market, favorites.has(market.id));
            });
        } catch (error) {
            console.error('[Radar] Failed to load markets:', error);
        } finally {
            setLoading(false);
        }
    }

    function toggleFavorite(marketId: string) {
        const newFavorites = new Set(favorites);
        if (newFavorites.has(marketId)) {
            newFavorites.delete(marketId);
        } else {
            newFavorites.add(marketId);
        }
        setFavorites(newFavorites);
        listener.toggleFavorite(marketId);
    }

    // Filtered & Sorted Markets
    const filteredMarkets = markets
        .filter(item => {
            // Search filter
            if (!item.market.title.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            // Event type filter
            if (filterEventType !== 'all' && item.sniping.eventType !== filterEventType) {
                return false;
            }

            // Urgency filter
            if (filterUrgency !== 'ALL' && item.sniping.urgency !== filterUrgency) {
                return false;
            }

            return true;
        })
        .sort((a, b) => {
            // Favorites always on top
            if (favorites.has(a.market.id) && !favorites.has(b.market.id)) return -1;
            if (!favorites.has(a.market.id) && favorites.has(b.market.id)) return 1;

            // Then sort by selected criteria
            if (sortBy === "score") return b.sniping.score - a.sniping.score;

            const aVol = parseVolume(a.market.volume);
            const bVol = parseVolume(b.market.volume);
            return bVol - aVol;
        });

    function parseVolume(volume: string): number {
        const match = volume.match(/\$([\d.]+)([MK]?)/);
        if (!match) return 0;
        const num = parseFloat(match[1]);
        const unit = match[2];
        if (unit === 'M') return num * 1000000;
        if (unit === 'K') return num * 1000;
        return num;
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Market Radar</h1>
                        <p className="text-slate-400 mt-1">
                            {loading ? 'Loading markets...' : `${filteredMarkets.length} snipable opportunities`}
                        </p>

                        {/* Listener Status Badge */}
                        {listenerStatus && (
                            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                Listener Active · {listenerStatus.marketsTracked} tracked · {listenerStatus.signalsDetected} signals
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={loadMarkets}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition disabled:opacity-50"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                            <span className="text-sm font-medium">Refresh</span>
                        </button>

                        <button
                            onClick={() => setShowHelpModal(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition"
                        >
                            <HelpCircle size={18} />
                            <span className="text-sm font-medium">Help</span>
                        </button>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search markets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50"
                        />
                    </div>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as "score" | "volume")}
                        className="px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                    >
                        <option value="score">Sort by Score</option>
                        <option value="volume">Sort by Volume</option>
                    </select>
                </div>

                {/* New Filter Row */}
                <div className="flex flex-wrap gap-3 mb-6">
                    {/* Event Type Filter */}
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-slate-500" />
                        <span className="text-sm text-slate-400">Event:</span>
                        <select
                            value={filterEventType}
                            onChange={(e) => setFilterEventType(e.target.value as FilterEventType)}
                            className="px-3 py-1.5 bg-slate-900/50 border border-slate-800 rounded text-sm text-white focus:outline-none focus:border-blue-500/50"
                        >
                            <option value="all">All Types</option>
                            <option value="tweet">Tweets</option>
                            <option value="announcement">Announcements</option>
                            <option value="event">Events</option>
                            <option value="news">News</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* Urgency Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">Urgency:</span>
                        <select
                            value={filterUrgency}
                            onChange={(e) => setFilterUrgency(e.target.value as FilterUrgency)}
                            className="px-3 py-1.5 bg-slate-900/50 border border-slate-800 rounded text-sm text-white focus:outline-none focus:border-blue-500/50"
                        >
                            <option value="ALL">All Levels</option>
                            <option value="CRITICAL">🔥 Critical</option>
                            <option value="HIGH">⚡ High</option>
                            <option value="MEDIUM">📊 Medium</option>
                            <option value="LOW">⏳ Low</option>
                        </select>
                    </div>

                    {/* Favorites Toggle */}
                    {favorites.size > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-400 text-sm">
                            <Star size={14} className="fill-current" />
                            {favorites.size} Favorite{favorites.size > 1 ? 's' : ''}
                        </div>
                    )}
                </div>
            </div>

            {/* FluxCards Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredMarkets.map((item, index) => (
                        <motion.div
                            key={item.market.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.03 }}
                            className="relative"
                        >
                            {/* Favorite Star */}
                            <button
                                onClick={() => toggleFavorite(item.market.id)}
                                className="absolute top-4 right-4 z-10 p-2 bg-black/60 backdrop-blur-sm rounded-full border border-white/10 hover:border-yellow-500/50 transition"
                            >
                                <Star
                                    size={18}
                                    className={favorites.has(item.market.id) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-400'}
                                />
                            </button>

                            <FluxCard
                                market={{
                                    id: item.market.id,
                                    title: item.market.title,
                                    image: item.market.image,
                                    outcome: item.market.outcome,
                                    probability: item.market.probability,
                                    volume: item.market.volume
                                }}
                                sniping={item.sniping}
                                onSnip={(id) => console.log('[Radar] Sniping market:', id)}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Help Modal (existing code) */}
            <AnimatePresence>
                {showHelpModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowHelpModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">Metrics Explained</h2>
                                <button
                                    onClick={() => setShowHelpModal(false)}
                                    className="p-2 hover:bg-slate-800 rounded-lg transition"
                                >
                                    <XCircle size={24} className="text-slate-400" />
                                </button>
                            </div>

                            <div className="space-y-6 text-slate-300">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Snipability Score (0-100)</h3>
                                    <p className="text-sm leading-relaxed">
                                        Composite metric combining urgency, volume, whale activity, and news sentiment.
                                        <span className="text-green-400 font-medium"> ≥80 = Excellent</span>,
                                        <span className="text-yellow-400 font-medium"> 50-79 = Good</span>,
                                        <span className="text-red-400 font-medium"> &lt;50 = Filtered Out</span>.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Event Type Filters</h3>
                                    <p className="text-sm leading-relaxed">
                                        <span className="text-blue-400 font-medium">Tweet:</span> Markets affected by social media posts (e.g., Elon Musk tweets)<br />
                                        <span className="text-purple-400 font-medium">Announcement:</span> Product launches, company announcements<br />
                                        <span className="text-green-400 font-medium">Event:</span> Conferences, summits, scheduled events<br />
                                        <span className="text-orange-400 font-medium">News:</span> Earnings reports, breaking news
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Urgency Levels</h3>
                                    <p className="text-sm leading-relaxed">
                                        <span className="text-red-400 font-medium">🔥 CRITICAL:</span> &lt;24h or score ≥85<br />
                                        <span className="text-orange-400 font-medium">⚡ HIGH:</span> &lt;48h or score ≥70<br />
                                        <span className="text-yellow-400 font-medium">📊 MEDIUM:</span> &lt;7 days or score ≥50<br />
                                        <span className="text-slate-400 font-medium">⏳ LOW:</span> Long-term markets
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Listener (Real-Time Monitoring)</h3>
                                    <p className="text-sm leading-relaxed">
                                        The Listener continuously scans Twitter, RSS feeds, and news APIs for information about tracked markets.
                                        <span className="text-yellow-400 font-medium"> ⭐ Favorited markets</span> receive priority monitoring with more frequent updates.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Favorites System</h3>
                                    <p className="text-sm leading-relaxed">
                                        Click the ⭐ star to mark markets as favorites. Favorites appear first in the list and receive
                                        <span className="text-green-400 font-medium"> priority monitoring</span> from the Listener (3x more frequent scans).
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowHelpModal(false)}
                                className="mt-8 w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition"
                            >
                                Got it!
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
