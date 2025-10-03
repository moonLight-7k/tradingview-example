import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Serializable user data (not the full Firebase User object)
interface SerializableUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
}

interface AuthState {
    user: SerializableUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    isHydrated: boolean;

    // Actions
    setUser: (user: SerializableUser | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearError: () => void;
    logout: () => void;
    setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            isHydrated: false,

            setUser: (user) => set({
                user,
                isAuthenticated: !!user,
                error: null,
            }),

            setLoading: (loading) => set({ isLoading: loading }),

            setError: (error) => set({ error }),

            clearError: () => set({ error: null }),

            logout: () => set({
                user: null,
                isAuthenticated: false,
                error: null,
            }),

            setHydrated: () => set({ isHydrated: true }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            // Only persist user and isAuthenticated
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
            onRehydrateStorage: () => (state) => {
                // Set hydrated to true after rehydration
                if (state) {
                    state.setHydrated();
                }
            },
        }
    )
);
