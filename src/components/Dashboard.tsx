"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Radar,
    Zap,
    Users,
    Activity,
    TrendingUp,
    TrendingDown,
    Clock,
    Terminal,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";
import { fetchPolymarketMarkets } from "@/lib/polymarket";
import { calculateSnipability } from "@/lib/snipability-algo";
import { filterSnipableMarkets } from "@/lib/dynamic-filter";
import { ToastNotification, useToast } from "@/components/ToastNotification";

type LogType = {
    id: number;
    timestamp: string;
    level: 'INFO' | 'EXEC' | 'WARN' | 'ERR' | 'MARKET';
    message: string;
};

type ModuleType = {
    id: number;
    name: string;
    description: string;
    icon: React.ElementType;
    active: boolean;
    color: string;
    stats: { label: string; value: string }[];
};

const MODULES_CONFIG: ModuleType[] = [
    {
        id: 1,
        name: "Sniper Engine",
        description: "Real-time opportunity detection",
        icon: Zap,
        active: true,
        color: "text-amber-500",
        stats: [
            { label: "Latency", value: "Loading..." },
            { label: "Markets", value: "—" }
        ]
    },
    {
        id: 2,
        name: "PolyRadar",
        description: "Live market scanner",
        icon: Radar,
        active: true,
        color: "text-blue-500",
        stats: [
            { label: "Scanned", value: "—" },
            { label: "Snipable", value: "—" }
        ]
    },
    {
        id: 3,
        name: "Whale Copy",
        description: "Smart money tracker",
        icon: Users,
        active: false,
        color: "text-purple-500",
        stats: [
            { label: "Tracked", value: "8" },
            { label: "Vol", value: "$45k" }
        ]
    }
];

export default function Dashboard() {
    const [modules, setModules] = useState<ModuleType[]>(MODULES_CONFIG);
    const [logs, setLogs] = useState<LogType[]>([
        { id: 1, timestamp: new Date().toLocaleTimeString('en-GB'), level: "INFO", message: "🚀 PolyGraalX v2.3 initialized" },
        { id: 2, timestamp: new Date().toLocaleTimeString('en-GB'), level: "INFO", message: "🔗 Connected to Polymarket API" },
    ]);
    const [stats, setStats] = useState({
        marketsScanned: 0,
        snipableMarkets: 0,
        avgScore: 0,
        highestScore: 0
    });

    const previousMarketCount = useRef(0);
    const { toasts, addToast, removeToast, showMarket } = useToast();

    // Load REAL market data
    useEffect(() => {
        loadRealMetrics();

        // Refresh every 60 seconds
        const interval = setInterval(() => {
            loadRealMetrics();
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    async function loadRealMetrics() {
        try {
            addLog('INFO', '📡 Fetching live market data...');

            const startTime = Date.now();
            const rawMarkets = await fetchPolymarketMarkets();
            const fetchLatency = Date.now() - startTime;

            const scored = rawMarkets.map(market => ({
                market,
                sniping: calculateSnipability(market)
            }));

            const snipable = filterSnipableMarkets(scored, 25, 500);

            const avgScore = snipable.length > 0
                ? Math.round(snipable.reduce((sum, m) => sum + m.sniping.score, 0) / snipable.length)
                : 0;

            const highestScore = snipable.length > 0
                ? Math.max(...snipable.map(m => m.sniping.score))
                : 0;

            // Update stats
            setStats({
                marketsScanned: rawMarkets.length,
                snipableMarkets: snipable.length,
                avgScore,
                highestScore
            });

            // Update modules with real data
            setModules(prev => prev.map(m => {
                if (m.id === 1) { // Sniper Engine
                    return {
                        ...m,
                        stats: [
                            { label: "Latency", value: `${fetchLatency}ms` },
                            { label: "Markets", value: rawMarkets.length.toString() }
                        ]
                    };
                }
                if (m.id === 2) { // PolyRadar
                    return {
                        ...m,
                        stats: [
                            { label: "Scanned", value: rawMarkets.length.toString() },
                            { label: "Snipable", value: snipable.length.toString() }
                        ]
                    };
                }
                return m;
            }));

            addLog('INFO', `✅ Found ${rawMarkets.length} markets, ${snipable.length} snipable`);

            // Check for NEW markets and notify
            if (previousMarketCount.current > 0 && snipable.length > previousMarketCount.current) {
                const newCount = snipable.length - previousMarketCount.current;
                const bestNew = snipable[0]; // Assume sorted by score

                addLog('MARKET', `🎯 ${newCount} new snipable market${newCount > 1 ? 's' : ''} detected!`);

                showMarket(
                    `🎯 New Opportunity Detected!`,
                    `${bestNew.market.title.substring(0, 60)}... (Score: ${bestNew.sniping.score})`
                );
            }

            previousMarketCount.current = snipable.length;

            // Add random event logs for activity
            if (Math.random() > 0.5) {
                const topMarket = snipable[0];
                if (topMarket) {
                    addLog('INFO', `🔍 Top market: "${topMarket.market.title.substring(0, 40)}..." (Score: ${topMarket.sniping.score})`);
                }
            }

        } catch (error) {
            console.error('[Dashboard] Failed to load metrics:', error);
            addLog('ERR', '❌ Failed to fetch market data');
        }
    }

    const addLog = (level: LogType['level'], message: string) => {
        setLogs(prev => [{
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString('en-GB', { hour12: false }),
            level,
            message
        }, ...prev].slice(0, 100)); // Keep last 100 logs
    };

    const toggleModule = (id: number) => {
        setModules(prev => prev.map(m =>
            m.id === id ? { ...m, active: !m.active } : m
        ));
        const module = modules.find(m => m.id === id);
        addLog('INFO', `${module?.active ? '⏸️ Paused' : '▶️ Started'} ${module?.name}`);
    };

    return (
        <>
            <ToastNotification toasts={toasts} onRemove={removeToast} />

            <div className="min-h-screen bg-[#050505] text-white p-6 pb-20">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
                    >
                        <h1 className="text-3xl font-bold mb-2">
                            Dashboard <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-400">PolyGraalX</span>
                        </h1>
                        <p className="text-slate-400">Real-time market intelligence & automation</p>
                    </motion.div>

                    {/* Live Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            label="Markets Scanned"
                            value={stats.marketsScanned}
                            icon={Radar}
                            color="from-blue-500 to-cyan-500"
                        />
                        <StatCard
                            label="Snipable Opportunities"
                            value={stats.snipableMarkets}
                            icon={TrendingUp}
                            color="from-green-500 to-emerald-500"
                            suffix=""
                        />
                        <StatCard
                            label="Average Score"
                            value={stats.avgScore}
                            icon={Activity}
                            color="from-purple-500 to-pink-500"
                            suffix="/100"
                        />
                        <StatCard
                            label="Highest Score"
                            value={stats.highestScore}
                            icon={ArrowUpRight}
                            color="from-yellow-500 to-orange-500"
                            suffix="/100"
                        />
                    </div>

                    {/* Modules Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {modules.map(module => (
                            <ModuleCard
                                key={module.id}
                                module={module}
                                onToggle={() => toggleModule(module.id)}
                            />
                        ))}
                    </div>

                    {/* Live Console */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl overflow-hidden"
                    >
                        <div className="border-b border-white/10 p-4 flex items-center gap-2">
                            <Terminal size={20} className="text-green-400" />
                            <h3 className="font-semibold">Live Console</h3>
                            <div className="ml-auto flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                <span className="text-xs text-green-400">LIVE</span>
                            </div>
                        </div>

                        <div className="h-[400px] overflow-y-auto p-4 font-mono text-sm space-y-1">
                            <AnimatePresence initial={false}>
                                {logs.map((log) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0 }}
                                        className={`flex items-start gap-3 ${getLogColor(log.level)}`}
                                    >
                                        <span className="text-slate-500 min-w-[70px]">{log.timestamp}</span>
                                        <span className={`min-w-[60px] font-bold ${getLevelColor(log.level)}`}>
                                            [{log.level}]
                                        </span>
                                        <span className="flex-1">{log.message}</span>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    );
}

// --- Utility Components ---

function StatCard({ label, value, icon: Icon, color, suffix = "" }: any) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group"
        >
            <div className={`absolute inset-0 bg-linear-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity`} />
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-400">{label}</span>
                    <Icon size={20} className={`bg-linear-to-r ${color} bg-clip-text text-transparent`} />
                </div>
                <div className="text-3xl font-bold">
                    {value}
                    <span className="text-base text-slate-400 ml-1">{suffix}</span>
                </div>
            </div>
        </motion.div>
    );
}

function ModuleCard({ module, onToggle }: { module: ModuleType; onToggle: () => void }) {
    const Icon = module.icon;

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className={`backdrop-blur-xl ${module.active ? 'bg-white/5 border-white/20' : 'bg-black/40 border-white/5'} border rounded-2xl p-6 transition-all`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 ${module.active ? 'bg-white/10' : 'bg-white/5'} rounded-lg`}>
                        <Icon size={20} className={module.color} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">{module.name}</h3>
                        <p className="text-xs text-slate-400">{module.description}</p>
                    </div>
                </div>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onToggle}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${module.active
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}
                >
                    {module.active ? 'ON' : 'OFF'}
                </motion.button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {module.stats.map((stat, idx) => (
                    <div key={idx} className="bg-black/20 rounded-lg p-2">
                        <div className="text-xs text-slate-500">{stat.label}</div>
                        <div className="text-sm font-semibold text-white">{stat.value}</div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

function getLogColor(level: string) {
    switch (level) {
        case 'INFO': return 'text-slate-300';
        case 'EXEC': return 'text-green-400';
        case 'WARN': return 'text-yellow-400';
        case 'ERR': return 'text-red-400';
        case 'MARKET': return 'text-purple-400';
        default: return 'text-slate-400';
    }
}

function getLevelColor(level: string) {
    switch (level) {
        case 'INFO': return 'text-blue-400';
        case 'EXEC': return 'text-green-400';
        case 'WARN': return 'text-yellow-400';
        case 'ERR': return 'text-red-400';
        case 'MARKET': return 'text-purple-400';
        default: return 'text-slate-400';
    }
}
