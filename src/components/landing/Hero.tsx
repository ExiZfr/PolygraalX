"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, BarChart3, Zap, Shield } from "lucide-react";
import { useRef } from "react";

export default function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

    const fadeInUp = {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
    };

    return (
        <section
            ref={containerRef}
            className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-32 overflow-hidden"
        >
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Main Gradient Orb */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] animate-blob" />

                {/* Secondary Orbs */}
                <div className="absolute top-1/3 left-[20%] w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[100px] animate-blob animation-delay-2000" />
                <div className="absolute top-1/2 right-[15%] w-[300px] h-[300px] bg-blue-600/15 rounded-full blur-[80px] animate-blob animation-delay-4000" />

                {/* Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px'
                    }}
                />
            </div>

            <motion.div
                style={{ y, opacity, scale }}
                className="relative z-10 text-center max-w-5xl mx-auto px-6"
            >
                {/* Live Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass mb-8 hover:bg-white/[0.06] transition-all cursor-pointer group"
                >
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                        Live Trading Active
                    </span>
                    <Sparkles size={14} className="text-yellow-400" />
                </motion.div>

                {/* Main Headline */}
                <motion.h1
                    {...fadeInUp}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[1.05]"
                >
                    <span className="text-white">Trade Smarter on</span>
                    <br />
                    <span className="gradient-text">Polymarket</span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    {...fadeInUp}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                    Automated trading bot with{" "}
                    <span className="text-white font-medium">AI-powered market analysis</span>,{" "}
                    real-time sniping, and copy trading. Maximize profits with precision.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    {...fadeInUp}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
                >
                    <Link
                        href="https://t.me/Plmktradingbot"
                        target="_blank"
                        className="btn-primary flex items-center gap-3 text-base sm:text-lg group relative z-10"
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            <Zap size={20} />
                            Start Trading Now
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                    </Link>


                </motion.div>

                {/* Trust Indicators */}
                <motion.div
                    {...fadeInUp}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-slate-500 text-sm"
                >
                    <div className="flex items-center gap-2">
                        <Shield size={16} className="text-green-500" />
                        <span>Secure & Private</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>24/7 Active Monitoring</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-yellow-500" />
                        <span>AI-Powered Analysis</span>
                    </div>
                </motion.div>

                {/* Dashboard Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                    className="relative mt-20 w-full max-w-5xl mx-auto"
                >
                    {/* Glow Effect */}
                    <div className="absolute -inset-4 bg-gradient-to-b from-indigo-500/20 via-purple-500/10 to-transparent rounded-3xl blur-2xl" />

                    {/* Browser Frame */}
                    <div className="relative rounded-2xl border border-white/10 bg-[#0C0D12] overflow-hidden shadow-2xl shadow-indigo-900/20">
                        {/* Browser Header */}
                        <div className="h-10 sm:h-12 bg-[#15171E] border-b border-white/5 flex items-center px-4 gap-2">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                            </div>
                            <div className="ml-4 h-6 flex-1 max-w-md bg-white/5 rounded-lg flex items-center px-3">
                                <span className="text-xs text-slate-500">app.polygraalx.app/dashboard</span>
                            </div>
                        </div>

                        {/* Dashboard Content Placeholder */}
                        <div className="aspect-[16/9] bg-gradient-to-br from-[#0A0B10] to-[#0F1015] p-6 sm:p-8">
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                {[
                                    { label: "Portfolio", value: "$124,500", change: "+12.4%" },
                                    { label: "24h Profit", value: "$2,847", change: "+8.2%" },
                                    { label: "Win Rate", value: "87%", change: "+3.1%" },
                                ].map((stat, i) => (
                                    <motion.div
                                        key={stat.label}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.8 + i * 0.1 }}
                                        className="glass rounded-xl p-4 sm:p-5"
                                    >
                                        <div className="text-xs sm:text-sm text-slate-500 mb-1">{stat.label}</div>
                                        <div className="text-xl sm:text-2xl font-bold text-white">{stat.value}</div>
                                        <div className="text-xs text-green-400 mt-1">{stat.change}</div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Chart Placeholder */}
                            <div className="glass rounded-xl h-32 sm:h-48 flex items-center justify-center">
                                <div className="flex items-end gap-1 h-20 sm:h-32">
                                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ height: 0 }}
                                            animate={{ height: `${h}%` }}
                                            transition={{ delay: 1.2 + i * 0.05, duration: 0.5 }}
                                            className="w-4 sm:w-6 bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Floating Card - Right */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.5, duration: 0.6 }}
                        className="absolute -right-4 sm:right-8 top-1/3 glass-strong rounded-xl p-4 shadow-xl hidden sm:block"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                <Zap size={20} className="text-green-400" />
                            </div>
                            <div>
                                <div className="text-xs text-slate-400">New Snipe</div>
                                <div className="text-sm font-bold text-green-400">+$1,247 (89%)</div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </motion.div>

            {/* Bottom Gradient Fade */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#06070A] to-transparent pointer-events-none" />
        </section>
    );
}
