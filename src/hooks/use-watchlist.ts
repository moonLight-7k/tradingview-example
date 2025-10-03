'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import {
    setDocument,
    deleteDocument,
    updateDocument,
    subscribeToQuery,
    documentExists
} from '@/db/firestoreDB.utils';
import { Timestamp } from 'firebase/firestore';
import type { WatchlistItem, WatchlistHookReturn } from '@/types';
import { logger } from '@/lib/logger';

export function useWatchlist(): WatchlistHookReturn {
    const { user, isAuthenticated } = useAuth();
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Add stock to watchlist
    const addToWatchlist = useCallback(async (
        symbol: string,
        name: string
    ) => {
        console.log('🚀 addToWatchlist called', { symbol, name, isAuthenticated, userId: user?.uid });

        if (!isAuthenticated || !user?.uid) {
            const errorMsg = 'User must be authenticated to add to watchlist';
            console.error('❌ Auth check failed:', { isAuthenticated, userId: user?.uid });
            throw new Error(errorMsg);
        }

        setError(null);
        setIsLoading(true);

        try {
            const symbolUpper = symbol.toUpperCase();

            const watchlistData = {
                userId: user.uid,
                symbol: symbolUpper,
                name,
                addedAt: Timestamp.now().toDate().toISOString(),
                updatedAt: Timestamp.now().toDate().toISOString(),
            };

            console.log('📦 Watchlist data to save:', watchlistData);

            await setDocument('watchlist', `${user.uid}_${symbolUpper}`, watchlistData);
            console.log('✅ Successfully added to watchlist (Firestore)');
            logger.info('Added to watchlist (Firestore)', { symbol: symbolUpper, userId: user.uid });
        } catch (err) {
            console.error('❌ Error adding to watchlist:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to add to watchlist';
            setError(errorMessage);
            logger.error('Failed to add to watchlist (Firestore)', {
                error: err,
                symbol,
                userId: user.uid
            });
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, user?.uid]);

    // Remove stock from watchlist
    const removeFromWatchlist = useCallback(async (symbol: string) => {
        if (!isAuthenticated || !user?.uid) {
            throw new Error('User must be authenticated to remove from watchlist');
        }

        setError(null);
        setIsLoading(true);

        try {
            const symbolUpper = symbol.toUpperCase();
            const docId = `${user.uid}_${symbolUpper}`;

            await deleteDocument('watchlist', docId);
            logger.info('Removed from watchlist (Firestore)', { symbol: symbolUpper, userId: user.uid });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to remove from watchlist';
            setError(errorMessage);
            logger.error('Failed to remove from watchlist (Firestore)', {
                error: err,
                symbol,
                userId: user.uid
            });
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, user?.uid]);

    // Check if stock is in watchlist
    const isInWatchlist = useCallback((symbol: string): boolean => {
        const symbolUpper = symbol.toUpperCase();
        return watchlist.some(item => item.symbol === symbolUpper);
    }, [watchlist]);

    // Update prices for multiple stocks
    const updatePrices = useCallback(async (
        priceUpdates: { symbol: string; price: number; change?: number; changePercent?: number }[]
    ) => {
        if (!isAuthenticated || !user?.uid) {
            throw new Error('User must be authenticated to update prices');
        }

        try {
            const updatePromises = priceUpdates.map(async ({ symbol, price, change, changePercent }) => {
                const symbolUpper = symbol.toUpperCase();
                const docId = `${user.uid}_${symbolUpper}`;

                // Check if stock exists in watchlist first
                const exists = await documentExists('watchlist', docId);
                if (!exists) {
                    logger.warn('Attempted to update price for stock not in watchlist', {
                        symbol: symbolUpper,
                        userId: user.uid
                    });
                    return;
                }

                const updatePayload: Partial<WatchlistItem> = {
                    price,
                    updatedAt: Timestamp.now().toDate().toISOString(),
                };

                if (change !== undefined) {
                    updatePayload.change = change;
                }
                if (changePercent !== undefined) {
                    updatePayload.changePercent = changePercent;
                }

                await updateDocument('watchlist', docId, updatePayload);
                logger.info('Updated stock price in watchlist (Firestore)', {
                    symbol: symbolUpper,
                    price,
                    userId: user.uid
                });
            });

            await Promise.all(updatePromises);
        } catch (err) {
            logger.error('Failed to update prices (Firestore)', {
                error: err,
                userId: user.uid
            });
            throw err;
        }
    }, [isAuthenticated, user?.uid]);

    // Refresh watchlist manually
    const refreshWatchlist = useCallback(async () => {
        // The subscription will automatically refresh, but we can trigger a manual refresh if needed
        if (!isAuthenticated || !user?.uid) {
            setWatchlist([]);
            return;
        }
        // The real-time subscription handles this automatically
    }, [isAuthenticated, user?.uid]);

    // Set up real-time subscription to user's watchlist
    useEffect(() => {
        if (!isAuthenticated || !user?.uid) {
            setWatchlist([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        const unsubscribe = subscribeToQuery<WatchlistItem>(
            'watchlist',
            {
                whereConditions: [
                    { field: 'userId', operator: '==', value: user.uid }
                ],
                orderByFields: [
                    { field: 'addedAt', direction: 'desc' }
                ]
            },
            (data) => {
                setWatchlist(data || []);
                setIsLoading(false);
                logger.info('Watchlist data updated (Firestore)', {
                    count: data ? data.length : 0,
                    userId: user.uid
                });
            },
            (error) => {
                const errorMessage = error.message || 'Failed to load watchlist';
                setError(errorMessage);
                setIsLoading(false);
                logger.error('Watchlist subscription error (Firestore)', {
                    error,
                    userId: user.uid
                });
            }
        );

        return () => {
            unsubscribe();
        };
    }, [isAuthenticated, user?.uid]);

    return {
        watchlist,
        isLoading,
        error,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        refreshWatchlist,
        updatePrices,
    };
}