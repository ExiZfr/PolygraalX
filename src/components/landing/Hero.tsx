"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Terminal, Activity, Zap } from "lucide-react";
import { useRef } from "react";

export default function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const rotateX = useTransform(scrollYProgress, [0, 1], [0, -10]);

    return (
        <section ref={containerRef} className="relative min-h-[120vh] flex flex-col items-center pt-32 overflow-hidden bg-[#06070A]">

            {/* Background Ambience */}
            <div className="absolute top-0 inset-x-0 h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/20 rounded-[100%] blur-[120px] animate-blob" />
                <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] animate-blob animation-delay-2000" />

                {/* Abstract Grid Line */}
                <div className="absolute inset-0 bg-[url('/assets/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" style={{ opacity: 0.1 }} />
            </div>

            <div className="relative z-10 text-center max-w-5xl mx-auto px-6">

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 hover:bg-white/10 transition cursor-pointer"
                >
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-medium text-slate-300">New: Copy Trading Mode V2.3</span>
                </motion.div>

                {/* Main Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="text-6xl md:text-8xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
                >
                    Dominate <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-indigo-400 to-purple-400">Polymarket</span>
                    <br />
                    <span className="text-white/40">with AI Precision.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                    The sophisticated terminal for algorithmic prediction market scalping.
                    <br className="hidden md:block" />
                    Radar, Sniping, CopyTrading, and Oracle – all in one dashboard.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
                >
                    <Link
                        href="https://t.me/Plmktradingbot"
                        className="group relative px-8 py-4 bg-white text-black font-bold rounded-xl flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Terminal size={20} />
                        Launch Telegram Bot
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                        href="/dashboard"
                        className="px-8 py-4 text-white font-bold rounded-xl border border-white/10 hover:bg-white/5 transition flex items-center gap-2 bg-white/5 backdrop-blur-sm"
                    >
                        <Activity size={20} className="text-blue-400" />
                        Open Dashboard
                    </Link>
                </motion.div>

                {/* 3D Dashboard Mockup */}
                <motion.div
                    style={{ y, opacity, rotateX }}
                    className="relative w-full aspect-[16/9] max-w-6xl mx-auto"
                >
                    <div className="absolute -inset-1 bg-linear-to-b from-blue-500/20 to-purple-500/0 rounded-2xl blur-lg" />
                    <div className="relative rounded-2xl border border-white/10 bg-[#0A0B10] overflow-hidden shadow-2xl shadow-blue-900/20">
                        {/* Mockup Header */}
                        <div className="h-8 bg-[#15171e] border-b border-white/5 flex items-center px-4 gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/20" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                            <div className="w-3 h-3 rounded-full bg-green-500/20" />
                            <div className="ml-4 h-4 w-64 bg-white/5 rounded-full" />
                        </div>

                        {/* Content Image */}
                        <Image
                            src="/assets/hero_dashboard.png"
                            alt="Dashboard"
                            width={1920}
                            height={1080}
                            className="w-full h-full object-cover opacity-90"
                            priority
                        />

                        {/* Overlays / Floating Info */}
                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 1, duration: 0.5 }}
                            className="absolute top-12 right-12 p-4 bg-black/80 backdrop-blur-xl border border-green-500/30 rounded-lg shadow-xl"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                                    <Zap size={20} />
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400">Last Snipe</div>
                                    <div className="text-sm font-bold text-green-400">+$2,450.00 (124%)</div>
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </motion.div>

            </div>

            {/* Bottom Fade */}
            <div className="absolute bottom-0 w-full h-40 bg-linear-to-t from-[#06070A] to-transparent z-20" />
        </section>
    );
}
