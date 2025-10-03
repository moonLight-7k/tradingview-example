'use client';

import React, { Component, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

interface GlobalErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface GlobalErrorBoundaryState {
    hasError: boolean;
    error?: Error;
    errorInfo?: React.ErrorInfo;
    errorId?: string;
}

class GlobalErrorBoundary extends Component<
    GlobalErrorBoundaryProps,
    GlobalErrorBoundaryState
> {
    constructor(props: GlobalErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): GlobalErrorBoundaryState {
        const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return {
            hasError: true,
            error,
            errorId
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        const errorId = this.state.errorId || 'unknown';

        // Log the error with structured data
        logger.error('Global error boundary caught error', {
            errorId,
            name: error.name,
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            url: typeof window !== 'undefined' ? window.location.href : 'server',
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
            timestamp: new Date().toISOString(),
        });

        // Update state with error info
        this.setState({
            errorInfo,
            errorId
        });

        // In production, you might want to send this to an error reporting service
        if (process.env.NODE_ENV === 'production') {
            // Example: Send to Sentry, LogRocket, or your error tracking service
            // this.reportErrorToService(error, errorInfo, errorId);
        }
    }

    private reportErrorToService = (_error: Error, _errorInfo: React.ErrorInfo, _errorId: string) => {
        // Implementation for error reporting service
        // Example for Sentry:
        // Sentry.withScope((scope) => {
        //     scope.setTag('errorBoundary', true);
        //     scope.setTag('errorId', errorId);
        //     scope.setContext('errorInfo', errorInfo);
        //     Sentry.captureException(error);
        // });
    };

    private handleRetry = () => {
        this.setState({
            hasError: false,
            error: undefined,
            errorInfo: undefined,
            errorId: undefined
        });

        // Optionally reload the page for critical errors
        if (typeof window !== 'undefined') {
            window.location.reload();
        }
    };

    private handleGoHome = () => {
        if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
    };

    private copyErrorInfo = () => {
        const errorDetails = {
            errorId: this.state.errorId,
            message: this.state.error?.message,
            name: this.state.error?.name,
            stack: this.state.error?.stack,
            componentStack: this.state.errorInfo?.componentStack,
            timestamp: new Date().toISOString(),
            url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        };

        if (typeof window !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
        }
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
                    <Card className="max-w-2xl w-full bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                        <CardContent className="p-8 text-center">
                            <div className="mb-6">
                                <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                                <h1 className="text-2xl font-bold text-gray-100 mb-2">
                                    Something went wrong
                                </h1>
                                <p className="text-gray-400 mb-4">
                                    We&apos;re sorry, but an unexpected error occurred. Our team has been notified.
                                </p>

                                {process.env.NODE_ENV === 'development' && this.state.error && (
                                    <div className="bg-slate-900/50 rounded-lg p-4 mb-6 text-left">
                                        <h3 className="text-red-400 font-semibold mb-2">Development Error Details:</h3>
                                        <p className="text-sm text-gray-300 font-mono mb-2">
                                            <span className="text-red-400">Error:</span> {this.state.error.name}
                                        </p>
                                        <p className="text-sm text-gray-300 font-mono mb-2">
                                            <span className="text-red-400">Message:</span> {this.state.error.message}
                                        </p>
                                        {this.state.errorId && (
                                            <p className="text-sm text-gray-300 font-mono">
                                                <span className="text-red-400">Error ID:</span> {this.state.errorId}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Button
                                    onClick={this.handleRetry}
                                    variant="default"
                                    className="flex items-center gap-2"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Try Again
                                </Button>

                                <Button
                                    onClick={this.handleGoHome}
                                    variant="outline"
                                    className="flex items-center gap-2"
                                >
                                    <Home className="h-4 w-4" />
                                    Go to Home
                                </Button>

                                {process.env.NODE_ENV === 'development' && (
                                    <Button
                                        onClick={this.copyErrorInfo}
                                        variant="ghost"
                                        size="sm"
                                        className="text-gray-400"
                                    >
                                        Copy Error Details
                                    </Button>
                                )}
                            </div>

                            <div className="mt-6 text-xs text-gray-500">
                                <p>If this problem persists, please contact support.</p>
                                {this.state.errorId && (
                                    <p className="mt-1">Error ID: {this.state.errorId}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;