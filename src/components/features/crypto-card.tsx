'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CryptoData } from '@/types';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CryptoCardProps {
    crypto: CryptoData;
    rank?: number;
}

export function CryptoCard({ crypto, rank }: CryptoCardProps) {
    const router = useRouter();
    const isPositive = crypto.changePercent >= 0;

    const formatPrice = (price: number) => {
        if (price >= 1) {
            return price.toFixed(2);
        } else {
            return price.toFixed(6);
        }
    };

    const handleClick = () => {
        router.push(`/stocks/${crypto.symbol}`);
    };

    return (
        <Card
            className="hover:shadow-lg transition-all border-gray-200 dark:border-gray-800 cursor-pointer hover:scale-[1.02]"
            onClick={handleClick}
        >
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {rank && (
                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                #{rank}
                            </span>
                        )}
                        <CardTitle className="text-lg font-bold">
                            {crypto.symbol}
                        </CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                        {isPositive ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                    </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {crypto.name}
                </p>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">
                            ${formatPrice(crypto.price)}
                        </span>
                        <div className="text-right">
                            <div
                                className={cn(
                                    'font-semibold',
                                    isPositive ? 'text-green-500' : 'text-red-500'
                                )}
                            >
                                {isPositive ? '+' : ''}{crypto.changePercent.toFixed(2)}%
                            </div>
                            <div
                                className={cn(
                                    'text-sm',
                                    isPositive ? 'text-green-500' : 'text-red-500'
                                )}
                            >
                                {isPositive ? '+' : ''}${crypto.change.toFixed(2)}
                            </div>
                        </div>
                    </div>

                    {(crypto.high24h || crypto.low24h) && (
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            {crypto.high24h && (
                                <span>24h High: ${formatPrice(crypto.high24h)}</span>
                            )}
                            {crypto.low24h && (
                                <span>24h Low: ${formatPrice(crypto.low24h)}</span>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}