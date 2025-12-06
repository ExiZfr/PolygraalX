"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Radar,
    Zap,
    Users,
    Settings,
    Activity,
    Wallet,
    TrendingUp,
    TrendingDown,
    Clock,
    Target,
    Terminal,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Cpu
} from "lucide-react";

// --- Types ---
type Position = {
    id: string;
    market: string;
    outcome: "YES" | "NO";
    entryPrice: number;
    currentPrice: number;
    size: number;
    pnl: number;
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

type LogType = {
    id: number;
    timestamp: string;
    level: 'INFO' | 'EXEC' | 'WARN' | 'ERR';
    message: string;
};

// --- Mock Data Generators ---
const INITIAL_POSITIONS: Position[] = [
    { id: "POS-1", market: "Trump vs Biden 2024", outcome: "YES", entryPrice: 0.52, currentPrice: 0.56, size: 500, pnl: 40 },
    { id: "POS-2", market: "Fed Rates Cut - March", outcome: "NO", entryPrice: 0.30, currentPrice: 0.28, size: 200, pnl: -12 },
    { id: "POS-3", market: "GTA VI Trailer Release", outcome: "YES", entryPrice: 0.75, currentPrice: 0.82, size: 1000, pnl: 93 },
];

const MODULES_CONFIG: ModuleType[] = [
    {
        id: 1,
        name: "Sniper Engine",
        description: "Mempool monitoring & auto-buy",
        icon: Zap,
        active: true,
        color: "text-amber-500",
        stats: [
            { label: "Latency", value: "32ms" },
            { label: "Orders", value: "142" }
        ]
    },
    {
        id: 2,
        name: "PolyRadar",
        description: "Market liquidity scanner",
        icon: Radar,
        active: true,
        color: "text-blue-500",
        stats: [
            { label: "Scanned", value: "2.4k" },
            { label: "Opps", value: "5" }
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
            { label: "Targets", value: "8" },
            { label: "Vol", value: "$45k" }
        ]
    }
];

export default function Dashboard() {
    const [modules, setModules] = useState<ModuleType[]>(MODULES_CONFIG);
    const [logs, setLogs] = useState<LogType[]>([
        { id: 1, timestamp: "10:00:01", level: "INFO", message: "Bot initialized v2.1.0" },
        { id: 2, timestamp: "10:00:05", level: "INFO", message: "Connected to Polygon RPC" },
    ]);
    const [positions, setPositions] = useState<Position[]>(INITIAL_POSITIONS);
    const [stats, setStats] = useState({
        balance: 2450.50,
        dailyPnL: 125.40,
        winRate: 68
    });

    // --- Simulation Loop ---
    useEffect(() => {
        const timer = setInterval(() => {
            // 1. Randomize Prices & PnL
            setPositions(prev => prev.map(p => {
                const change = (Math.random() - 0.5) * 0.02;
                const newPrice = Math.max(0.01, Math.min(0.99, p.currentPrice + change));
                const newPnL = (newPrice - p.entryPrice) * p.size;
                return { ...p, currentPrice: newPrice, pnl: newPnL };
            }));

            // 2. Add Log
            if (Math.random() > 0.7) {
                const actions = ["Scanning...", "Tick update", "Whale mvt detected", "Liquidity change"];
                const msg = actions[Math.floor(Math.random() * actions.length)];
                addLog('INFO', `${msg} [Block #${Math.floor(Math.random() * 100000)}]`);
            }

            // 3. Update Stats
            setStats(s => ({
                ...s,
                balance: s.balance + (Math.random() - 0.5) * 2,
                dailyPnL: s.dailyPnL + (Math.random() - 0.5)
            }));

        }, 2000);
        return () => clearInterval(timer);
    }, []);

    const addLog = (level: LogType['level'], message: string) => {
        setLogs(prev => [{
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString('en-GB', { hour12: false }),
            level,
            message
        }, ...prev].slice(0, 100));
    };

    const toggleModule = (id: number) => {
        setModules(prev => prev.map(m => {
            if (m.id === id) {
                addLog('WARN', `${m.name} switched ${!m.active ? 'ON' : 'OFF'}`);
                return { ...m, active: !m.active };
            }
            return m;
        }));
    };

    return (
        <div className="min-h-screen bg-[#050505] text-slate-300 font-sans p-4 md:p-6 flex flex-col gap-6 selection:bg-blue-500/30">

            {/* --- TOP BAR: KEY METRICS --- */}
            <header className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Branding */}
                <div className="flex flex-col justify-center">
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Activity className="text-blue-500" size={24} />
                        Poly<span className="text-blue-500">GraalX</span>
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-[10px] font-mono text-green-500 uppercase">System Operational</span>
                    </div>
                </div>

                {/* Balance Card */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wallet size={48} />
                    </div>
                    <span className="text-xs font-mono text-slate-500 uppercase">Total Balance</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white tracking-tight">
                            ${stats.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-slate-400">USDC</span>
                    </div>
                </div>

                {/* PnL Card */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
                    <div className={`absolute top-0 right-0 p-4 opacity-10 ${stats.dailyPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {stats.dailyPnL >= 0 ? <TrendingUp size={48} /> : <TrendingDown size={48} />}
                    </div>
                    <span className="text-xs font-mono text-slate-500 uppercase">Daily PnL</span>
                    <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold tracking-tight ${stats.dailyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {stats.dailyPnL >= 0 ? '+' : ''}{stats.dailyPnL.toFixed(2)}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {((stats.dailyPnL / 2000) * 100).toFixed(2)}%
                        </span>
                    </div>
                </div>

                {/* Win Rate Card */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                    <span className="text-xs font-mono text-slate-500 uppercase">Win Rate (24h)</span>
                    <div className="flex items-center gap-2">
                        <div className="w-full bg-slate-800 rounded-full h-2 mt-2 relative overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${stats.winRate}%` }}></div>
                        </div>
                        <span className="text-lg font-bold text-blue-400">{stats.winRate}%</span>
                    </div>
                </div>
            </header>

            {/* --- MIDDLE: MODULES --- */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {modules.map(mod => (
                    <motion.div
                        layout
                        key={mod.id}
                        className={`p-5 rounded-xl border flex flex-col gap-4 relative overflow-hidden transition-all ${mod.active
                                ? 'bg-slate-900/80 border-slate-700 shadow-lg shadow-blue-500/5'
                                : 'bg-slate-950 border-slate-900 opacity-60'
                            }`}
                    >
                        {/* Status Light */}
                        <div className={`absolute top-0 left-0 w-1 h-full ${mod.active ? 'bg-blue-500' : 'bg-slate-800'}`} />

                        <div className="flex justify-between items-start">
                            <div className={`p-2 rounded-lg bg-slate-800/50 ${mod.active ? mod.color : 'text-slate-500'}`}>
                                <mod.icon size={22} />
                            </div>
                            <button
                                onClick={() => toggleModule(mod.id)}
                                className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider transition-colors ${mod.active
                                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20'
                                        : 'bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700'
                                    }`}
                            >
                                {mod.active ? 'Active' : 'Standby'}
                            </button>
                        </div>

                        <div>
                            <h3 className="font-bold text-white text-base">{mod.name}</h3>
                            <p className="text-xs text-slate-500 line-clamp-1">{mod.description}</p>
                        </div>

                        {/* Module Stats Matrix */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/50">
                            {mod.stats.map((stat, idx) => (
                                <div key={idx}>
                                    <p className="text-[10px] text-slate-500 uppercase">{stat.label}</p>
                                    <p className="text-sm font-mono text-slate-200">{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </section>

            {/* --- BOTTOM: SPLIT VIEW --- */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full flex-grow min-h-[400px]">

                {/* ACTIVE POSITIONS TABLE */}
                <div className="lg:col-span-2 bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                        <div className="flex items-center gap-2">
                            <Target size={16} className="text-slate-400" />
                            <h3 className="text-sm font-semibold text-white">Active Positions</h3>
                        </div>
                        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">{positions.length} Open</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs md:text-sm">
                            <thead className="bg-slate-900/50 text-slate-500 font-mono uppercase text-[10px]">
                                <tr>
                                    <th className="p-4">Market</th>
                                    <th className="p-4">Side</th>
                                    <th className="p-4 text-right">Size (USDC)</th>
                                    <th className="p-4 text-right">Entry</th>
                                    <th className="p-4 text-right">Current</th>
                                    <th className="p-4 text-right">PnL</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                <AnimatePresence>
                                    {positions.map(pos => (
                                        <motion.tr
                                            key={pos.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-slate-800/30 transition-colors"
                                        >
                                            <td className="p-4 font-medium text-white max-w-[200px] truncate">{pos.market}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pos.outcome === 'YES' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                    {pos.outcome}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right font-mono text-slate-300">${pos.size}</td>
                                            <td className="p-4 text-right font-mono text-slate-400">{pos.entryPrice.toFixed(2)}¢</td>
                                            <td className="p-4 text-right font-mono text-white">{pos.currentPrice.toFixed(2)}¢</td>
                                            <td className={`p-4 text-right font-mono font-bold ${pos.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(2)}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* LIVE CONSOLE */}
                <div className="lg:col-span-1 bg-black border border-slate-800 rounded-xl flex flex-col overflow-hidden font-mono text-xs shadow-inner shadow-black">
                    <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Terminal size={12} className="text-slate-400" />
                            <span className="text-slate-400 font-semibold">System Logs</span>
                        </div>
                        <div className="flex gap-1.5 opacity-50">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-hide">
                        <AnimatePresence initial={false}>
                            {logs.map(log => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex gap-2 text-slate-300"
                                >
                                    <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                                    <span className={`shrink-0 font-bold ${log.level === 'INFO' ? 'text-blue-500' :
                                            log.level === 'WARN' ? 'text-amber-500' :
                                                log.level === 'ERR' ? 'text-red-500' : 'text-green-500'
                                        }`}>{log.level}</span>
                                    <span className="break-all">{log.message}</span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        <div className="flex gap-2 mt-2 pt-2 border-t border-slate-900 opacity-50">
                            <span className="text-blue-500">➜</span>
                            <span className="animate-pulse bg-slate-500 w-2 h-4 block"></span>
                        </div>
                    </div>
                </div>

            </section>
        </div>
    );
}
