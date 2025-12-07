"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Radar, Volume2, Users, BrainCircuit, ChevronRight } from "lucide-react";

const features = [
    {
        icon: Radar,
        title: "Market Radar",
        desc: "Real-time scanning of 500+ markets. Our algorithm detects liquidity spikes and whale entries instantly.",
        color: "from-blue-500 to-cyan-500",
        delay: 0,
    },
    {
        icon: Volume2,
        title: "News Listener",
        desc: "Snipe markets before they move. We monitor AP, Reuters, and Twitter to execute trades milliseconds after news breaks.",
        color: "from-amber-500 to-orange-500",
        delay: 0.1,
    },
    {
        icon: Users,
        title: "Copy Trading",
        desc: "Track the wildest wallets. Mirror their trades automatically with adjustable risk management.",
        color: "from-purple-500 to-pink-500",
        delay: 0.2,
    },
];

export default function Features() {
    return (
        <section id="features" className="py-32 relative overflow-hidden bg-[#06070A]">
            <div className="max-w-7xl mx-auto px-6">

                {/* Section Header */}
                <div className="text-center mb-24 max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        The <span className="text-blue-500">Ultimate Edge</span> for Prediction Markets
                    </h2>
                    <p className="text-lg text-slate-400">
                        Stop trading manually. PolyGraalX gives you the institutional tools needed to compete with algorithms.
                    </p>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: f.delay, duration: 0.6 }}
                            whileHover={{ y: -5 }}
                            className="group p-1 rounded-2xl bg-linear-to-b from-white/10 to-white/5 hover:from-blue-500/50 hover:to-purple-500/50 transition-all duration-500"
                        >
                            <div className="h-full bg-[#0A0B10] rounded-xl p-8 border border-white/5 relative overflow-hidden group-hover:bg-[#0d0e14] transition-colors">

                                {/* Glow Effect */}
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${f.color} opacity-0 group-hover:opacity-20 blur-[50px] transition-opacity duration-500`} />

                                <div className={`w-12 h-12 rounded-lg bg-linear-to-br ${f.color} flex items-center justify-center mb-6`}>
                                    <f.icon className="text-white" size={24} />
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-4">{f.title}</h3>
                                <p className="text-slate-400 leading-relaxed mb-6">
                                    {f.desc}
                                </p>

                                <div className="flex items-center text-sm font-medium text-white/50 group-hover:text-white transition-colors cursor-pointer">
                                    Learn more <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Oracle Section */}
                <div className="mt-32 relative">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#0A0B10]"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            <div className="p-12 md:p-20 flex flex-col justify-center">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 w-fit mb-6">
                                    <BrainCircuit size={14} className="text-purple-400" />
                                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wide">PolyGraal Oracle</span>
                                </div>
                                <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
                                    Deep Learning for <br />
                                    <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-400">Hidden Alpha</span>
                                </h3>
                                <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                                    Our proprietary Oracle analyzes millions of data points — from social sentiment to on-chain movements — to predict market outcomes with 78% historical accuracy.
                                </p>

                                <div className="flex flex-col gap-4">
                                    {["Sentiment Analysis", "Historical Correlation", "Whale Wallet Tracking"].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                            </div>
                                            <span className="text-slate-300 font-medium">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="relative h-full min-h-[400px] border-l border-white/10 bg-[#050608]">
                                <Image
                                    src="/assets/chip.png"
                                    alt="AI Oracle Core"
                                    fill
                                    className="object-cover opacity-80 hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-[#0A0B10] to-transparent" />

                                {/* Floating Data Points */}
                                <div className="absolute bottom-10 left-10 right-10 flex gap-4">
                                    <div className="flex-1 p-4 bg-black/60 backdrop-blur-md rounded-xl border border-white/10">
                                        <div className="text-xs text-slate-500 mb-1">Win Rate</div>
                                        <div className="text-2xl font-bold text-white">78.4%</div>
                                    </div>
                                    <div className="flex-1 p-4 bg-black/60 backdrop-blur-md rounded-xl border border-white/10">
                                        <div className="text-xs text-slate-500 mb-1">Signals/Day</div>
                                        <div className="text-2xl font-bold text-white">240+</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
