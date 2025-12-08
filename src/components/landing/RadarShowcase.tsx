"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Clock, Zap } from "lucide-react";
import { useRef, useState, useEffect } from "react";

const markets = [
    { title: "Trump wins 2024", odds: "67%", change: "+5.2%", trend: "up", volume: "$4.2M" },
    { title: "Bitcoin > $100K by EOY", odds: "42%", change: "+12.1%", trend: "up", volume: "$2.8M" },
    { title: "Fed rate cut Q1 2025", odds: "78%", change: "-2.3%", trend: "down", volume: "$1.9M" },
    { title: "Tesla stock > $300", odds: "31%", change: "+8.5%", trend: "up", volume: "$980K" },
    { title: "OpenAI IPO 2025", odds: "23%", change: "+3.1%", trend: "up", volume: "$1.2M" },
    { title: "Ukraine peace deal Q1", odds: "15%", change: "-4.2%", trend: "down", volume: "$3.5M" },
    { title: "S&P 500 > 6000", odds: "56%", change: "+2.8%", trend: "up", volume: "$890K" },
    { title: "Super Bowl Chiefs win", odds: "29%", change: "+1.5%", trend: "up", volume: "$2.1M" },
];

function MarketCard({ market }: { market: typeof markets[0] }) {
    const isUp = market.trend === "up";

    return (
        <div className="flex-shrink-0 w-72 sm:w-80 p-5 glass rounded-2xl mx-2 hover:bg-white/[0.04] transition-all cursor-pointer group">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <h3 className="text-sm font-medium text-white line-clamp-2 leading-tight pr-2 group-hover:text-indigo-300 transition-colors">
                    {market.title}
                </h3>
                <div className={`flex items-center gap-1 text-xs font-medium ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                    {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {market.change}
                </div>
            </div>

            {/* Odds */}
            <div className="flex items-end justify-between">
                <div>
                    <div className="text-3xl font-bold text-white mb-1">{market.odds}</div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock size={10} />
                        {market.volume} volume
                    </div>
                </div>

                {/* Mini Chart */}
                <div className="flex items-end gap-0.5 h-8">
                    {[30, 45, 35, 60, 40, 70, 55].map((h, i) => (
                        <div
                            key={i}
                            className={`w-1.5 rounded-t ${isUp ? 'bg-green-500/50' : 'bg-red-500/50'}`}
                            style={{ height: `${h}%` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function RadarShowcase() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);
    const scrollAccumulator = useRef(0);

    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        // Initialize scroll position to the middle set
        const initScroll = () => {
            const oneSetWidth = container.scrollWidth / 3;
            if (container.scrollLeft < 100) { // Only set if near start (initial load)
                container.scrollLeft = oneSetWidth;
            }
        };

        // Small delay to ensure layout is ready
        const timer = setTimeout(initScroll, 100);

        let animationFrameId: number;

        const animate = () => {
            if (container) {
                const oneSetWidth = container.scrollWidth / 3;

                // Handle wrapping
                if (container.scrollLeft >= 2 * oneSetWidth) {
                    container.scrollLeft -= oneSetWidth;
                } else if (container.scrollLeft <= 0.5 * oneSetWidth) {
                    container.scrollLeft += oneSetWidth;
                }

                // Auto-scroll
                if (!isPaused) {
                    scrollAccumulator.current += 0.5; // Adjust speed here
                    if (scrollAccumulator.current >= 1) {
                        container.scrollLeft += 1;
                        scrollAccumulator.current -= 1;
                    }
                }
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrameId);
            clearTimeout(timer);
        };
    }, [isPaused]);

    return (
        <section id="how-it-works" className="relative py-24 sm:py-32 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-[#06070A] to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-[#06070A] to-transparent" />
            </div>

            <div className="relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-12 sm:mb-16 px-4"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
                        <Zap size={14} className="text-green-400" />
                        <span className="text-sm font-medium text-slate-300">Live Market Radar</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                        Scan <span className="gradient-text">Every Market</span> in Real-Time
                    </h2>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Our radar continuously monitors all Polymarket events,
                        identifying opportunities with the highest profit potential.
                    </p>
                </motion.div>

                <div
                    ref={scrollRef}
                    className="w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    onTouchStart={() => setIsPaused(true)}
                    onTouchEnd={() => setIsPaused(false)}
                >
                    {/* Marquee Row 1 */}
                    <div className="relative w-max">
                        <div className="flex">
                            {[...markets, ...markets, ...markets].map((market, i) => (
                                <MarketCard key={`row1-${i}`} market={market} />
                            ))}
                        </div>
                    </div>

                    {/* Marquee Row 2 - Reverse */}
                    <div className="relative mt-4 w-max" style={{ direction: 'rtl' }}>
                        <div className="flex" style={{ direction: 'ltr' }}>
                            {[...markets.slice(4), ...markets.slice(0, 4), ...markets.slice(4), ...markets.slice(0, 4), ...markets.slice(4), ...markets.slice(0, 4)].map((market, i) => (
                                <MarketCard key={`row2-${i}`} market={market} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Text */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="text-center mt-12 sm:mt-16 px-4"
                >
                    <p className="text-slate-500 text-sm">
                        Scanning <span className="text-white font-medium">500+</span> markets •
                        Updated every <span className="text-white font-medium">30 seconds</span> •
                        <span className="text-green-400 font-medium"> 24/7 monitoring</span>
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
