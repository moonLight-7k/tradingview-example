'use client';

import React, { useEffect, useState } from 'react';
import { CryptoList } from '@/components/features/crypto-list';
import { CryptoData } from '@/types';
import { getTopCryptoGainers, getTopCryptoLosers, getTrendingCrypto } from '@/lib/actions/finnhub.actions';

export default function StocksListPage() {
    const [topGainers, setTopGainers] = useState<CryptoData[]>([]);
    const [topLosers, setTopLosers] = useState<CryptoData[]>([]);
    const [trending, setTrending] = useState<CryptoData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCryptoData = async () => {
            setIsLoading(true);
            try {
                const [gainersData, losersData, trendingData] = await Promise.all([
                    getTopCryptoGainers(),
                    getTopCryptoLosers(),
                    getTrendingCrypto()
                ]);

                setTopGainers(gainersData);
                setTopLosers(losersData);
                setTrending(trendingData);
            } catch (error) {
                console.error('Error fetching crypto data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCryptoData();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    Cryptocurrency Market
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Track the latest crypto market movements, top gainers, and trending cryptocurrencies
                </p>
            </div>

            <div className="space-y-8">
                {/* Top Gainers Section */}
                <CryptoList
                    title="🚀 Top Crypto Gainers"
                    cryptos={topGainers}
                    isLoading={isLoading}
                />

                {/* Top Losers Section */}
                <CryptoList
                    title="📉 Top Crypto Losers"
                    cryptos={topLosers}
                    isLoading={isLoading}
                />

                {/* Trending Section */}
                <CryptoList
                    title="🔥 Trending Cryptocurrencies"
                    cryptos={trending}
                    isLoading={isLoading}
                />
            </div>

            {/* Market Info */}
            <div className="mt-12 text-center">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-2">Market Information</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Data provided by Finnhub. Prices are updated every 5 minutes during market hours.
                        Past performance is not indicative of future results.
                    </p>
                </div>
            </div>
        </div>
    );
}
