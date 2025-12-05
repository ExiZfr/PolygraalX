"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Star, ExternalLink } from 'lucide-react'

interface Market {
    id: number
    title: string
    last_price_yes: number
    last_price_no: number
    volume: number
    urgency_level: string
    snipability_score: number
    is_favorite: boolean
    is_tracked: boolean
}

interface FlipCardProps {
    market: Market
    onToggleFavorite: (id: number) => void
    onToggleTrack: (id: number) => void
}

export default function FlipCard({ market, onToggleFavorite, onToggleTrack }: FlipCardProps) {
    const [isFlipped, setIsFlipped] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)

    function handleFlip() {
        if (!isAnimating) {
            setIsFlipped(!isFlipped)
            setIsAnimating(true)
        }
    }

    return (
        <div className="w-full h-64 cursor-pointer perspective-1000" onClick={handleFlip}>
            <motion.div
                className="w-full h-full relative preserve-3d"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, animationDirection: "normal" }}
                onAnimationComplete={() => setIsAnimating(false)}
            >
                {/* Front Face */}
                <div className="absolute w-full h-full backface-hidden bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <span className={cn(
                            "px-2 py-1 rounded text-xs font-bold",
                            market.urgency_level === 'Critical' ? "bg-red-500 text-white" :
                                market.urgency_level === 'High' ? "bg-orange-500 text-white" :
                                    "bg-blue-500 text-white"
                        )}>
                            {market.urgency_level}
                        </span>
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleFavorite(market.id); }}
                            className={cn("p-1 rounded-full hover:bg-gray-700", market.is_favorite ? "text-yellow-400" : "text-gray-400")}
                        >
                            <Star size={20} fill={market.is_favorite ? "currentColor" : "none"} />
                        </button>
                    </div>

                    <h3 className="text-lg font-semibold line-clamp-3">{market.title}</h3>

                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400">Yes</span>
                            <span className="text-xl font-bold text-green-400">{market.last_price_yes}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-gray-400">Score</span>
                            <span className="text-xl font-bold text-purple-400">{market.snipability_score}</span>
                        </div>
                    </div>
                </div>

                {/* Back Face */}
                <div
                    className="absolute w-full h-full backface-hidden bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg rotate-y-180 flex flex-col justify-between"
                >
                    <div className="space-y-2">
                        <h4 className="text-sm font-bold text-gray-300">Details</h4>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Volume:</span>
                            <span>${market.volume.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">No Price:</span>
                            <span className="text-red-400">{market.last_price_no}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleTrack(market.id); }}
                            className={cn(
                                "w-full py-2 rounded font-bold text-sm transition-colors",
                                market.is_tracked ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                            )}
                        >
                            {market.is_tracked ? "Stop Tracking" : "Start Tracking"}
                        </button>

                        <a
                            href={`https://polymarket.com/event/${market.id}`} // Mock link
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-center w-full py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-blue-400"
                        >
                            Open Polymarket <ExternalLink size={14} className="ml-2" />
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
