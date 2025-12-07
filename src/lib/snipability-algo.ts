/**
 * Snipability Scoring Algorithm
 * Calculates how "snipable" a market is based on multiple factors
 */

import { ProcessedMarket } from './polymarket';

export type EventType = 'tweet' | 'announcement' | 'event' | 'news' | 'other';
export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SnipabilityScore {
    score: number; // 0-100
    urgency: UrgencyLevel;
    whaleActivity: boolean;
    eventType: EventType;
    description: string;
    factors: {
        timeScore: number;
        volumeScore: number;
        liquidityScore: number;
        probabilityScore: number;
        categoryScore: number;
    };
}

/**
 * Calculate snipability score for a market
 */
export function calculateSnipability(market: ProcessedMarket): SnipabilityScore {
    const now = Date.now();
    const endDate = market.endDate.getTime();
    const timeUntilEnd = endDate - now;
    const hoursUntilEnd = timeUntilEnd / (1000 * 60 * 60);

    // 1. Time Score (0-30 points)
    // Markets ending soon or with events happening soon score higher
    const timeScore = calculateTimeScore(hoursUntilEnd);

    // 2. Volume Score (0-25 points)
    const volumeNum = parseVolume(market.volume);
    const volumeScore = Math.min(25, (volumeNum / 100000) * 25);

    // 3. Liquidity Score (0-20 points)
    const liquidityScore = Math.min(20, (market.liquidity / 50000) * 20);

    // 4. Probability Score (0-15 points)
    // Markets close to 50/50 are more tradable (higher volatility potential)
    const probDiff = Math.abs(market.probability - 50);
    const probabilityScore = Math.max(0, 15 - (probDiff / 50) * 15);

    // 5. Category Score (0-10 points)
    const categoryScore = getCategoryScore(market.category, market.tags);

    // Total Score
    const rawScore = timeScore + volumeScore + liquidityScore + probabilityScore + categoryScore;
    const score = Math.round(Math.min(100, rawScore));

    // Determine urgency
    const urgency = determineUrgency(hoursUntilEnd, score);

    // Detect whale activity (simplified - in production, check on-chain data)
    const whaleActivity = volumeNum > 500000 && market.liquidity > 100000;

    // Determine event type
    const eventType = determineEventType(market.title, market.tags);

    // Generate description
    const description = generateDescription(score, urgency, market, hoursUntilEnd, whaleActivity);

    return {
        score,
        urgency,
        whaleActivity,
        eventType,
        description,
        factors: {
            timeScore,
            volumeScore,
            liquidityScore,
            probabilityScore,
            categoryScore
        }
    };
}

/**
 * Calculate time-based score
 */
function calculateTimeScore(hoursUntilEnd: number): number {
    if (hoursUntilEnd < 0) return 0; // Market ended
    if (hoursUntilEnd < 24) return 30; // < 1 day = CRITICAL
    if (hoursUntilEnd < 48) return 25; // < 2 days = HIGH
    if (hoursUntilEnd < 168) return 18; // < 1 week = MEDIUM
    if (hoursUntilEnd < 720) return 10; // < 1 month = LOW
    return 5; // Long-term
}

/**
 * Parse volume string to number
 */
function parseVolume(volume: string): number {
    const match = volume.match(/\$([\d.]+)([MK]?)/);
    if (!match) return 0;
    const num = parseFloat(match[1]);
    const unit = match[2];
    if (unit === 'M') return num * 1000000;
    if (unit === 'K') return num * 1000;
    return num;
}

/**
 * Get category-based score
 */
function getCategoryScore(category: string, tags: string[]): number {
    const highValueCategories = ['Politics', 'Crypto', 'Sports', 'Finance'];
    const highValueTags = ['election', 'bitcoin', 'earnings', 'championship', 'fed', 'rate'];

    let score = 0;
    if (highValueCategories.includes(category)) score += 5;
    if (tags.some(tag => highValueTags.includes(tag.toLowerCase()))) score += 5;
    return score;
}

/**
 * Determine urgency level
 */
function determineUrgency(hoursUntilEnd: number, score: number): UrgencyLevel {
    if (hoursUntilEnd < 24 || score >= 85) return 'CRITICAL';
    if (hoursUntilEnd < 48 || score >= 70) return 'HIGH';
    if (hoursUntilEnd < 168 || score >= 50) return 'MEDIUM';
    return 'LOW';
}

/**
 * Determine event type from title and tags
 */
function determineEventType(title: string, tags: string[]): EventType {
    const lower = title.toLowerCase();
    const tagStr = tags.join(' ').toLowerCase();

    if (lower.includes('tweet') || lower.includes('twitter') || lower.includes('elon')) return 'tweet';
    if (lower.includes('announce') || lower.includes('launch') || tagStr.includes('announcement')) return 'announcement';
    if (lower.includes('event') || lower.includes('conference') || lower.includes('summit')) return 'event';
    if (lower.includes('report') || lower.includes('earnings') || lower.includes('news')) return 'news';
    return 'other';
}

/**
 * Generate human-readable description
 */
function generateDescription(score: number, urgency: UrgencyLevel, market: ProcessedMarket, hoursUntilEnd: number, whaleActivity: boolean): string {
    const volumeNum = parseVolume(market.volume);
    const timeStr = hoursUntilEnd < 24 ? `${Math.round(hoursUntilEnd)}h` : `${Math.round(hoursUntilEnd / 24)}d`;

    if (urgency === 'CRITICAL') {
        return `🔥 URGENT: Market closes in ${timeStr}. High volume ($${(volumeNum / 1000000).toFixed(1)}M). Immediate action recommended.`;
    }
    if (urgency === 'HIGH') {
        return `⚡ ${timeStr} until event. ${whaleActivity ? 'Whale wallets detected. ' : ''}Strong snipe opportunity.`;
    }
    if (urgency === 'MEDIUM') {
        return `📊 Moderate opportunity. ${timeStr} window. Volume: ${market.volume}. Monitor for news.`;
    }
    return `⏳ Long-term market. ${timeStr} remaining. Low priority unless news breaks.`;
}

/**
 * Filter markets to maintain ~30 snipable markets
 * Returns top scoring markets
 */
export function filterSnipableMarkets(markets: Array<{ market: ProcessedMarket; sniping: SnipabilityScore }>, targetCount: number = 30): typeof markets {
    // Sort by score descending
    const sorted = markets.sort((a, b) => b.sniping.score - a.sniping.score);

    // Take top performers but ensure minimum score threshold
    const minScore = 45; // Only show markets with score >= 45
    const filtered = sorted.filter(m => m.sniping.score >= minScore);

    // If we have more than target, take top N
    if (filtered.length > targetCount) {
        return filtered.slice(0, targetCount);
    }

    // If we have less, lower the threshold slightly
    if (filtered.length < targetCount * 0.7) { // If less than 70% of target
        return sorted.slice(0, Math.min(targetCount, sorted.length));
    }

    return filtered;
}
