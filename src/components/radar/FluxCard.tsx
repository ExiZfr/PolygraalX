"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ArrowRight, AlertTriangle, TrendingUp, Info, Flame, Droplets, Clock, ExternalLink, Activity, Star } from "lucide-react"
import { cn } from "@/lib/utils"

export interface MarketData {
    id: string
    title: string
    image: string
    outcome: string
    probability: number
    volume: string
    liquidity?: number
    endDate?: string | Date
    category?: string
    tags?: string[]
}

export interface SnipingData {
    score: number // 0-100
    urgency: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    whaleActivity: boolean
    description: string
    eventType: string; // Add this line
    factors?: {
        timeScore: number;
        volumeScore: number;
        liquidityScore: number;
        probabilityScore: number;
        categoryScore: number;
    }
}

interface FluxCardProps {
    market: MarketData
    sniping: SnipingData
    variants?: MarketData[] // NEW: Array of grouped markets if this is a stack
    onSnip?: (id: string) => void
    onTrackGroup?: (ids: string[]) => void // NEW: Track all
    isTracked?: boolean
}

export function FluxCard({ market, sniping, variants, onSnip, onTrackGroup, isTracked }: FluxCardProps) {
    const [isFlipped, setIsFlipped] = React.useState(false)

    const isGroup = variants && variants.length > 0;
    const activeMarket = market; // Primary market to display on front

    // Color coding
    const isHot = sniping.score >= 80;
    const isWarm = sniping.score >= 50;
    const scoreColor = isHot ? "text-red-500" : isWarm ? "text-orange-400" : "text-blue-400";
    const badgeBg = isHot ? "bg-red-500/20 border-red-500/50" : isWarm ? "bg-orange-500/20 border-orange-500/50" : "bg-blue-500/20 border-blue-500/50";

    // Group Stats
    const groupProbMin = isGroup ? Math.min(...[market, ...variants!].map(m => m.probability)) : market.probability;
    const groupProbMax = isGroup ? Math.max(...[market, ...variants!].map(m => m.probability)) : market.probability;
    const itemsCount = isGroup ? variants!.length + 1 : 1;

    // Helpers
    const formatLiquidity = (liq: number | undefined) => {
        if (!liq) return "$0";
        if (liq >= 1000000) return `$${(liq / 1000000).toFixed(1)}M`;
        if (liq >= 1000) return `$${(liq / 1000).toFixed(1)}K`;
        return `$${liq}`;
    };

    const formatDate = (date: string | Date | undefined) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    return (
        <div
            className="relative h-96 w-full cursor-pointer perspective-1000 group/card"
            onClick={() => setIsFlipped(!isFlipped)}
        >
            {/* Stack Effect Backgrounds */}
            {isGroup && !isFlipped && (
                <>
                    <div className="absolute top-0 left-0 w-full h-full bg-white/5 rounded-2xl rotate-2 scale-95 translate-y-2 z-0 transition-transform group-hover/card:rotate-3 group-hover/card:translate-y-3" />
                    <div className="absolute top-0 left-0 w-full h-full bg-white/5 rounded-2xl -rotate-2 scale-95 translate-y-2 z-0 transition-transform group-hover/card:-rotate-3 group-hover/card:translate-y-3" />
                </>
            )}

            <motion.div
                className="relative h-full w-full preserve-3d transition-all duration-500 z-10"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* --- FRONT SIDE --- */}
                <div className="absolute inset-0 h-full w-full backface-hidden">
                    <div className={cn(
                        "h-full w-full overflow-hidden rounded-2xl border bg-[#0F1116] shadow-2xl transition-colors hover:border-white/20",
                        isTracked ? "border-yellow-500/50" : "border-white/10"
                    )}>

                        {/* Image Header */}
                        <div className="relative h-40 w-full overflow-hidden">
                            <img src={activeMarket.image} alt={activeMarket.title} className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover/card:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0F1116] to-transparent" />

                            <div className={cn("absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border backdrop-blur-md shadow-lg z-10", badgeBg)}>
                                <Flame className={cn("h-4 w-4 fill-current animate-pulse", scoreColor)} />
                                <span className="text-sm font-bold text-white">{sniping.score}</span>
                            </div>

                            {/* Stack Badge */}
                            {isGroup && (
                                <div className="absolute top-3 right-3 px-2 py-1 rounded bg-blue-600 font-bold text-[10px] text-white shadow-lg z-10 animate-bounce">
                                    {itemsCount} VARIANTS
                                </div>
                            )}

                            <div className="absolute bottom-2 left-3 rounded-md bg-black/60 border border-white/5 px-2 py-1 flex items-center gap-1.5 backdrop-blur-sm">
                                <Activity className="h-3 w-3 text-slate-400" />
                                <span className="text-xs font-medium text-slate-200">Vol: {activeMarket.volume}</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex flex-col h-[calc(100%-160px)] justify-between">
                            <div>
                                <div className="text-[10px] font-bold tracking-wider text-blue-400 uppercase mb-2">
                                    {activeMarket.category || "General"}
                                </div>
                                <h3 className="line-clamp-3 text-lg font-bold text-white leading-snug">
                                    {isGroup ? activeMarket.title.replace(/\d+/, '#') : activeMarket.title}
                                </h3>
                            </div>

                            <div className="flex items-end justify-between mt-4">
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">
                                        {isGroup ? "Probability Range" : "Probability (Yes)"}
                                    </p>
                                    <div className="flex items-baseline gap-1">
                                        {isGroup ? (
                                            <span className="text-2xl font-black text-slate-200">
                                                {groupProbMin}% - <span className="text-green-400">{groupProbMax}%</span>
                                            </span>
                                        ) : (
                                            <span className={cn("text-3xl font-black", activeMarket.probability > 50 ? "text-green-400" : "text-slate-200")}>
                                                {activeMarket.probability}%
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <button className={cn("h-8 w-8 rounded-full flex items-center justify-center transition", isTracked ? "bg-yellow-500 text-black" : "bg-white/5 text-slate-400")}>
                                    <Star className={cn("h-4 w-4", isTracked && "fill-current")} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- BACK SIDE --- */}
                <div
                    className="absolute inset-0 h-full w-full backface-hidden rounded-2xl overflow-hidden"
                    style={{ transform: "rotateY(180deg)" }}
                >
                    <div className={cn(
                        "h-full w-full flex flex-col rounded-2xl border bg-[#0A0B10] shadow-2xl relative",
                        isHot ? "border-red-500/30" : "border-blue-500/30"
                    )}>
                        <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase text-slate-400">
                                    {isGroup ? "Group Variants" : "Market Analysis"}
                                </span>
                                <div className={cn("flex items-center gap-1 text-sm font-bold", scoreColor)}>
                                    <Flame className="h-3 w-3 fill-current" />
                                    {sniping.score}/100
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/10 text-slate-300 border border-white/5">
                                    {market.category}
                                </span>
                                <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium border",
                                    sniping.urgency === 'HIGH' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                        sniping.urgency === 'MEDIUM' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                            "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                )}>
                                    {sniping.urgency} URGENCY
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                    {sniping.eventType.replace('_', ' ')}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {/* Group List */}
                            {isGroup ? (
                                <div className="space-y-2">
                                    <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20 mb-3">
                                        <p className="text-xs text-blue-200">
                                            Found <span className="font-bold">{itemsCount} markets</span> related to this topic. Use "Track Group" to listen to all.
                                        </p>
                                    </div>

                                    {[market, ...variants!].map((m, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition cursor-pointer group/item" onClick={(e) => { e.stopPropagation(); onSnip?.(m.id); }}>
                                            <div className="flex flex-col max-w-[70%]">
                                                <span className="text-xs font-medium text-slate-200 truncate group-hover/item:text-white transition-colors">{m.title}</span>
                                                <span className="text-[10px] text-slate-500">Vol: {m.volume}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className={cn("text-sm font-bold block", m.probability > 50 ? "text-green-400" : "text-slate-400")}>{m.probability}%</span>
                                                <ExternalLink size={10} className="ml-auto mt-1 text-slate-600" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                /* Single Market Metrics */
                                <>
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                                            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1"><Droplets className="h-3 w-3" /> Liquidity</div>
                                            <div className="text-sm font-mono font-bold text-white">{formatLiquidity(activeMarket.liquidity)}</div>
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                                            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1"><Clock className="h-3 w-3" /> Ends</div>
                                            <div className="text-sm font-mono font-bold text-white">{formatDate(activeMarket.endDate)}</div>
                                        </div>
                                    </div>

                                    {/* Score Breakdown (Gauges) */}
                                    {sniping.factors && (
                                        <div className="space-y-3 p-3 bg-white/5 rounded-lg border border-white/5">
                                            <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">Algorithm Factors</p>

                                            {/* Volume */}
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[10px] text-slate-300">
                                                    <span>Volume Strength</span>
                                                    <span>{sniping.factors.volumeScore}/35</span>
                                                </div>
                                                <div className="h-1 w-full bg-black/50 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500" style={{ width: `${(sniping.factors.volumeScore / 35) * 100}%` }} />
                                                </div>
                                            </div>

                                            {/* Liquidity */}
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[10px] text-slate-300">
                                                    <span>Liquidity Depth</span>
                                                    <span>{sniping.factors.liquidityScore}/35</span>
                                                </div>
                                                <div className="h-1 w-full bg-black/50 rounded-full overflow-hidden">
                                                    <div className="h-full bg-purple-500" style={{ width: `${(sniping.factors.liquidityScore / 35) * 100}%` }} />
                                                </div>
                                            </div>

                                            {/* Time/Urgency */}
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[10px] text-slate-300">
                                                    <span>Urgency</span>
                                                    <span>{sniping.factors.timeScore}/20</span>
                                                </div>
                                                <div className="h-1 w-full bg-black/50 rounded-full overflow-hidden">
                                                    <div className="h-full bg-yellow-500" style={{ width: `${(sniping.factors.timeScore / 20) * 100}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* AI Reason */}
                                    <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 mt-3">
                                        <p className="text-xs leading-relaxed text-blue-200">
                                            <span className="font-bold">AI Insight:</span> {sniping.description}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-md space-y-2 z-10">
                            {isGroup ? (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onTrackGroup?.([market, ...variants!].map(m => m.id)); }}
                                    className="w-full py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-lg text-sm transition-all shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2"
                                >
                                    <Star className="h-4 w-4 fill-current" /> TRACK ENTIRE GROUP ({itemsCount})
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onSnip?.(activeMarket.id); }}
                                        className="w-full py-2.5 bg-white hover:bg-slate-200 text-black font-bold rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Flame className="h-4 w-4" /> SNIP NOW
                                    </button>
                                    <a
                                        href={`https://polymarket.com/market/${activeMarket.id}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                                    >
                                        View on Polymarket <ExternalLink className="h-3 w-3" />
                                    </a>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
