// Re-export Firebase Auth User type for convenience
import type { User as FirebaseAuthUser } from 'firebase/auth';
export type { User as FirebaseAuthUser } from 'firebase/auth';

// Auth types
export interface AuthState {
    user: FirebaseAuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
}

// Form types
export interface LoginFormData {
    email: string;
    password: string;
}

export interface SignupFormData extends LoginFormData {
    confirmPassword: string;
}
