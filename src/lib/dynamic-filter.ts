/**
 * DYNAMIC FILTERING ALGORITHM
 * Guarantees 25-500 quality markets by adjusting thresholds intelligently
 */

import { ProcessedMarket } from './polymarket';
import { SnipabilityScore } from './snipability-algo';

export function filterSnipableMarkets(
    markets: Array<{ market: ProcessedMarket; sniping: SnipabilityScore }>,
    targetMin: number = 25,
    targetMax: number = 500
): typeof markets {
    // Sort by score descending (best quality first)
    const sorted = markets.sort((a, b) => b.sniping.score - a.sniping.score);

    console.log(`[Filter] Starting with ${sorted.length} total markets`);

    // Define quality thresholds from strict to permissive
    const thresholds = [50, 45, 40, 35, 30, 25, 20, 15, 10, 5];

    for (const minScore of thresholds) {
        const filtered = sorted.filter(m => m.sniping.score >= minScore);

        console.log(`[Filter] At threshold ${minScore}: ${filtered.length} markets`);

        // PERFECT: We have between targetMin-targetMax markets
        if (filtered.length >= targetMin && filtered.length <= targetMax) {
            console.log(`✅ [Filter] Found ${filtered.length} markets (score ≥${minScore})`);
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

        // LAST RESORT: Return what we have if it's >= 10 markets
        if (filtered.length >= 10) {
            console.warn(`⚠️ [Filter] Only ${filtered.length} markets at lowest threshold (${minScore})`);
            return filtered;
        }
    }

    // ABSOLUTE FALLBACK: Return top 100 regardless of score
    const fallback = sorted.slice(0, Math.min(100, sorted.length));
    console.error(`❌ [Filter] FALLBACK: Returning top ${fallback.length} markets (no threshold met)`);
    return fallback;
}
