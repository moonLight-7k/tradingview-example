import {
    collection,
    addDoc,
    deleteDoc,
    getDocs,
    query,
    where,
    orderBy,
    updateDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { WatchlistItem } from '@/types';

const WATCHLIST_COLLECTION = 'watchlists';

// Add stock to watchlist
export const addToWatchlist = async (
    userId: string,
    symbol: string,
    name: string,
    price?: number
): Promise<WatchlistItem> => {
    try {
        const newItem = {
            userId,
            symbol: symbol.toUpperCase(),
            name,
            price,
            addedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const docRef = await addDoc(collection(db, WATCHLIST_COLLECTION), newItem);

        const watchlistItem: WatchlistItem = {
            id: docRef.id,
            ...newItem,
            companyName: ''
        };

        logger.info('Added to watchlist', { symbol, userId });
        return watchlistItem;
    } catch (error) {
        logger.error('Failed to add to watchlist', { error, symbol, userId });
        throw new Error('Failed to add stock to watchlist');
    }
};

// Remove stock from watchlist
export const removeFromWatchlist = async (userId: string, symbol: string): Promise<void> => {
    try {
        const q = query(
            collection(db, WATCHLIST_COLLECTION),
            where('userId', '==', userId),
            where('symbol', '==', symbol.toUpperCase())
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error('Stock not found in watchlist');
        }

        // Delete all documents with this symbol (should be just one)
        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        logger.info('Removed from watchlist', { symbol, userId });
    } catch (error) {
        logger.error('Failed to remove from watchlist', { error, symbol, userId });
        throw new Error('Failed to remove stock from watchlist');
    }
};

// Get user's watchlist
export const getUserWatchlist = async (userId: string): Promise<WatchlistItem[]> => {
    try {
        const q = query(
            collection(db, WATCHLIST_COLLECTION),
            where('userId', '==', userId),
            orderBy('addedAt', 'desc')
        );

        const querySnapshot = await getDocs(q);

        const watchlist: WatchlistItem[] = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as WatchlistItem));

        logger.info('Retrieved watchlist', { userId, count: watchlist.length });
        return watchlist;
    } catch (error) {
        logger.error('Failed to get watchlist', { error, userId });
        throw new Error('Failed to retrieve watchlist');
    }
};

// Check if stock is in watchlist
export const isStockInWatchlist = async (userId: string, symbol: string): Promise<boolean> => {
    try {
        const q = query(
            collection(db, WATCHLIST_COLLECTION),
            where('userId', '==', userId),
            where('symbol', '==', symbol.toUpperCase())
        );

        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        logger.error('Failed to check watchlist status', { error, symbol, userId });
        return false;
    }
};

// Update watchlist item prices (for periodic updates)
export const updateWatchlistPrices = async (
    userId: string,
    priceUpdates: { symbol: string; price: number; change?: number; changePercent?: number }[]
): Promise<void> => {
    try {
        const updatePromises = priceUpdates.map(async (update) => {
            const q = query(
                collection(db, WATCHLIST_COLLECTION),
                where('userId', '==', userId),
                where('symbol', '==', update.symbol.toUpperCase())
            );

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const docRef = querySnapshot.docs[0].ref;
                await updateDoc(docRef, {
                    price: update.price,
                    change: update.change,
                    changePercent: update.changePercent,
                    updatedAt: new Date().toISOString(),
                });
            }
        });

        await Promise.all(updatePromises);
        logger.info('Updated watchlist prices', { userId, count: priceUpdates.length });
    } catch (error) {
        logger.error('Failed to update watchlist prices', { error, userId });
        throw new Error('Failed to update watchlist prices');
    }
};

// Get watchlist count for a user
export const getWatchlistCount = async (userId: string): Promise<number> => {
    try {
        const q = query(
            collection(db, WATCHLIST_COLLECTION),
            where('userId', '==', userId)
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.size;
    } catch (error) {
        logger.error('Failed to get watchlist count', { error, userId });
        return 0;
    }
};

// Clear all watchlist items for a user (useful for account deletion)
export const clearUserWatchlist = async (userId: string): Promise<void> => {
    try {
        const q = query(
            collection(db, WATCHLIST_COLLECTION),
            where('userId', '==', userId)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
        }

        logger.info('Cleared user watchlist', { userId, count: querySnapshot.size });
    } catch (error) {
        logger.error('Failed to clear user watchlist', { error, userId });
        throw new Error('Failed to clear watchlist');
    }
};