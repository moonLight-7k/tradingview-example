// UI types
export interface UIState {
    isSidebarOpen: boolean;
    theme: 'light' | 'dark' | 'system';
    notifications: Notification[];
}

export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: string;
}
