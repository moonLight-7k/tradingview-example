import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Timestamp } from 'firebase/firestore';
import {
    addDocument,
    deleteDocumentsByQuery,
    queryDocuments,
    subscribeToQuery
} from '@/db/firestoreDB.utils';
import { getStockQuote } from '@/lib/actions/finnhub.actions';
import { logger } from '@/lib/logger';
import type { WatchlistItem } from '@/types';

// Extended watchlist item with price data
export interface WatchlistItemWithPrice extends WatchlistItem {
    currentPrice?: number;
    change?: number;
    changePercent?: number;
    lastUpdated?: string;
}

interface WatchlistState {
    // State
    watchlist: WatchlistItemWithPrice[];
    isLoading: boolean;
    error: string | null;
    isHydrated: boolean;
    lastPriceFetch?: string;

    // Database subscription
    unsubscribe?: () => void;

    // Actions
    setWatchlist: (watchlist: WatchlistItemWithPrice[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearError: () => void;
    setHydrated: () => void;

    // Watchlist operations
    addToWatchlist: (symbol: string, companyName: string, userId: string) => Promise<void>;
    removeFromWatchlist: (symbol: string, userId: string) => Promise<void>;
    fetchWatchlist: (userId: string) => Promise<void>;
    subscribeToWatchlist: (userId: string) => void;
    unsubscribeFromWatchlist: () => void;

    // Price operations
    fetchPricesForWatchlist: () => Promise<void>;
    updateItemPrice: (symbol: string, price: number, change?: number, changePercent?: number) => void;

    // Utility functions
    isInWatchlist: (symbol: string) => boolean;
    getWatchlistItem: (symbol: string) => WatchlistItemWithPrice | undefined;
    clearWatchlist: () => void;
}

export const useWatchlistStore = create<WatchlistState>()(
    persist(
        (set, get) => ({
            // Initial state
            watchlist: [],
            isLoading: false,
            error: null,
            isHydrated: false,

            // Basic setters
            setWatchlist: (watchlist) => set({ watchlist, error: null }),
            setLoading: (isLoading) => set({ isLoading }),
            setError: (error) => set({ error }),
            clearError: () => set({ error: null }),
            setHydrated: () => set({ isHydrated: true }),

            // Add stock to watchlist
            addToWatchlist: async (symbol: string, companyName: string, userId: string) => {
                const state = get();

                if (!userId) {
                    throw new Error('User ID is required to add to watchlist');
                }

                set({ isLoading: true, error: null });

                try {
                    const symbolUpper = symbol.toUpperCase();

                    // Check if already in watchlist
                    if (state.isInWatchlist(symbolUpper)) {
                        logger.info('Stock already in watchlist', { symbol: symbolUpper });
                        set({ isLoading: false });
                        return;
                    }

                    // Create watchlist item
                    const watchlistData = {
                        userId,
                        symbol: symbolUpper,
                        companyName,
                        addedAt: Timestamp.now(),
                    };

                    // Add to Firestore
                    const docId = await addDocument('watchlists', watchlistData);

                    // Create local item with document ID
                    const newItem: WatchlistItemWithPrice = {
                        id: docId,
                        ...watchlistData,
                    };

                    // Update local state
                    set({
                        watchlist: [...state.watchlist, newItem],
                        isLoading: false,
                        error: null
                    });

                    // Fetch price for the new item
                    try {
                        const quote = await getStockQuote(symbolUpper);
                        if (quote && quote.c !== undefined) {
                            get().updateItemPrice(
                                symbolUpper,
                                quote.c,
                                quote.d,
                                quote.dp
                            );
                        }
                    } catch (priceError) {
                        logger.warn('Failed to fetch price for new watchlist item', {
                            symbol: symbolUpper,
                            error: priceError
                        });
                    }

                    logger.info('Added to watchlist', { symbol: symbolUpper, userId });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to add to watchlist';
                    set({ error: errorMessage, isLoading: false });
                    logger.error('Failed to add to watchlist', { error, symbol, userId });
                    throw error;
                }
            },

            // Remove stock from watchlist
            removeFromWatchlist: async (symbol: string, userId: string) => {
                const state = get();

                if (!userId) {
                    throw new Error('User ID is required to remove from watchlist');
                }

                set({ isLoading: true, error: null });

                try {
                    const symbolUpper = symbol.toUpperCase();

                    // Remove from Firestore
                    await deleteDocumentsByQuery('watchlists', {
                        whereConditions: [
                            { field: 'userId', operator: '==', value: userId },
                            { field: 'symbol', operator: '==', value: symbolUpper }
                        ]
                    });

                    // Update local state
                    const updatedWatchlist = state.watchlist.filter(
                        item => item.symbol !== symbolUpper
                    );

                    set({
                        watchlist: updatedWatchlist,
                        isLoading: false,
                        error: null
                    });

                    logger.info('Removed from watchlist', { symbol: symbolUpper, userId });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to remove from watchlist';
                    set({ error: errorMessage, isLoading: false });
                    logger.error('Failed to remove from watchlist', { error, symbol, userId });
                    throw error;
                }
            },

            // Fetch watchlist from database
            fetchWatchlist: async (userId: string) => {
                if (!userId) {
                    set({ watchlist: [], isLoading: false });
                    return;
                }

                set({ isLoading: true, error: null });

                try {
                    const result = await queryDocuments<WatchlistItem>('watchlists', {
                        whereConditions: [
                            { field: 'userId', operator: '==', value: userId }
                        ],
                        orderByFields: [
                            { field: 'addedAt', direction: 'desc' }
                        ]
                    });

                    const watchlistItems: WatchlistItemWithPrice[] = result.data.map(item => ({
                        id: item.id,
                        userId: item.userId,
                        symbol: item.symbol,
                        companyName: item.companyName,
                        addedAt: item.addedAt,
                    }));

                    set({
                        watchlist: watchlistItems,
                        isLoading: false,
                        error: null
                    });

                    // Fetch prices for all items
                    get().fetchPricesForWatchlist();

                    logger.info('Fetched watchlist', { userId, count: watchlistItems.length });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch watchlist';
                    set({ error: errorMessage, isLoading: false });
                    logger.error('Failed to fetch watchlist', { error, userId });
                }
            },

            // Subscribe to real-time watchlist updates
            subscribeToWatchlist: (userId: string) => {
                const state = get();

                // Unsubscribe from existing subscription
                if (state.unsubscribe) {
                    state.unsubscribe();
                }

                if (!userId) {
                    set({ watchlist: [] });
                    return;
                }

                try {
                    const unsubscribe = subscribeToQuery<WatchlistItem>(
                        'watchlists',
                        {
                            whereConditions: [
                                { field: 'userId', operator: '==', value: userId }
                            ],
                            orderByFields: [
                                { field: 'addedAt', direction: 'desc' }
                            ]
                        },
                        (watchlistItems) => {
                            const items: WatchlistItemWithPrice[] = watchlistItems.map(item => ({
                                id: item.id,
                                userId: item.userId,
                                symbol: item.symbol,
                                companyName: item.companyName,
                                addedAt: item.addedAt,
                            }));

                            set({ watchlist: items, error: null });

                            // Fetch prices for updated items
                            get().fetchPricesForWatchlist();
                        },
                        (error) => {
                            logger.error('Watchlist subscription error', { error, userId });
                            set({ error: 'Real-time updates failed' });
                        }
                    );

                    set({ unsubscribe });
                    logger.info('Subscribed to watchlist updates', { userId });
                } catch (error) {
                    logger.error('Failed to subscribe to watchlist', { error, userId });
                    set({ error: 'Failed to set up real-time updates' });
                }
            },

            // Unsubscribe from watchlist updates
            unsubscribeFromWatchlist: () => {
                const state = get();
                if (state.unsubscribe) {
                    state.unsubscribe();
                    set({ unsubscribe: undefined });
                    logger.info('Unsubscribed from watchlist updates');
                }
            },

            // Fetch current prices for all watchlist items
            fetchPricesForWatchlist: async () => {
                const state = get();
                const now = new Date().toISOString();

                // Don't fetch prices too frequently (limit to once per minute)
                if (state.lastPriceFetch) {
                    const lastFetch = new Date(state.lastPriceFetch);
                    const timeDiff = Date.now() - lastFetch.getTime();
                    if (timeDiff < 60000) { // 1 minute
                        return;
                    }
                }

                if (state.watchlist.length === 0) {
                    return;
                }

                try {
                    const pricePromises = state.watchlist.map(async (item) => {
                        try {
                            const quote = await getStockQuote(item.symbol);
                            return {
                                symbol: item.symbol,
                                currentPrice: quote?.c,
                                change: quote?.d,
                                changePercent: quote?.dp,
                            };
                        } catch (error) {
                            logger.warn('Failed to fetch price', { symbol: item.symbol, error });
                            return null;
                        }
                    });

                    const priceResults = await Promise.all(pricePromises);

                    // Update watchlist with new prices
                    const updatedWatchlist = state.watchlist.map(item => {
                        const priceData = priceResults.find(p => p?.symbol === item.symbol);
                        if (priceData && priceData.currentPrice !== undefined) {
                            return {
                                ...item,
                                currentPrice: priceData.currentPrice,
                                change: priceData.change,
                                changePercent: priceData.changePercent,
                                lastUpdated: now,
                            };
                        }
                        return item;
                    });

                    set({
                        watchlist: updatedWatchlist,
                        lastPriceFetch: now
                    });

                    logger.info('Updated watchlist prices', { count: state.watchlist.length });
                } catch (error) {
                    logger.error('Failed to fetch watchlist prices', { error });
                }
            },

            // Update price for a specific item
            updateItemPrice: (symbol: string, price: number, change?: number, changePercent?: number) => {
                const state = get();
                const now = new Date().toISOString();

                const updatedWatchlist = state.watchlist.map(item => {
                    if (item.symbol === symbol.toUpperCase()) {
                        return {
                            ...item,
                            currentPrice: price,
                            change,
                            changePercent,
                            lastUpdated: now,
                        };
                    }
                    return item;
                });

                set({ watchlist: updatedWatchlist });
            },

            // Utility functions
            isInWatchlist: (symbol: string) => {
                const state = get();
                return state.watchlist.some(item => item.symbol === symbol.toUpperCase());
            },

            getWatchlistItem: (symbol: string) => {
                const state = get();
                return state.watchlist.find(item => item.symbol === symbol.toUpperCase());
            },

            clearWatchlist: () => {
                const state = get();
                if (state.unsubscribe) {
                    state.unsubscribe();
                }
                set({
                    watchlist: [],
                    error: null,
                    unsubscribe: undefined,
                    lastPriceFetch: undefined
                });
            },
        }),
        {
            name: 'watchlist-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                watchlist: state.watchlist,
                lastPriceFetch: state.lastPriceFetch,
            }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.setHydrated();
                }
            },
        }
    )
);