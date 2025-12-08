"use client";

import { motion } from "framer-motion";
import { Wallet, TrendingUp, History, PieChart, Shield } from "lucide-react";
import { PaperProfile } from "@/lib/paper-trading";

export default function PaperTradingWidget({ profile }: { profile: PaperProfile | null }) {
    if (!profile) return null;

    const stats = [
        {
            label: "Paper Balance",
            value: `$${profile.currentBalance.toFixed(2)}`,
            icon: Wallet,
            color: "text-blue-400"
        },
        {
            label: "Total PnL",
            value: `$${profile.totalPnL.toFixed(2)}`,
            icon: TrendingUp,
            color: profile.totalPnL >= 0 ? "text-green-400" : "text-red-400"
        },
        {
            label: "Win Rate",
            value: `${profile.winRate.toFixed(1)}%`,
            icon: PieChart,
            color: "text-purple-400"
        },
    ];

    return (
        <div className="bg-[#0C0D12] border border-white/5 rounded-2xl p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                        <Shield size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">Paper Trading</h3>
                        <p className="text-xs text-slate-500">Risk-free simulation mode</p>
                    </div>
                </div>
                <div className={`px-2 py-1 border text-xs font-bold rounded uppercase tracking-wider ${profile.active
                        ? 'bg-green-500/10 border-green-500/20 text-green-400'
                        : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
                    }`}>
                    {profile.active ? 'Active' : 'Paused'}
                </div>
            </div>

            <div className="space-y-4 flex-1">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white/[0.02] p-4 rounded-xl flex items-center justify-between group hover:bg-white/[0.04] transition-colors">
                        <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-300">
                            <stat.icon size={18} />
                            <span className="text-sm font-medium">{stat.label}</span>
                        </div>
                        <div className={`font-mono font-bold text-lg ${stat.color}`}>
                            {stat.value}
                        </div>
                    </div>
                ))}

                <div className="bg-white/[0.02] p-4 rounded-xl flex items-center justify-between group hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-300">
                        <History size={18} />
                        <span className="text-sm font-medium">Total Trades</span>
                    </div>
                    <div className="font-mono font-bold text-lg text-white">
                        {profile.tradesCount}
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5">
                <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2">
                    <History size={16} />
                    View Trade History
                </button>
            </div>
        </div>
    );
}
