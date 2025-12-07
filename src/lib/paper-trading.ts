"use client";

// Types
export interface PaperOrder {
    id: string;
    marketId: string;
    marketTitle: string;
    type: 'BUY' | 'SELL';
    outcome: 'YES' | 'NO';
    amount: number;
    entryPrice: number;
    shares: number;
    timestamp: number;
    status: 'OPEN' | 'CLOSED' | 'CANCELLED';
    exitPrice?: number;
    pnl?: number;
    roi?: number;
}

export interface PaperProfile {
    username: string;
    initialBalance: number;
    currentBalance: number;
    totalPnL: number;
    winRate: number;
    tradesCount: number;
    active: boolean; // Is paper trading mode enabled?
    autoFollow: boolean; // Should it auto-snip listener signals?
}

const DEFAULT_PROFILE: PaperProfile = {
    username: "Ghost Trader",
    initialBalance: 1000,
    currentBalance: 1000,
    totalPnL: 0,
    winRate: 0,
    tradesCount: 0,
    active: false,
    autoFollow: false
};

// Store Logic
const STORAGE_KEY = "polybot_paper_trading";

export const paperStore = {
    getProfile: (): PaperProfile => {
        if (typeof window === 'undefined') return DEFAULT_PROFILE;
        const stored = localStorage.getItem(STORAGE_KEY + "_profile");
        return stored ? JSON.parse(stored) : DEFAULT_PROFILE;
    },

    saveProfile: (profile: PaperProfile) => {
        localStorage.setItem(STORAGE_KEY + "_profile", JSON.stringify(profile));
        window.dispatchEvent(new Event('paper-update'));
    },

    getOrders: (): PaperOrder[] => {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(STORAGE_KEY + "_orders");
        return stored ? JSON.parse(stored) : [];
    },

    addOrder: (order: Omit<PaperOrder, 'id' | 'timestamp' | 'status'>) => {
        const orders = paperStore.getOrders();
        const profile = paperStore.getProfile();

        if (profile.currentBalance < order.amount) {
            console.error("Insufficient paper balance");
            return null;
        }

        const newOrder: PaperOrder = {
            ...order,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
            status: 'OPEN'
        };

        orders.unshift(newOrder); // Add to top
        profile.currentBalance -= order.amount;
        profile.tradesCount += 1;

        localStorage.setItem(STORAGE_KEY + "_orders", JSON.stringify(orders));
        paperStore.saveProfile(profile);
        return newOrder;
    },

    closeOrder: (orderId: string, exitPrice: number) => {
        const orders = paperStore.getOrders();
        const profile = paperStore.getProfile();

        const orderIndex = orders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;

        const order = orders[orderIndex];
        if (order.status !== 'OPEN') return;

        // Calculate PnL
        const returnAmount = order.shares * exitPrice;
        const pnl = returnAmount - order.amount;
        const roi = (pnl / order.amount) * 100;

        orders[orderIndex] = {
            ...order,
            status: 'CLOSED',
            exitPrice,
            pnl,
            roi
        };

        // Update Balance stats
        profile.currentBalance += returnAmount;
        profile.totalPnL += pnl;

        // Update Win Rate
        const wins = orders.filter(o => (o.pnl || 0) > 0).length;
        const closed = orders.filter(o => o.status === 'CLOSED').length;
        profile.winRate = closed > 0 ? (wins / closed) * 100 : 0;

        localStorage.setItem(STORAGE_KEY + "_orders", JSON.stringify(orders));
        paperStore.saveProfile(profile);
    },

    reset: (balance: number) => {
        const newProfile = { ...DEFAULT_PROFILE, initialBalance: balance, currentBalance: balance, active: true };
        localStorage.setItem(STORAGE_KEY + "_orders", JSON.stringify([]));
        paperStore.saveProfile(newProfile);
    }
};
