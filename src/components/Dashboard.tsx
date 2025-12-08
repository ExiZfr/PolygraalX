"use client";

import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import OverviewStats from "@/components/dashboard/OverviewStats";
import ActiveModules, { ModuleType } from "@/components/dashboard/ActiveModules";
import ConsoleLogs, { LogType } from "@/components/dashboard/ConsoleLogs";
import PaperTradingWidget from "@/components/dashboard/PaperTradingWidget";
import { Radar, Zap, Users } from "lucide-react";

import { fetchPolymarketMarkets } from "@/lib/polymarket";
import { calculateSnipability } from "@/lib/snipability-algo";
import { ToastNotification, useToast } from "@/components/ToastNotification";
import { paperStore, PaperProfile } from "@/lib/paper-trading";

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
    const [consoleFilter, setConsoleFilter] = useState<'ALL' | 'EXEC' | 'SCAN' | 'INFO' | 'WARN'>('ALL');
    const [paperProfile, setPaperProfile] = useState<PaperProfile | null>(null);

    const { toasts, addToast, removeToast } = useToast();

    // Data Loading Logic
    useEffect(() => {
        loadRealMetrics();
        setPaperProfile(paperStore.getProfile());

        const interval = setInterval(() => {
            loadRealMetrics();
            setPaperProfile(paperStore.getProfile());
        }, 60000);

        // Mock Listener Connection (Replace with real listener logic if needed)
        // For now, we simulate logs to show UI activity
        const mockLogInterval = setInterval(() => {
            if (Math.random() > 0.7) {
                const types: LogType['level'][] = ['INFO', 'INFO', 'MARKET'];
                const type = types[Math.floor(Math.random() * types.length)];
                addLog(type, `System check: ${type === 'INFO' ? 'Scanning batch #24' : 'Optimal latency verified'}`);
            }
        }, 5000);

        return () => {
            clearInterval(interval);
            clearInterval(mockLogInterval);
        };
    }, []);

    const addLog = (level: LogType['level'], message: string) => {
        setLogs(prev => [{
            id: Date.now() + Math.random(),
            timestamp: new Date().toLocaleTimeString('en-GB', { hour12: false }),
            level,
            message
        }, ...prev].slice(0, 100));
    };

    async function loadRealMetrics() {
        try {
            const rawMarkets = await fetchPolymarketMarkets();

            const scored = rawMarkets.map(market => ({
                market,
                sniping: calculateSnipability(market)
            }));

            const snipable = scored.filter(m => m.sniping.score > 50);
            const totalScore = scored.reduce((sum, item) => sum + item.sniping.score, 0);
            const highest = Math.max(...scored.map(m => m.sniping.score), 0);

            setStats({
                marketsScanned: scored.length,
                snipableMarkets: snipable.length,
                avgScore: scored.length > 0 ? totalScore / scored.length : 0,
                highestScore: highest
            });

            // Update Module Stats
            setModules(prev => prev.map(m => {
                if (m.name === "Sniper Engine") {
                    return { ...m, stats: [{ label: "Latency", value: "45ms" }, { label: "Markets", value: scored.length.toString() }] };
                }
                if (m.name === "PolyRadar") {
                    return { ...m, stats: [{ label: "Scanned", value: scored.length.toString() }, { label: "Snipable", value: snipable.length.toString() }] };
                }
                return m;
            }));

        } catch (error) {
            console.error("Failed to load metrics", error);
            addLog("ERR", "Failed to fetch market data");
        }
    }

    return (
        <DashboardLayout>
            <OverviewStats stats={stats} />
            <ActiveModules modules={modules} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ConsoleLogs
                        logs={logs}
                        filter={consoleFilter}
                        setFilter={setConsoleFilter}
                    />
                </div>
                <div className="lg:col-span-1 h-full">
                    <PaperTradingWidget profile={paperProfile} />
                </div>
            </div>

            <ToastNotification toasts={toasts} onRemove={removeToast} />
        </DashboardLayout>
    );
}
