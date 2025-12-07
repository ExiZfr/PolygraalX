"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

const markets = [
    { id: 1, title: "Trump vs Biden 2024", prob: 52, vol: "$12.4M", img: "https://via.placeholder.com/50", cat: "Politics" },
    { id: 2, title: "Bitcoin > $100k by 2025", prob: 34, vol: "$4.1M", img: "https://via.placeholder.com/50", cat: "Crypto" },
    { id: 3, title: "Fed Rate Cut in March", prob: 89, vol: "$8.2M", img: "https://via.placeholder.com/50", cat: "Economy" },
    { id: 4, title: "GTA VI Release Date", prob: 12, vol: "$1.2M", img: "https://via.placeholder.com/50", cat: "Gaming" },
    { id: 5, title: "SpaceX Starship Launch", prob: 78, vol: "$3.5M", img: "https://via.placeholder.com/50", cat: "Science" },
    { id: 6, title: "Super Bowl Winner", prob: 45, vol: "$15M", img: "https://via.placeholder.com/50", cat: "Sports" },
];

export default function RadarShowcase() {
    return (
        <section id="radar" className="py-20 bg-[#06070A] overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 text-center mb-16">
                <h2 className="text-4xl font-bold text-white mb-4">Live Market Radar</h2>
                <p className="text-slate-400">Scan thousands of markets in real-time. Identify mispriced odds immediately.</p>
            </div>

            <div className="relative w-full">
                {/* Gradients to fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-[#06070A] to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-[#06070A] to-transparent z-10" />

                {/* Moving Marquee Row 1 */}
                <div className="flex w-full overflow-hidden mb-6">
                    <motion.div
                        className="flex gap-6 min-w-full"
                        animate={{ x: "-50%" }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    >
                        {[...markets, ...markets, ...markets].map((m, i) => (
                            <MarketCard key={`r1-${i}`} market={m} />
                        ))}
                    </motion.div>
                </div>

                {/* Moving Marquee Row 2 (Reverse) */}
                <div className="flex w-full overflow-hidden">
                    <motion.div
                        className="flex gap-6 min-w-full"
                        initial={{ x: "-50%" }}
                        animate={{ x: "0%" }}
                        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                    >
                        {[...markets, ...markets, ...markets].reverse().map((m, i) => (
                            <MarketCard key={`r2-${i}`} market={m} />
                        ))}
                    </motion.div>
                </div>

            </div>
        </section>
    );
}

function MarketCard({ market }: { market: any }) {
    const isHigh = market.prob > 70;
    const color = isHigh ? "text-green-400" : market.prob < 30 ? "text-red-400" : "text-blue-400";

    return (
        <div className="w-[300px] shrink-0 p-4 rounded-xl bg-[#0F1116] border border-white/5 hover:border-blue-500/30 transition-colors group">
            <div className="flex items-start gap-3 mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-white/5`}>
                    {market.cat[0]}
                </div>
                <div className="text-sm font-medium text-white line-clamp-2 leading-tight">
                    {market.title}
                </div>
            </div>
            <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-slate-500">{market.vol} Vol</div>
                <div className={`text-lg font-bold ${color}`}>
                    {market.prob}%
                </div>
            </div>

            {/* Hover Flip Effect Mock */}
            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
        </div>
    )
}
