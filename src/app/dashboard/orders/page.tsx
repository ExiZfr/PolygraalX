"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, Wallet, CheckCircle2, XCircle, TrendingUp, TrendingDown, Clock, Search, Filter } from "lucide-react";
import { paperStore, PaperOrder, PaperProfile } from "@/lib/paper-trading";

type Tab = 'REAL' | 'PAPER';

export default function OrdersPage() {
    const [activeTab, setActiveTab] = useState<Tab>('PAPER');
    const [orders, setOrders] = useState<PaperOrder[]>([]);
    const [profile, setProfile] = useState<PaperProfile | null>(null);

    // Initial dummy data for demo if empty
    useEffect(() => {
        // Load data on mount and interval
        const load = () => {
            setOrders(paperStore.getOrders());
            setProfile(paperStore.getProfile());
        };
        load();
        const interval = setInterval(load, 2000); // Live update
        return () => clearInterval(interval);
    }, []);

    // Filter Logic
    const activeOrders = orders.filter(o => o.status === 'OPEN');
    const historyOrders = orders.filter(o => o.status !== 'OPEN');

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 pb-20">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header & Wallet Switcher */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Orders History</h1>
                        <p className="text-slate-400">Track and manage your market entries</p>
                    </div>

                    <div className="bg-white/5 p-1 rounded-xl flex gap-1 border border-white/10">
                        <button
                            onClick={() => setActiveTab('REAL')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'REAL'
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Wallet size={16} />
                            Real Wallet
                        </button>
                        <button
                            onClick={() => setActiveTab('PAPER')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'PAPER'
                                    ? 'bg-green-600 text-white shadow-lg'
                                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <History size={16} />
                            Paper Trading
                        </button>
                    </div>
                </div>

                {/* Wallet Balance Card (Context Aware) */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl p-6 border ${activeTab === 'PAPER'
                            ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/10 border-green-500/30'
                            : 'bg-gradient-to-br from-blue-900/20 to-indigo-900/10 border-blue-500/30'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm font-bold uppercase tracking-wider mb-1 ${activeTab === 'PAPER' ? 'text-green-400' : 'text-blue-400'}`}>
                                {activeTab === 'PAPER' ? 'Simulated Balance' : 'Live USDC Balance'}
                            </p>
                            <h2 className="text-4xl font-mono font-bold text-white">
                                ${activeTab === 'PAPER' ? (profile?.currentBalance.toFixed(2) || '0.00') : '0.00'}
                            </h2>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-slate-400 mb-1">Total PnL</p>
                            <div className={`text-xl font-bold flex items-center justify-end gap-1 ${activeTab === 'PAPER' && (profile?.totalPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                {(profile?.totalPnL || 0) >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                ${activeTab === 'PAPER' ? Math.abs(profile?.totalPnL || 0).toFixed(2) : '0.00'}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* OPEN ORDERS */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Clock size={18} className="text-yellow-400" />
                                Active Positions ({activeTab === 'PAPER' ? activeOrders.length : 0})
                            </h3>
                        </div>

                        {activeTab === 'REAL' ? (
                            <div className="p-12 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-slate-500">
                                <Wallet size={48} className="mb-4 opacity-50" />
                                <p>No active positions on Mainnet</p>
                            </div>
                        ) : activeOrders.length === 0 ? (
                            <div className="p-12 bg-white/5 rounded-xl flex flex-col items-center justify-center text-slate-500 border border-white/5">
                                <Clock size={48} className="mb-4 opacity-50" />
                                <p>Waiting for signals...</p>
                                <p className="text-xs mt-2 text-slate-600">Go to Radar to snip opportunities</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {activeOrders.map(order => (
                                    <motion.div
                                        key={order.id}
                                        layout
                                        className="bg-[#0A0B10] border border-white/10 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-white/20 transition-colors"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${order.outcome === 'YES' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {order.outcome}
                                                </span>
                                                <h4 className="font-semibold text-sm text-slate-200">{order.marketTitle}</h4>
                                            </div>
                                            <div className="text-xs text-slate-500 font-mono">
                                                Entry: <span className="text-white">${order.entryPrice}</span> · Shares: <span className="text-white">{order.shares}</span> · ID: #{order.id}
                                            </div>
                                        </div>
                                        <div className="bg-slate-900 px-4 py-2 rounded-lg text-right min-w-[120px]">
                                            <div className="text-xs text-slate-500">Value</div>
                                            <div className="font-mono font-bold text-green-400">${order.amount.toFixed(2)}</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* HISTORY */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <History size={18} className="text-slate-400" />
                            History
                        </h3>

                        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden min-h-[400px]">
                            {activeTab === 'PAPER' && historyOrders.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-slate-500 text-sm p-8 text-center">
                                    <History size={32} className="mb-2 opacity-50 block mx-auto" />
                                    No trade history yet
                                </div>
                            ) : activeTab === 'REAL' ? (
                                <div className="h-full flex items-center justify-center text-slate-500 text-sm p-8 text-center">
                                    <History size={32} className="mb-2 opacity-50 block mx-auto" />
                                    No history
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {historyOrders.map(order => (
                                        <div key={order.id} className="p-4 hover:bg-white/5 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs text-slate-500 font-mono">
                                                    {new Date(order.timestamp).toLocaleDateString()}
                                                </span>
                                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${(order.pnl || 0) >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                                    }`}>
                                                    {(order.pnl || 0) >= 0 ? 'WIN' : 'LOSS'}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium line-clamp-1 mb-2">{order.marketTitle}</p>
                                            <div className="flex justify-between items-end">
                                                <div className="text-xs text-slate-400">
                                                    PnL
                                                </div>
                                                <div className={`font-mono font-bold ${(order.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {(order.pnl || 0) > 0 ? '+' : ''}${(order.pnl || 0).toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
