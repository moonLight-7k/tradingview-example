'use client';

import { CryptoListProps } from '@/types';
import { CryptoCard } from './crypto-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function CryptoList({ title, cryptos, isLoading = false }: CryptoListProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-bold">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <Card key={index} className="animate-pulse">
                                <CardHeader className="pb-3">
                                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (cryptos.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-bold">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <p className="text-gray-600 dark:text-gray-400">
                            No cryptocurrency data available at the moment.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl font-bold">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cryptos.map((crypto, index) => (
                        <CryptoCard
                            key={crypto.symbol}
                            crypto={crypto}
                            rank={index + 1}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}