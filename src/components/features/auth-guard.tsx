'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { logger } from '@/lib/logger';

interface AuthGuardProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    // Debug logging
    useEffect(() => {
        console.log('[AuthGuard] State:', { isAuthenticated, isLoading });
    }, [isAuthenticated, isLoading]);

    // useEffect(() => {
    //     // Redirect to login if not authenticated after loading completes
    //     if (!isAuthenticated) {
    //         logger.info('Unauthorized access attempt, redirecting to login');
    //         console.log('[AuthGuard] Redirecting to /login');
    //         router.push('/login');
    //     }
    // }, [isAuthenticated, isLoading, router]);

    // Show loading state while checking authentication
    if (isLoading && !isAuthenticated) {
        console.log('[AuthGuard] Showing loading spinner');
        return (
            fallback || (
                <div className="flex min-h-screen items-center justify-center">
                    <div className="text-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
                    </div>
                </div>
            )
        );
    }

    // Don't render children until authenticated
    if (!isAuthenticated) {
        console.log('[AuthGuard] Not authenticated, returning null');
        return null;
    }

    console.log('[AuthGuard] Authenticated, rendering children');
    return <>{children}</>;
}
