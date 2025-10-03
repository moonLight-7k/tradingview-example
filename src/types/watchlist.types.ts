// Watchlist types - Updated to match PROJECT.md schema
export interface WatchlistItem {
    id?: string; // Firestore document ID (optional for new items)
    userId: string;
    symbol: string;
    companyName: string; // Changed from 'name' to 'companyName' per PROJECT.md
    addedAt: import('firebase/firestore').Timestamp | string; // Firebase Timestamp or ISO string
    // Removed price fields as they're not in the base schema
    // Price data will be fetched separately when displaying
}

// Realtime Database Watchlist types
export interface RTDBWatchlistItem {
    symbol: string;
    company: string;
    price?: number; // Optional - only present if provided
    change?: number; // Optional - only present if provided  
    changePercent?: number; // Optional - only present if provided
    addedAt: object; // Firebase server timestamp
    updatedAt: object; // Firebase server timestamp
}

export interface RTDBWatchlistData {
    [symbol: string]: RTDBWatchlistItem;
}

export interface WatchlistHookReturn {
    watchlist: WatchlistItem[];
    isLoading: boolean;
    error: string | null;
    addToWatchlist: (symbol: string, companyName: string) => Promise<void>;
    removeFromWatchlist: (symbol: string) => Promise<void>;
    isInWatchlist: (symbol: string) => boolean;
    refreshWatchlist: () => Promise<void>;
    updatePrices: (priceUpdates: { symbol: string; price: number; change?: number; changePercent?: number }[]) => Promise<void>;
}

export interface RTDBWatchlistHookReturn {
    watchlist: RTDBWatchlistData;
    watchlistArray: RTDBWatchlistItem[];
    isLoading: boolean;
    error: string | null;
    addToWatchlist: (symbol: string, company: string, price?: number) => Promise<void>;
    removeFromWatchlist: (symbol: string) => Promise<void>;
    isInWatchlist: (symbol: string) => boolean;
    updateStockPrice: (symbol: string, price: number, change?: number, changePercent?: number) => Promise<void>;
    getWatchlistCount: () => number;
}