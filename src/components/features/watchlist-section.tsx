'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import WatchlistButton from '@/components/WatchlistButton';
import { useWatchlist } from '@/hooks/use-watchlist';
import { useAuth } from '@/hooks/use-auth';
import { Eye } from 'lucide-react';

const WatchlistSection = () => {
    const { isAuthenticated } = useAuth();
    const { watchlist, isLoading } = useWatchlist();

    // Don't render if user is not authenticated
    if (!isAuthenticated) {
        return null;
    }

    // Don't render if watchlist is empty
    if (!isLoading && watchlist.length === 0) {
        return null;
    }

    // Show loading state
    if (isLoading) {
        return (
            <section className="px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">My Watchlist</h2>
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

    // Show only first 4 items on homepage
    const displayedWatchlist = watchlist.slice(0, 4);
    const hasMore = watchlist.length > 4;

    return (
        <section className="px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">My Watchlist</h2>
                    {hasMore && (
                        <Link href="/watchlist">
                            <Button variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                                <Eye className="h-4 w-4 mr-2" />
                                Show All ({watchlist.length})
                            </Button>
                        </Link>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {displayedWatchlist.map((item) => {
                        return (
                            <Card key={item.id || item.symbol} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-300">
                                        {item.symbol}
                                    </CardTitle>
                                    <div className="flex items-center space-x-2">
                                        <WatchlistButton
                                            symbol={item.symbol}
                                            company={item.companyName}
                                            isInWatchlist={true}
                                            type="icon"
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Link href={`/stocks/${item.symbol.toLowerCase()}`}>
                                        <div className="cursor-pointer">
                                            <div className="text-lg font-semibold text-white mb-2">
                                                {item.companyName}
                                            </div>
                                            <p className="text-xs text-gray-400">
                                                Added {typeof item.addedAt === 'string'
                                                    ? new Date(item.addedAt).toLocaleDateString()
                                                    : item.addedAt?.toDate?.()?.toLocaleDateString() || 'Recently'
                                                }
                                            </p>
                                        </div>
                                    </Link>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {!hasMore && watchlist.length > 0 && (
                    <div className="text-center mt-6">
                        <Link href="/watchlist">
                            <Button variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                                <Eye className="h-4 w-4 mr-2" />
                                View All Watchlist Items
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default WatchlistSection;