'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import {
    addDocument,
    deleteDocumentsByQuery,
    subscribeToQuery,
    queryDocuments
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
        companyName: string
    ) => {
        console.log('🚀 addToWatchlist called', { symbol, companyName, isAuthenticated, userId: user?.uid });

        if (!isAuthenticated || !user?.uid) {
            const errorMsg = 'User must be authenticated to add to watchlist';
            console.error('❌ Auth check failed:', { isAuthenticated, userId: user?.uid });
            throw new Error(errorMsg);
        }

        setError(null);
        setIsLoading(true);

        try {
            const symbolUpper = symbol.toUpperCase();

            // Check if stock already exists in watchlist
            const existingItemsResult = await queryDocuments<WatchlistItem>('watchlists', {
                whereConditions: [
                    { field: 'userId', operator: '==', value: user.uid },
                    { field: 'symbol', operator: '==', value: symbolUpper }
                ]
            });

            if (existingItemsResult.data.length > 0) {
                console.log('📋 Stock already in watchlist');
                logger.info('Stock already in watchlist', { symbol: symbolUpper, userId: user.uid });
                return;
            }

            // Create new watchlist item with proper schema
            const watchlistData = {
                userId: user.uid,
                symbol: symbolUpper,
                companyName: companyName,
                addedAt: Timestamp.now(),
            };

            console.log('📦 Watchlist data to save:', watchlistData);

            await addDocument('watchlists', watchlistData);
            console.log('✅ Successfully added to watchlist (Firestore)');
            logger.info('Added to watchlist (Firestore)', { symbol: symbolUpper, userId: user.uid });
        } catch (err) {
            console.error('❌ Error adding to watchlist:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to add to watchlist';
            setError(errorMessage);
            logger.error('Failed to add to watchlist (Firestore)', {
                error: err,
                symbol,
                companyName,
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

            // Delete documents that match userId and symbol
            await deleteDocumentsByQuery('watchlists', {
                whereConditions: [
                    { field: 'userId', operator: '==', value: user.uid },
                    { field: 'symbol', operator: '==', value: symbolUpper }
                ]
            });

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

    // Update prices for multiple stocks - simplified for new schema
    const updatePrices = useCallback(async (
        priceUpdates: { symbol: string; price: number; change?: number; changePercent?: number }[]
    ) => {
        if (!isAuthenticated || !user?.uid) {
            throw new Error('User must be authenticated to update prices');
        }

        // Note: With the new simplified schema, price updates would need to be handled differently
        // For now, we'll just log the request since the basic schema doesn't include price fields
        logger.info('Price update requested for watchlist items', {
            symbols: priceUpdates.map(u => u.symbol),
            userId: user.uid
        });

        // The watchlist will get real-time price data from the TradingView widgets
        // or through separate API calls when displaying the data
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
            'watchlists',
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