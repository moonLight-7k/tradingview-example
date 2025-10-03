/**
 * Custom hook that wraps the watchlist store for easier usage
 * Provides automatic user authentication handling and lifecycle management
 */

'use client';

import { useEffect } from 'react';
import { useWatchlistStore } from '@/store/watchlist-store';
import { useAuth } from '@/hooks/use-auth';

export function useWatchlistWithAuth() {
    const { user, isAuthenticated } = useAuth();
    const store = useWatchlistStore();

    // Subscribe to watchlist when user is authenticated and store is hydrated
    useEffect(() => {
        if (isAuthenticated && user?.uid && store.isHydrated) {
            store.subscribeToWatchlist(user.uid);
        } else {
            store.unsubscribeFromWatchlist();
        }

        // Cleanup on unmount
        return () => {
            store.unsubscribeFromWatchlist();
        };
    }, [isAuthenticated, user?.uid, store.isHydrated, store]);

    // Auto-refresh prices periodically when there are items in watchlist
    useEffect(() => {
        if (store.watchlist.length > 0 && isAuthenticated) {
            // Initial price fetch
            store.fetchPricesForWatchlist();

            // Set up periodic refresh (every 2 minutes)
            const interval = setInterval(() => {
                store.fetchPricesForWatchlist();
            }, 120000);

            return () => clearInterval(interval);
        }
    }, [store.watchlist.length, isAuthenticated, store]);

    // Clear watchlist when user logs out
    useEffect(() => {
        if (!isAuthenticated) {
            store.clearWatchlist();
        }
    }, [isAuthenticated, store]);

    // Wrapper functions that include user authentication checks
    const addToWatchlist = async (symbol: string, companyName: string) => {
        if (!isAuthenticated || !user?.uid) {
            throw new Error('User must be authenticated to add to watchlist');
        }
        return store.addToWatchlist(symbol, companyName, user.uid);
    };

    const removeFromWatchlist = async (symbol: string) => {
        if (!isAuthenticated || !user?.uid) {
            throw new Error('User must be authenticated to remove from watchlist');
        }
        return store.removeFromWatchlist(symbol, user.uid);
    };

    const fetchWatchlist = async () => {
        if (!isAuthenticated || !user?.uid) {
            return;
        }
        return store.fetchWatchlist(user.uid);
    };

    return {
        // State
        watchlist: store.watchlist,
        isLoading: store.isLoading,
        error: store.error,
        isHydrated: store.isHydrated,

        // Authentication state
        isAuthenticated,
        user,

        // Actions (with auth checks built-in)
        addToWatchlist,
        removeFromWatchlist,
        fetchWatchlist,

        // Direct store actions (use with caution)
        fetchPricesForWatchlist: store.fetchPricesForWatchlist,
        updateItemPrice: store.updateItemPrice,
        clearError: store.clearError,

        // Utility functions
        isInWatchlist: store.isInWatchlist,
        getWatchlistItem: store.getWatchlistItem,

        // Store management
        clearWatchlist: store.clearWatchlist,
        subscribeToWatchlist: () => {
            if (user?.uid) {
                store.subscribeToWatchlist(user.uid);
            }
        },
        unsubscribeFromWatchlist: store.unsubscribeFromWatchlist,
    };
}

export default useWatchlistWithAuth;