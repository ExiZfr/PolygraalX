"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, RefreshCw, User, Shield, AlertTriangle, Wallet } from "lucide-react";
import { paperStore, PaperProfile } from "@/lib/paper-trading";

export default function SettingsPage() {
    const [profile, setProfile] = useState<PaperProfile>(paperStore.getProfile());
    const [balanceInput, setBalanceInput] = useState(1000);
    const [usernameInput, setUsernameInput] = useState("Ghost Trader");

    useEffect(() => {
        setProfile(paperStore.getProfile());
        setBalanceInput(paperStore.getProfile().initialBalance);
        setUsernameInput(paperStore.getProfile().username);
    }, []);

    const handleSaveProfile = () => {
        const current = paperStore.getProfile();
        // Update keeping history if name changes, or logic for full reset?
        // For simplicity, we just update config parts
        const updated = { ...current, username: usernameInput, active: true };
        paperStore.saveProfile(updated);
        setProfile(updated);
        console.log("Profile Saved");
    };

    const handleReset = () => {
        if (confirm("⚠️ This will WIPE all your trading history and reset balance. Are you sure?")) {
            paperStore.reset(balanceInput);
            setProfile(paperStore.getProfile());
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 pb-20">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 mb-8"
                >
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                        <Wallet size={24} className="text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Settings & Configuration</h1>
                        <p className="text-slate-400">Manage your bot parameters and simulation accounts</p>
                    </div>
                </motion.div>

                {/* PAPER TRADING SECTION */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-1 rounded-2xl bg-gradient-to-r from-green-500/50 via-emerald-500/50 to-teal-500/50"
                >
                    <div className="bg-[#0A0B10] rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/20 rounded-lg">
                                    <User size={20} className="text-green-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Paper Trading Profile</h2>
                                    <p className="text-sm text-green-400/80 font-mono">Simulated Environment Active</p>
                                </div>
                            </div>
                            <div className="px-3 py-1 bg-green-900/30 border border-green-500/30 rounded-full text-xs text-green-400 font-bold uppercase tracking-wider">
                                {profile.active ? 'System Online' : 'Offline'}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Avatar / Identity */}
                            <div className="space-y-4">
                                <label className="text-sm text-slate-400 font-medium">Virtual Identity</label>
                                <div className="flex gap-4">
                                    <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-green-500/50 flex items-center justify-center text-2xl">
                                        👻
                                    </div>
                                    <input
                                        type="text"
                                        value={usernameInput}
                                        onChange={(e) => setUsernameInput(e.target.value)}
                                        className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-4 text-white focus:border-green-500/50 focus:outline-none transition"
                                        placeholder="Trader Name"
                                    />
                                </div>
                            </div>

                            {/* Balance Config */}
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <label className="text-sm text-slate-400 font-medium">Initial Balance ($)</label>
                                    <span className="text-xs text-slate-500">Current PnL: <span className={profile.totalPnL >= 0 ? "text-green-400" : "text-red-400"}>${profile.totalPnL.toFixed(2)}</span></span>
                                </div>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                    <input
                                        type="number"
                                        value={balanceInput}
                                        onChange={(e) => setBalanceInput(Number(e.target.value))}
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white font-mono text-lg focus:border-green-500/50 focus:outline-none transition"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-4 border-t border-white/5 pt-6">
                            <button
                                onClick={handleSaveProfile}
                                className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-black font-bold rounded-xl transition flex items-center justify-center gap-2"
                            >
                                <Save size={18} />
                                Save Profile
                            </button>
                            <button
                                onClick={handleReset}
                                className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl transition flex items-center gap-2"
                            >
                                <RefreshCw size={18} />
                                Reset Account
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* BOT CONF SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-6 bg-white/5 rounded-2xl border border-white/10"
                    >
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Shield size={18} className="text-blue-400" />
                            Risk Management
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400 block mb-2">Max Amount per Snipe</label>
                                <input type="range" min="10" max="500" className="w-full accent-blue-500" />
                                <div className="flex justify-between text-xs text-slate-500 mt-1">
                                    <span>$10</span>
                                    <span>$500</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 rounded border-slate-600 accent-blue-500" defaultChecked />
                                <div className="text-sm">
                                    <span className="block text-white font-medium">Auto-Stop Loss</span>
                                    <span className="text-slate-500 text-xs">Sell if price drops &gt; 15%</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-6 bg-white/5 rounded-2xl border border-white/10"
                    >
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <AlertTriangle size={18} className="text-orange-400" />
                            Emergency
                        </h3>
                        <div className="space-y-4">
                            <button className="w-full py-3 border border-red-500/50 text-red-500 hover:bg-red-500/10 rounded-xl font-medium transition text-sm">
                                PANIC BUTTON: CLOSE ALL POSITIONS
                            </button>
                            <p className="text-xs text-slate-500 text-center">
                                Use this only if the API behaves erratically. This will dump all simulated holdings.
                            </p>
                        </div>
                    </motion.div>
                </div>

            </div>
        </div>
    );
}
