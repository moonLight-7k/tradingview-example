'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import WatchlistButton from '@/components/WatchlistButton';
import { useWatchlist } from '@/hooks/use-watchlist';
import { useAuth } from '@/hooks/use-auth';
import { ArrowLeft, Plus } from 'lucide-react';

export default function WatchlistPage() {
    const { isAuthenticated } = useAuth();
    const { watchlist, isLoading } = useWatchlist();

    // Show login prompt if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-8">
                            <Link href="/">
                                <Button variant="ghost" className="text-gray-300 hover:text-white mb-4">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Home
                                </Button>
                            </Link>
                            <h1 className="text-3xl font-bold text-white">My Watchlist</h1>
                        </div>

                        <div className="text-center py-16">
                            <div className="mx-auto max-w-md">
                                <h2 className="text-xl font-semibold text-white mb-4">
                                    Sign in to view your watchlist
                                </h2>
                                <p className="text-gray-400 mb-8">
                                    Create an account or sign in to save stocks to your watchlist and track their performance.
                                </p>
                                <div className="space-x-4">
                                    <Link href="/login">
                                        <Button className="bg-blue-600 hover:bg-blue-700">
                                            Sign In
                                        </Button>
                                    </Link>
                                    <Link href="/signup">
                                        <Button variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                                            Sign Up
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-8">
                            <Link href="/">
                                <Button variant="ghost" className="text-gray-300 hover:text-white mb-4">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Home
                                </Button>
                            </Link>
                            <h1 className="text-3xl font-bold text-white">My Watchlist</h1>
                            <p className="text-gray-400 mt-2">Loading your watchlist...</p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {[...Array(8)].map((_, i) => (
                                <Card key={i} className="bg-slate-800/50 border-slate-700 animate-pulse">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <div className="h-4 bg-slate-600 rounded w-16"></div>
                                        <div className="h-4 w-4 bg-slate-600 rounded"></div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-8 bg-slate-600 rounded mb-2"></div>
                                        <div className="h-3 bg-slate-600 rounded w-24 mb-2"></div>
                                        <div className="h-3 bg-slate-600 rounded w-32"></div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Empty state
    if (watchlist.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-8">
                            <Link href="/">
                                <Button variant="ghost" className="text-gray-300 hover:text-white mb-4">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Home
                                </Button>
                            </Link>
                            <h1 className="text-3xl font-bold text-white">My Watchlist</h1>
                        </div>

                        <div className="text-center py-16">
                            <div className="mx-auto max-w-md">
                                <Plus className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                                <h2 className="text-xl font-semibold text-white mb-4">
                                    Your watchlist is empty
                                </h2>
                                <p className="text-gray-400 mb-8">
                                    Start building your watchlist by adding stocks you want to track. Look for the star icon next to any stock.
                                </p>
                                <Link href="/stocks-list">
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        Explore Stocks
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Watchlist with items
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8">
                        <Link href="/">
                            <Button variant="ghost" className="text-gray-300 hover:text-white mb-4">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Home
                            </Button>
                        </Link>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-white">My Watchlist</h1>
                                <p className="text-gray-400 mt-2">
                                    {watchlist.length} stock{watchlist.length !== 1 ? 's' : ''} in your watchlist
                                </p>
                            </div>
                            <Link href="/stocks">
                                <Button variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add More Stocks
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {watchlist.map((item) => {
                            return (
                                <Card
                                    key={item.id || item.symbol}
                                    className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors"
                                >
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
                                                showTrashIcon={true}
                                            />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <Link href={`/stocks/${item.symbol.toLowerCase()}`}>
                                            <div className="cursor-pointer">
                                                <div className="text-xl font-bold text-white mb-2">
                                                    {item.companyName}
                                                </div>
                                                <p className="text-sm text-gray-400 mb-1">
                                                    Symbol: {item.symbol}
                                                </p>
                                                <p className="text-xs text-gray-500">
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
                </div>
            </div>
        </div>
    );
}