"use client"

import { useEffect, useState } from 'react'
import { login, fetchMetrics, fetchConfig, updateConfig } from '@/services/api'
import { Loader2, Activity, DollarSign, BarChart3, List, Power } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function Home() {
    const [user, setUser] = useState<any>(null)
    const [metrics, setMetrics] = useState<any>(null)
    const [config, setConfig] = useState<any>(null)
    const [logs, setLogs] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // Check if running in Telegram WebApp
        if (typeof window !== 'undefined') {
            const tg = window.Telegram?.WebApp;
            if (tg) {
                tg.ready();
                tg.expand();

                login()
                    .then(data => {
                        setUser(data.user)
                        return Promise.all([fetchMetrics(), fetchConfig()])
                    })
                    .then(([metricsData, configData]) => {
                        setMetrics(metricsData)
                        setConfig(configData)
                        setLoading(false)
                        connectWebSocket()
                    })
                    .catch(err => {
                        console.error("Login/Fetch failed", err)
                        setLoading(false)
                    })
            } else {
                // Dev mode fallback
                login().then(data => {
                    setUser(data.user)
                    return Promise.all([fetchMetrics(), fetchConfig()])
                }).then(([m, c]) => {
                    setMetrics(m)
                    setConfig(c)
                    setLoading(false)
                    connectWebSocket()
                }).catch(e => {
                    setError("Telegram WebApp not detected & Dev login failed.")
                    setLoading(false)
                })
            }
        }
    }, [])

    const connectWebSocket = () => {
        const wsUrl = process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws') || 'ws://localhost:8000';
        const ws = new WebSocket(`${wsUrl}/api/v1/ws/logs`);

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                setLogs(prev => [`[${data.module}] ${data.message}`, ...prev].slice(0, 50))
            } catch (e) {
                console.error("WS Parse Error", e)
            }
        }

        return () => ws.close()
    }

    const handleToggleModule = async (moduleName: string) => {
        if (!config) return;
        const newState = !config[moduleName]?.is_enabled;

        // Optimistic update
        setConfig((prev: any) => ({
            ...prev,
            [moduleName]: { ...prev[moduleName], is_enabled: newState }
        }))

        try {
            await updateConfig(moduleName, newState)
        } catch (e) {
            console.error("Failed to update config", e)
            // Revert
            setConfig((prev: any) => ({
                ...prev,
                [moduleName]: { ...prev[moduleName], is_enabled: !newState }
            }))
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center flex-col gap-4">
                <Loader2 className="animate-spin text-blue-500" size={48} />
                <p className="text-gray-400">Loading Dashboard...</p>
            </div>
        )
    }

    if (error && !user) {
        return (
            <div className="flex h-screen items-center justify-center flex-col gap-4 p-6 text-center">
                <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
                <p className="text-gray-300">{error}</p>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto pb-24">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Polymarket Bot
                    </h1>
                    {user && <p className="text-sm text-gray-400">Welcome, {user.username}</p>}
                </div>
                <Link href="/radar" className="px-4 py-2 bg-blue-600 rounded-lg font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-500/20">
                    Open Radar
                </Link>
            </header>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total PnL"
                    value={metrics?.pnl?.total ? `$${metrics.pnl.total}` : '$0.00'}
                    icon={<DollarSign className="text-green-400" />}
                    trend="+2.5%"
                />
                <MetricCard
                    title="Active Orders"
                    value={metrics?.total_orders || '0'}
                    icon={<List className="text-blue-400" />}
                />
                <MetricCard
                    title="Volume"
                    value={metrics?.total_volume ? `$${metrics.total_volume}` : '$0.00'}
                    icon={<Activity className="text-purple-400" />}
                />
                <MetricCard
                    title="Tracked Markets"
                    value={metrics?.markets_tracked || '0'}
                    icon={<BarChart3 className="text-orange-400" />}
                />
            </div>

            {/* Module Control */}
            <div className="bg-gray-800/50 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/50">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Power size={20} className="text-yellow-400" /> System Modules
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {['radar', 'listener', 'trader', 'oracle'].map(module => (
                        <div key={module} className="flex items-center justify-between p-4 bg-gray-800 rounded-xl border border-gray-700">
                            <span className="capitalize font-medium">{module}</span>
                            <button
                                onClick={() => handleToggleModule(module)}
                                className={cn(
                                    "w-12 h-6 rounded-full transition-colors relative",
                                    config?.[module]?.is_enabled ? "bg-green-500" : "bg-gray-600"
                                )}
                            >
                                <div className={cn(
                                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                                    config?.[module]?.is_enabled ? "left-7" : "left-1"
                                )} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Console Logs */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 h-96 flex flex-col overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-gray-800 bg-gray-800/50 flex justify-between items-center">
                    <h2 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider text-gray-400">
                        <Activity size={16} /> Live Event Log
                    </h2>
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto font-mono text-xs p-4 space-y-2">
                    {logs.length === 0 && <span className="text-gray-600 italic">Waiting for system events...</span>}
                    {logs.map((log, i) => (
                        <div key={i} className="flex gap-2 animate-in fade-in slide-in-from-bottom-1 duration-300">
                            <span className="text-gray-600">[{new Date().toLocaleTimeString()}]</span>
                            <span className="text-green-400">{log}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function MetricCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend?: string }) {
    return (
        <div className="bg-gray-800/50 backdrop-blur p-5 rounded-2xl border border-gray-700/50 hover:border-gray-600 transition group">
            <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-gray-700/30 rounded-lg group-hover:bg-gray-700/50 transition">
                    {icon}
                </div>
                {trend && <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full">{trend}</span>}
            </div>
            <div>
                <p className="text-gray-400 text-sm font-medium">{title}</p>
                <p className="text-2xl font-bold mt-1 text-white">{value}</p>
            </div>
        </div>
    )
}
