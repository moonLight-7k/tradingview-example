'use client';

import React, { Component, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface TradingViewErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface TradingViewErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

class TradingViewErrorBoundary extends Component<
    TradingViewErrorBoundaryProps,
    TradingViewErrorBoundaryState
> {
    constructor(props: TradingViewErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): TradingViewErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.warn('TradingView Widget Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Card className="bg-slate-800/30 border-slate-700">
                    <CardContent className="p-6 text-center">
                        <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-200 mb-2">
                            Widget Loading Error
                        </h3>
                        <p className="text-sm text-gray-400">
                            The trading widget failed to load. Please refresh the page or try again later.
                        </p>
                    </CardContent>
                </Card>
            );
        }

        return this.props.children;
    }
}

export default TradingViewErrorBoundary;