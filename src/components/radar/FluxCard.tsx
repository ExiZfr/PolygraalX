"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ArrowRight, AlertTriangle, TrendingUp, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export interface MarketData {
    id: string
    title: string
    image: string
    outcome: string
    probability: number
    volume: string
}

export interface SnipingData {
    score: number // 0-100
    urgency: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    whaleActivity: boolean
    description: string
}

interface FluxCardProps {
    market: MarketData
    sniping: SnipingData
    onSnip?: (id: string) => void
}

export function FluxCard({ market, sniping, onSnip }: FluxCardProps) {
    const [isFlipped, setIsFlipped] = React.useState(false)

    // Color coding based on snipability score
    const scoreColor =
        sniping.score >= 80 ? "text-green-400" :
            sniping.score >= 50 ? "text-yellow-400" : "text-red-400"

    const borderColor =
        sniping.score >= 80 ? "border-green-500/50" :
            sniping.score >= 50 ? "border-yellow-500/50" : "border-red-500/50"

    return (
        <div
            className="relative h-80 w-full cursor-pointer perspective-1000"
            onMouseEnter={() => setIsFlipped(true)}
            onMouseLeave={() => setIsFlipped(false)}
            onClick={() => setIsFlipped(!isFlipped)} // Fallback for touch
        >
            <motion.div
                className="relative h-full w-full preserve-3d transition-all duration-500"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* --- FRONT SIDE --- */}
                <div className="absolute inset-0 h-full w-full backface-hidden">
                    <div className="h-full w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-xl">
                        {/* Image Header */}
                        <div className="relative h-32 w-full">
                            <img
                                src={market.image}
                                alt={market.title}
                                className="h-full w-full object-cover opacity-80"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
                            <div className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                Vol: {market.volume}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            <h3 className="line-clamp-2 text-lg font-semibold text-white">
                                {market.title}
                            </h3>

                            <div className="mt-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-zinc-400">Current Odds</p>
                                    <p className="text-2xl font-bold text-white">
                                        {market.probability}%
                                        <span className="ml-1 text-sm font-normal text-zinc-500">{market.outcome}</span>
                                    </p>
                                </div>
                                <div className={cn("rounded-full border px-3 py-1", borderColor)}>
                                    <span className={cn("text-sm font-bold", scoreColor)}>
                                        {sniping.score}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- BACK SIDE --- */}
                <div
                    className="absolute inset-0 h-full w-full backface-hidden"
                    style={{ transform: "rotateY(180deg)" }}
                >
                    <div className={cn(
                        "h-full w-full flex flex-col justify-between rounded-xl border bg-zinc-950 p-5 shadow-xl",
                        borderColor
                    )}>
                        <div>
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <span className="text-sm font-medium text-zinc-400">Snipability</span>
                                <span className={cn("text-2xl font-bold", scoreColor)}>{sniping.score}/100</span>
                            </div>

                            <div className="mt-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-sm text-zinc-300">
                                        <AlertTriangle className="h-4 w-4 text-orange-400" />
                                        Urgency
                                    </span>
                                    <span className={cn(
                                        "text-sm font-medium",
                                        sniping.urgency === "HIGH" ? "text-red-400" : "text-zinc-400"
                                    )}>
                                        {sniping.urgency}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-sm text-zinc-300">
                                        <TrendingUp className="h-4 w-4 text-blue-400" />
                                        Whale Activity
                                    </span>
                                    <span className={cn(
                                        "text-sm font-medium",
                                        sniping.whaleActivity ? "text-green-400" : "text-zinc-500"
                                    )}>
                                        {sniping.whaleActivity ? "DETECTED" : "None"}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 rounded bg-zinc-900 p-2">
                                <p className="text-xs italic text-zinc-500">
                                    "{sniping.description}"
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => onSnip?.(market.id)}
                            className="group flex w-full items-center justify-center gap-2 rounded-lg bg-white py-2 text-sm font-bold text-black transition-transform hover:scale-105 active:scale-95"
                        >
                            SNIP NOW
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
