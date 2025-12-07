/**
 * Polymarket API Client
 * Fetches real-time market data from Polymarket's CLOB API
 */

export interface PolymarketMarket {
    id: string;
    question: string;
    description: string;
    image: string;
    endDate: string;
    volume: number;
    liquidity: number;
    outcomes: {
        name: string;
        price: number; // 0-1 (probability)
    }[];
    category: string;
    tags: string[];
}

export interface ProcessedMarket {
    id: string;
    title: string;
    image: string;
    outcome: string;
    probability: number;
    volume: string;
    liquidity: number;
    endDate: Date;
    category: string;
    tags: string[];
}

const POLYMARKET_API_BASE = 'https://clob.polymarket.com';
const GAMMA_API = 'https://gamma-api.polymarket.com';

/**
 * Fetch active markets from Polymarket
 */
export async function fetchPolymarketMarkets(): Promise<ProcessedMarket[]> {
    try {
        // Fetch from OUR internal API (runs on VPS)
        // This avoids CORS issues and allows server-side logging
        const response = await fetch('/api/markets', {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`Internal API error: ${response.status}`);
        }

        const markets = await response.json();

        // Ensure dates are Date objects (JSON returns strings)
        return markets.map((m: any) => ({
            ...m,
            endDate: new Date(m.endDate)
        }));

    } catch (error) {
        console.error('[Client] Failed to fetch markets:', error);
        return generateMockMarkets();
    }
}


/**
 * Format volume to readable string
 */
function formatVolume(volume: number): string {
    if (volume >= 1000000) {
        return `$${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
        return `$${(volume / 1000).toFixed(0)}K`;
    }
    return `$${volume.toFixed(0)}`;
}

/**
 * Mock markets fallback (for development/API failures)
 */
function generateMockMarkets(): ProcessedMarket[] {
    return [
        {
            id: 'mock-1',
            title: 'Will Donald Trump win the 2024 election?',
            image: 'https://polymarket-upload.s3.us-east-2.amazonaws.com/will-donald-trump-win-the-2024-election-uUZPGSKD.png',
            outcome: 'YES',
            probability: 56,
            volume: '$2.4M',
            liquidity: 450000,
            endDate: new Date('2024-11-05'),
            category: 'Politics',
            tags: ['election', 'trump', 'us-politics']
        },
        {
            id: 'mock-2',
            title: 'Bitcoin above $100k before 2025?',
            image: 'https://via.placeholder.com/400x200/1a1a2e/ffffff?text=Bitcoin',
            outcome: 'NO',
            probability: 28,
            volume: '$890K',
            liquidity: 120000,
            endDate: new Date('2024-12-31'),
            category: 'Crypto',
            tags: ['bitcoin', 'crypto', 'price']
        }
    ];
}
