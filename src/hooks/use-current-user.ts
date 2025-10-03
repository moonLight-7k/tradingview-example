'use client';

import { useAuth } from './use-auth';

export function useCurrentUser() {
    const { user, isLoading, isAuthenticated } = useAuth();

    return {
        user,
        isLoading,
        isAuthenticated,
        isGuest: !isAuthenticated,
    };
}
