'use client';

import React, { memo, useState, useEffect } from 'react';
import useTradingViewWidget from "@/hooks/useTradingViewWidget";
import TradingViewErrorBoundary from "@/components/features/trading-view-error-boundary";
import { cn } from "@/lib/utils";
import { Loader2 } from 'lucide-react';

interface TradingViewWidgetProps {
    title?: string;
    scriptUrl: string;
    config: Record<string, unknown>;
    height?: number;
    className?: string;
}

const TradingViewWidget = ({ title, scriptUrl, config, height = 600, className }: TradingViewWidgetProps) => {
    const containerRef = useTradingViewWidget(scriptUrl, config, height);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000); // Stop showing loading after 2 seconds

        return () => clearTimeout(timer);
    }, []);

    return (
        <TradingViewErrorBoundary>
            <div className="w-full">
                {title && <h3 className="font-semibold text-2xl text-gray-100 mb-5">{title}</h3>}
                <div className={cn('tradingview-widget-container relative', className)} ref={containerRef}>
                    {isLoading && (
                        <div
                            className="absolute inset-0 flex items-center justify-center bg-slate-800/50 rounded-lg z-10"
                            style={{ height }}
                        >
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        </div>
                    )}
                    <div className="tradingview-widget-container__widget" style={{ height, width: "100%" }} />
                </div>
            </div>
        </TradingViewErrorBoundary>
    );
}

export default memo(TradingViewWidget);
