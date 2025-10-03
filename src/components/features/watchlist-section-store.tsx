/**
 * Enhanced Watchlist Section using the new Watchlist Store
 * This component demonstrates how to integrate the watchlist store with existing UI components
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWatchlistWithAuth } from '@/hooks/use-watchlist-store';
import { Eye, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';

const WatchlistSectionWithStore = () => {
    const {
        watchlist,
        isLoading,
        error,
        isAuthenticated,
        isHydrated,
        removeFromWatchlist,
        fetchPricesForWatchlist,
        clearError
    } = useWatchlistWithAuth();

    // Don't render if store is not hydrated yet
    if (!isHydrated) {
        return null;
    }

    // Don't render if user is not authenticated
    if (!isAuthenticated) {
        return null;
    }

    // Don't render if watchlist is empty and not loading
    if (!isLoading && watchlist.length === 0) {
        return (
            <section className="px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Eye className="h-12 w-12 text-slate-400 mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">
                                Your Watchlist is Empty
                            </h3>
                            <p className="text-slate-400 text-center mb-4">
                                Start tracking your favorite stocks by adding them to your watchlist
                            </p>
                            <Link href="/stocks-list">
                                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                                    Browse Stocks
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </section>
        );
    }

    const handleRemoveStock = async (symbol: string) => {
        try {
            await removeFromWatchlist(symbol);
        } catch (error) {
            console.error('Failed to remove stock:', error);
        }
    };

    const handleRefreshPrices = () => {
        fetchPricesForWatchlist();
    };

    // Show loading state
    if (isLoading && watchlist.length === 0) {
        return (
            <section className="px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">My Watchlist</h2>
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-600 text-slate-300"
                            disabled
                        >
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Loading...
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                            <Card key={i} className="bg-slate-800/50 border-slate-700 animate-pulse">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="h-4 bg-slate-600 rounded w-16"></div>
                                    <div className="h-4 w-4 bg-slate-600 rounded"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-8 bg-slate-600 rounded mb-2"></div>
                                    <div className="h-3 bg-slate-600 rounded w-24"></div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white">My Watchlist</h2>
                        <p className="text-slate-400 text-sm mt-1">
                            {watchlist.length} stock{watchlist.length !== 1 ? 's' : ''} tracked
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefreshPrices}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                            disabled={isLoading}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Link href="/watchlist">
                            <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                                <Eye className="h-4 w-4 mr-2" />
                                View All
                            </Button>
                        </Link>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
                        <div className="flex items-center justify-between">
                            <p className="text-red-300 text-sm">{error}</p>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearError}
                                className="text-red-300 hover:text-red-200 h-auto p-1"
                            >
                                ×
                            </Button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {watchlist.slice(0, 8).map((item) => {
                        const isPositive = item.change !== undefined && item.change >= 0;
                        const hasPrice = item.currentPrice !== undefined;

                        return (
                            <Card key={item.symbol} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-300">
                                        {item.symbol}
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveStock(item.symbol)}
                                        className="h-6 w-6 p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                                    >
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <Link href={`/stocks/${item.symbol}`}>
                                        <div className="cursor-pointer">
                                            <div className="text-xs text-slate-400 mb-1 truncate">
                                                {item.companyName}
                                            </div>

                                            {hasPrice ? (
                                                <>
                                                    <div className="text-2xl font-bold text-white mb-1">
                                                        ${item.currentPrice?.toFixed(2) || '0.00'}
                                                    </div>                                                    {item.change !== undefined && (
                                                        <div className={`flex items-center text-xs ${isPositive ? 'text-green-400' : 'text-red-400'
                                                            }`}>
                                                            {isPositive ? (
                                                                <TrendingUp className="h-3 w-3 mr-1" />
                                                            ) : (
                                                                <TrendingDown className="h-3 w-3 mr-1" />
                                                            )}
                                                            <span>
                                                                {isPositive ? '+' : ''}{item.change.toFixed(2)}
                                                                {item.changePercent !== undefined && (
                                                                    <span> ({item.changePercent.toFixed(2)}%)</span>
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {item.lastUpdated && (
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            Updated {new Date(item.lastUpdated).toLocaleTimeString()}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="text-2xl font-bold text-slate-500 mb-1">
                                                    Loading...
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {watchlist.length > 8 && (
                    <div className="mt-6 text-center">
                        <Link href="/watchlist">
                            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                                View All {watchlist.length} Stocks
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default WatchlistSectionWithStore;