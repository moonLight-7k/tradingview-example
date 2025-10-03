import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}

interface Modal {
    id: string;
    isOpen: boolean;
    data?: any;
}

interface UIState {
    theme: 'light' | 'dark' | 'system';
    sidebarOpen: boolean;
    notifications: Notification[];
    modals: Record<string, Modal>;

    // Actions
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;

    // Notifications
    addNotification: (notification: Omit<Notification, 'id'>) => void;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;

    // Modals
    openModal: (id: string, data?: any) => void;
    closeModal: (id: string) => void;
    toggleModal: (id: string) => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set, get) => ({
            theme: 'system',
            sidebarOpen: true,
            notifications: [],
            modals: {},

            setTheme: (theme) => set({ theme }),

            toggleSidebar: () => set((state) => ({
                sidebarOpen: !state.sidebarOpen
            })),

            setSidebarOpen: (open) => set({ sidebarOpen: open }),

            addNotification: (notification) => {
                const id = Math.random().toString(36).substr(2, 9);
                set((state) => ({
                    notifications: [...state.notifications, { ...notification, id }],
                }));

                // Auto-remove notification after duration
                if (notification.duration) {
                    setTimeout(() => {
                        get().removeNotification(id);
                    }, notification.duration);
                }
            },

            removeNotification: (id) => set((state) => ({
                notifications: state.notifications.filter((n) => n.id !== id),
            })),

            clearNotifications: () => set({ notifications: [] }),

            openModal: (id, data) => set((state) => ({
                modals: {
                    ...state.modals,
                    [id]: { id, isOpen: true, data },
                },
            })),

            closeModal: (id) => set((state) => ({
                modals: {
                    ...state.modals,
                    [id]: { ...state.modals[id], isOpen: false },
                },
            })),

            toggleModal: (id) => set((state) => {
                const modal = state.modals[id];
                return {
                    modals: {
                        ...state.modals,
                        [id]: modal
                            ? { ...modal, isOpen: !modal.isOpen }
                            : { id, isOpen: true },
                    },
                };
            }),
        }),
        {
            name: 'ui-storage',
            storage: createJSONStorage(() => localStorage),
            // Only persist theme and sidebarOpen
            partialize: (state) => ({
                theme: state.theme,
                sidebarOpen: state.sidebarOpen,
            }),
        }
    )
);
