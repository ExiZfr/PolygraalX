"use client"

import { useEffect, useState } from 'react'
import { fetchMarkets, toggleFavorite, toggleTrack } from '@/services/api'
import FlipCard from '@/components/FlipCard'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function RadarPage() {
    const [markets, setMarkets] = useState<any[]>([])
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        loadMarkets()
    }, [])

    const loadMarkets = async () => {
        try {
            const data = await fetchMarkets({})
            setMarkets(data)
        } catch (e) {
            console.error(e)
        }
    }

    const handleToggleFavorite = async (id: number) => {
        const market = markets.find(m => m.id === id)
        if (market) {
            await toggleFavorite(id, !market.is_favorite)
            setMarkets(markets.map(m => m.id === id ? { ...m, is_favorite: !m.is_favorite } : m))
        }
    }

    const handleToggleTrack = async (id: number) => {
        const market = markets.find(m => m.id === id)
        if (market) {
            await toggleTrack(id, !market.is_tracked)
            setMarkets(markets.map(m => m.id === id ? { ...m, is_tracked: !m.is_tracked } : m))
        }
    }

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <header className="flex items-center gap-4">
                <Link href="/" className="p-2 hover:bg-gray-800 rounded-full transition">
                    <ArrowLeft />
                </Link>
                <h1 className="text-3xl font-bold">Radar</h1>
            </header>

            {/* Filters */}
            <div className="flex gap-4 overflow-x-auto pb-2">
                {['all', 'High', 'Critical', 'Favorites'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {markets
                    .filter(m => {
                        if (filter === 'all') return true
                        if (filter === 'Favorites') return m.is_favorite
                        return m.urgency_level === filter
                    })
                    .map(market => (
                        <FlipCard
                            key={market.id}
                            market={market}
                            onToggleFavorite={handleToggleFavorite}
                            onToggleTrack={handleToggleTrack}
                        />
                    ))}
            </div>
        </div>
    )
}
