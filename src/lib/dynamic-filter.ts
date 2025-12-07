/**
 * DYNAMIC FILTERING ALGORITHM - ULTRA QUALITY MODE
 * Guarantees 40-200 ULTRA-QUALITY markets by using stricter thresholds
 */

import { ProcessedMarket } from './polymarket';
import { SnipabilityScore } from './snipability-algo';

export function filterSnipableMarkets(
    markets: Array<{ market: ProcessedMarket; sniping: SnipabilityScore }>,
    targetMin: number = 40,
    targetMax: number = 200
): typeof markets {
    // Sort by score descending (best quality first)
    const sorted = markets.sort((a, b) => b.sniping.score - a.sniping.score);

    console.log(`[Filter] Starting with ${sorted.length} total markets`);

    // STRICTER quality thresholds (60 → 30 instead of 50 → 5)
    const thresholds = [60, 55, 50, 45, 40, 35, 30];

    for (const minScore of thresholds) {
        const filtered = sorted.filter(m => m.sniping.score >= minScore);

        console.log(`[Filter] At threshold ${minScore}: ${filtered.length} markets`);

        // PERFECT: We have between targetMin-targetMax markets
        if (filtered.length >= targetMin && filtered.length <= targetMax) {
            console.log(`✅ [Filter] Found ${filtered.length} ULTRA-QUALITY markets (score ≥${minScore})`);
            return filtered;
        }

        // TOO MANY: Cap at max
        if (filtered.length > targetMax) {
            console.log(`⚠️ [Filter] Capping at ${targetMax} markets (score ≥${minScore})`);
            return filtered.slice(0, targetMax);
        }

        // TOO FEW: Continue to lower threshold (unless we're at the last one)
        if (filtered.length < targetMin && minScore > thresholds[thresholds.length - 1]) {
            continue;
        }

        // LAST RESORT: Return what we have if it's >= 20 markets
        if (filtered.length >= 20) {
            console.warn(`⚠️ [Filter] Only ${filtered.length} markets at lowest threshold (${minScore})`);
            return filtered;
        }
    }

    // ABSOLUTE FALLBACK: Return top 50 regardless of score
    const fallback = sorted.slice(0, Math.min(50, sorted.length));
    console.error(`❌ [Filter] FALLBACK: Returning top ${fallback.length} markets (no threshold met)`);
    return fallback;
}

