import { NextResponse } from 'next/server';

const GAMMA_API = 'https://gamma-api.polymarket.com';

export async function GET() {
    try {
        console.log('[API Route] Fetching markets from Gamma (Server-Side)...');

        const response = await fetch(`${GAMMA_API}/markets?closed=false&limit=500`, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            next: { revalidate: 10 }
        });

        if (!response.ok) {
            console.error(`[API Route Error] Upstream status: ${response.status}`);
            return NextResponse.json({ error: 'Failed to fetch markets' }, { status: response.status });
        }

        const markets = await response.json();
        console.log(`[API Route] Successfully fetched ${markets.length} markets`);

        // Filter and process on server to save bandwidth
        const processed = markets
            .filter((m: any) => m.active && m.volume > 100)
            .map((m: any) => ({
                id: m.id || m.condition_id,
                title: m.question || m.description,
                image: m.image || 'https://via.placeholder.com/400x200/1a1a2e/ffffff?text=Polymarket',
                outcome: m.outcomes?.[0]?.name || 'YES',
                probability: Math.round((m.outcomes?.[0]?.price || m.clobTokenIds?.[0]?.price || 0.5) * 100),
                volume: formatVolume(m.volume || 0),
                liquidity: m.liquidity || 0,
                endDate: m.end_date_iso || m.endDate || new Date(Date.now() + 86400000).toISOString(),
                category: detectCategory(m.question || m.description, m.category, m.tags || []),
                tags: m.tags || []
            }));

        return NextResponse.json(processed);

    } catch (error) {
        console.error('[API Route] Critical error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

function detectCategory(title: string, originalCategory: string, tags: string[]): string {
    // If we have a valid category, use it
    if (originalCategory && originalCategory !== 'Other') {
        return originalCategory;
    }

    const lower = title.toLowerCase();
    const tagStr = tags.join(' ').toLowerCase();

    // Crypto
    if (lower.match(/bitcoin|btc|ethereum|eth|crypto|solana|sol|dogecoin|doge|nft|defi|blockchain/)) {
        return 'Crypto';
    }

    // Politics
    if (lower.match(/trump|biden|election|president|congress|senate|vote|政治|政府|minister|parliament/)) {
        return 'Politics';
    }

    // Sports
    if (lower.match(/nfl|nba|nhl|mlb|fifa|world cup|olympics|championship|super bowl|playoff|league|team|sport/)) {
        return 'Sports';
    }

    // Finance
    if (lower.match(/stock|market|fed|rate|inflation|gdp|earnings|nasdaq|s&p|dow|treasury|bond|economy/)) {
        return 'Finance';
    }

    return 'Other';
}



function formatVolume(volume: number | null | undefined): string {
    if (!volume || typeof volume !== 'number') {
        return '$0';
    }
    if (volume >= 1000000) {
        return `$${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
        return `$${(volume / 1000).toFixed(0)}K`;
    }
    return `$${volume.toFixed(0)}`;
}
