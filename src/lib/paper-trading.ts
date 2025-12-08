"use client";

// ============================================
// PAPER TRADING ENGINE v2.0
// Full-featured simulation trading system
// ============================================

// Types
export interface PaperTradingSettings {
    enabled: boolean;
    initialBalance: number;
    riskPerTrade: number; // % of balance per trade (1-100)
    defaultPositionSize: number; // Fixed amount if not using risk %
    useRiskBasedSizing: boolean; // true = use riskPerTrade, false = use defaultPositionSize
    autoStopLoss: number; // % below entry (0 = disabled)
    autoTakeProfit: number; // % above entry (0 = disabled)
    maxOpenPositions: number;
    allowShorts: boolean;
}

export interface PaperOrder {
    id: string;
    marketId: string;
    marketTitle: string;
    marketImage?: string;
    type: 'BUY' | 'SELL';
    outcome: 'YES' | 'NO';
    amount: number;
    entryPrice: number;
    currentPrice?: number;
    shares: number;
    timestamp: number;
    status: 'OPEN' | 'CLOSED' | 'CANCELLED' | 'PENDING';
    exitPrice?: number;
    exitTimestamp?: number;
    pnl?: number;
    roi?: number;
    source: 'MANUAL' | 'SNIPER' | 'COPY_TRADING' | 'ORACLE';
    stopLoss?: number;
    takeProfit?: number;
    notes?: string;
}

export interface PaperProfile {
    username: string;
    initialBalance: number;
    currentBalance: number;
    totalPnL: number;
    realizedPnL: number;
    unrealizedPnL: number;
    winRate: number;
    tradesCount: number;
    winCount: number;
    lossCount: number;
    bestTrade: number;
    worstTrade: number;
    avgTradeSize: number;
    active: boolean;
    autoFollow: boolean;
    createdAt: number;
    lastTradeAt?: number;
}

export interface PaperStats {
    totalTrades: number;
    openTrades: number;
    closedTrades: number;
    winRate: number;
    totalPnL: number;
    realizedPnL: number;
    unrealizedPnL: number;
    avgWin: number;
    avgLoss: number;
    profitFactor: number;
    maxDrawdown: number;
    sharpeRatio: number;
}

// Default Values
const DEFAULT_SETTINGS: PaperTradingSettings = {
    enabled: true,
    initialBalance: 1000,
    riskPerTrade: 5,
    defaultPositionSize: 50,
    useRiskBasedSizing: true,
    autoStopLoss: 15,
    autoTakeProfit: 30,
    maxOpenPositions: 10,
    allowShorts: false
};

const DEFAULT_PROFILE: PaperProfile = {
    username: "Paper Trader",
    initialBalance: 1000,
    currentBalance: 1000,
    totalPnL: 0,
    realizedPnL: 0,
    unrealizedPnL: 0,
    winRate: 0,
    tradesCount: 0,
    winCount: 0,
    lossCount: 0,
    bestTrade: 0,
    worstTrade: 0,
    avgTradeSize: 0,
    active: true,
    autoFollow: false,
    createdAt: Date.now()
};

// Storage Keys
const STORAGE_KEY = "polybot_paper_trading";
const SETTINGS_KEY = `${STORAGE_KEY}_settings`;
const PROFILE_KEY = `${STORAGE_KEY}_profile`;
const ORDERS_KEY = `${STORAGE_KEY}_orders`;

// Helper Functions
function safeLocalStorage<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : fallback;
    } catch {
        return fallback;
    }
}

function saveLocalStorage<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
        window.dispatchEvent(new Event('paper-update'));
    } catch (e) {
        console.error('[PaperTrading] Failed to save:', e);
    }
}

// ============================================
// PAPER STORE - Main API
// ============================================
export const paperStore = {
    // --- SETTINGS ---
    getSettings: (): PaperTradingSettings => {
        return safeLocalStorage(SETTINGS_KEY, DEFAULT_SETTINGS);
    },

    saveSettings: (settings: Partial<PaperTradingSettings>): PaperTradingSettings => {
        const current = paperStore.getSettings();
        const updated = { ...current, ...settings };
        saveLocalStorage(SETTINGS_KEY, updated);
        return updated;
    },

    // --- PROFILE ---
    getProfile: (): PaperProfile => {
        return safeLocalStorage(PROFILE_KEY, DEFAULT_PROFILE);
    },

    saveProfile: (profile: Partial<PaperProfile>): PaperProfile => {
        const current = paperStore.getProfile();
        const updated = { ...current, ...profile };
        saveLocalStorage(PROFILE_KEY, updated);
        return updated;
    },

    resetProfile: (initialBalance?: number): PaperProfile => {
        const balance = initialBalance || paperStore.getSettings().initialBalance;
        const newProfile: PaperProfile = {
            ...DEFAULT_PROFILE,
            initialBalance: balance,
            currentBalance: balance,
            createdAt: Date.now()
        };
        saveLocalStorage(PROFILE_KEY, newProfile);
        saveLocalStorage(ORDERS_KEY, []);
        return newProfile;
    },

    // --- ORDERS ---
    getOrders: (): PaperOrder[] => {
        return safeLocalStorage(ORDERS_KEY, []);
    },

    getOpenOrders: (): PaperOrder[] => {
        return paperStore.getOrders().filter(o => o.status === 'OPEN');
    },

    getClosedOrders: (): PaperOrder[] => {
        return paperStore.getOrders().filter(o => o.status === 'CLOSED');
    },

    getOrderById: (id: string): PaperOrder | undefined => {
        return paperStore.getOrders().find(o => o.id === id);
    },

    // Calculate position size based on settings
    calculatePositionSize: (): number => {
        const settings = paperStore.getSettings();
        const profile = paperStore.getProfile();

        if (settings.useRiskBasedSizing) {
            return (profile.currentBalance * settings.riskPerTrade) / 100;
        }
        return Math.min(settings.defaultPositionSize, profile.currentBalance);
    },

    // Place a new order
    placeOrder: (orderData: {
        marketId: string;
        marketTitle: string;
        marketImage?: string;
        type: 'BUY' | 'SELL';
        outcome: 'YES' | 'NO';
        entryPrice: number;
        amount?: number;
        source: PaperOrder['source'];
        notes?: string;
    }): PaperOrder | null => {
        const settings = paperStore.getSettings();
        const profile = paperStore.getProfile();
        const orders = paperStore.getOrders();

        // Check if paper trading is enabled
        if (!settings.enabled) {
            console.warn('[PaperTrading] Paper trading is disabled');
            return null;
        }

        // Check max open positions
        const openOrders = orders.filter(o => o.status === 'OPEN');
        if (openOrders.length >= settings.maxOpenPositions) {
            console.warn('[PaperTrading] Max open positions reached');
            return null;
        }

        // Calculate amount
        const amount = orderData.amount || paperStore.calculatePositionSize();

        // Check balance
        if (amount > profile.currentBalance) {
            console.warn('[PaperTrading] Insufficient balance');
            return null;
        }

        // Calculate shares (simplified: shares = amount / price)
        const shares = amount / orderData.entryPrice;

        // Calculate stop loss and take profit prices
        const stopLoss = settings.autoStopLoss > 0
            ? orderData.entryPrice * (1 - settings.autoStopLoss / 100)
            : undefined;
        const takeProfit = settings.autoTakeProfit > 0
            ? orderData.entryPrice * (1 + settings.autoTakeProfit / 100)
            : undefined;

        // Create order
        const newOrder: PaperOrder = {
            id: `PO_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            marketId: orderData.marketId,
            marketTitle: orderData.marketTitle,
            marketImage: orderData.marketImage,
            type: orderData.type,
            outcome: orderData.outcome,
            amount,
            entryPrice: orderData.entryPrice,
            currentPrice: orderData.entryPrice,
            shares,
            timestamp: Date.now(),
            status: 'OPEN',
            source: orderData.source,
            stopLoss,
            takeProfit,
            notes: orderData.notes
        };

        // Update orders
        orders.unshift(newOrder);
        saveLocalStorage(ORDERS_KEY, orders);

        // Deduct from balance
        paperStore.saveProfile({
            currentBalance: profile.currentBalance - amount,
            tradesCount: profile.tradesCount + 1,
            lastTradeAt: Date.now(),
            avgTradeSize: ((profile.avgTradeSize * profile.tradesCount) + amount) / (profile.tradesCount + 1)
        });

        console.log('[PaperTrading] Order placed:', newOrder.id);
        return newOrder;
    },

    // Close an order
    closeOrder: (orderId: string, exitPrice: number): PaperOrder | null => {
        const orders = paperStore.getOrders();
        const profile = paperStore.getProfile();

        const orderIndex = orders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return null;

        const order = orders[orderIndex];
        if (order.status !== 'OPEN') return null;

        // Calculate PnL
        const returnAmount = order.shares * exitPrice;
        const pnl = returnAmount - order.amount;
        const roi = (pnl / order.amount) * 100;

        // Update order
        const closedOrder: PaperOrder = {
            ...order,
            status: 'CLOSED',
            exitPrice,
            exitTimestamp: Date.now(),
            pnl,
            roi
        };

        orders[orderIndex] = closedOrder;
        saveLocalStorage(ORDERS_KEY, orders);

        // Update profile stats
        const closedOrders = orders.filter(o => o.status === 'CLOSED');
        const wins = closedOrders.filter(o => (o.pnl || 0) > 0);
        const losses = closedOrders.filter(o => (o.pnl || 0) < 0);
        const totalRealizedPnL = closedOrders.reduce((sum, o) => sum + (o.pnl || 0), 0);

        paperStore.saveProfile({
            currentBalance: profile.currentBalance + returnAmount,
            realizedPnL: totalRealizedPnL,
            totalPnL: totalRealizedPnL,
            winCount: wins.length,
            lossCount: losses.length,
            winRate: closedOrders.length > 0 ? (wins.length / closedOrders.length) * 100 : 0,
            bestTrade: Math.max(profile.bestTrade, pnl),
            worstTrade: Math.min(profile.worstTrade, pnl)
        });

        console.log('[PaperTrading] Order closed:', orderId, 'PnL:', pnl.toFixed(2));
        return closedOrder;
    },

    // Cancel an order (refund amount)
    cancelOrder: (orderId: string): boolean => {
        const orders = paperStore.getOrders();
        const profile = paperStore.getProfile();

        const orderIndex = orders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return false;

        const order = orders[orderIndex];
        if (order.status !== 'OPEN' && order.status !== 'PENDING') return false;

        orders[orderIndex] = { ...order, status: 'CANCELLED' };
        saveLocalStorage(ORDERS_KEY, orders);

        // Refund balance
        paperStore.saveProfile({
            currentBalance: profile.currentBalance + order.amount
        });

        return true;
    },

    // Update current prices for open orders (for unrealized PnL)
    updatePrices: (priceMap: Record<string, number>) => {
        const orders = paperStore.getOrders();
        let updated = false;

        orders.forEach((order, index) => {
            if (order.status === 'OPEN' && priceMap[order.marketId]) {
                orders[index] = { ...order, currentPrice: priceMap[order.marketId] };
                updated = true;
            }
        });

        if (updated) {
            saveLocalStorage(ORDERS_KEY, orders);

            // Calculate unrealized PnL
            const openOrders = orders.filter(o => o.status === 'OPEN');
            const unrealizedPnL = openOrders.reduce((sum, order) => {
                const currentValue = order.shares * (order.currentPrice || order.entryPrice);
                return sum + (currentValue - order.amount);
            }, 0);

            const profile = paperStore.getProfile();
            paperStore.saveProfile({
                unrealizedPnL,
                totalPnL: profile.realizedPnL + unrealizedPnL
            });
        }
    },

    // Get comprehensive stats
    getStats: (): PaperStats => {
        const orders = paperStore.getOrders();
        const profile = paperStore.getProfile();

        const openOrders = orders.filter(o => o.status === 'OPEN');
        const closedOrders = orders.filter(o => o.status === 'CLOSED');
        const wins = closedOrders.filter(o => (o.pnl || 0) > 0);
        const losses = closedOrders.filter(o => (o.pnl || 0) < 0);

        const totalWins = wins.reduce((sum, o) => sum + (o.pnl || 0), 0);
        const totalLosses = Math.abs(losses.reduce((sum, o) => sum + (o.pnl || 0), 0));

        return {
            totalTrades: orders.length,
            openTrades: openOrders.length,
            closedTrades: closedOrders.length,
            winRate: profile.winRate,
            totalPnL: profile.totalPnL,
            realizedPnL: profile.realizedPnL,
            unrealizedPnL: profile.unrealizedPnL,
            avgWin: wins.length > 0 ? totalWins / wins.length : 0,
            avgLoss: losses.length > 0 ? totalLosses / losses.length : 0,
            profitFactor: totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0,
            maxDrawdown: 0, // TODO: Calculate properly
            sharpeRatio: 0 // TODO: Calculate properly
        };
    }
};
