'use client';

import { useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { useAuthStore } from '@/store/auth-store';
import type { UserProfile, UserPreferences } from '@/types';

// Helper to convert Firebase User to serializable format
const toSerializableUser = (firebaseUser: FirebaseUser) => ({
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
});

export function useAuth() {
    const { user, isLoading, isAuthenticated, setUser, setLoading, setError, logout } = useAuthStore();

    // Helper function to sync user profile in Firestore
    const syncUserProfile = async (firebaseUser: FirebaseUser, preferences?: UserPreferences): Promise<void> => {
        try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                // Create new user profile if it doesn't exist
                const newUserProfile: UserProfile = {
                    id: firebaseUser.uid,
                    email: firebaseUser.email!,
                    displayName: firebaseUser.displayName || undefined,
                    photoURL: firebaseUser.photoURL || undefined,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    preferences: preferences,
                };

                await setDoc(userDocRef, newUserProfile);
                logger.info('User profile created', { userId: firebaseUser.uid });
            }
        } catch (error) {
            logger.error('Error syncing user profile', { error });
            // Don't throw - we can still authenticate even if profile sync fails
        }
    };

    useEffect(() => {
        logger.debug('useAuth: Setting up auth listener');
        setLoading(true);
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            logger.debug('useAuth: Auth state changed', {
                hasUser: !!firebaseUser,
                uid: firebaseUser?.uid
            });
            if (firebaseUser) {
                // Get Firebase ID token and set cookie
                const idToken = await firebaseUser.getIdToken();
                document.cookie = `firebase-auth-token=${idToken}; path=/; max-age=3600; secure; samesite=strict`;

                await syncUserProfile(firebaseUser);
                setUser(toSerializableUser(firebaseUser));
            } else {
                // Clear cookie when user logs out
                document.cookie = 'firebase-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                setUser(null);
            }
            setLoading(false);
            logger.debug('useAuth: Loading complete');
        });

        return () => unsubscribe();
    }, [setUser, setLoading]);

    const signIn = async (email: string, password: string) => {
        try {
            setLoading(true);
            setError(null);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            await syncUserProfile(userCredential.user);
            setUser(toSerializableUser(userCredential.user));
            logger.info('User signed in', { userId: userCredential.user.uid });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
            logger.error('Sign in error', { error });
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (email: string, password: string, preferences?: UserPreferences) => {
        try {
            setLoading(true);
            setError(null);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await syncUserProfile(userCredential.user, preferences);
            setUser(toSerializableUser(userCredential.user));
            logger.info('User signed up', { userId: userCredential.user.uid });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
            logger.error('Sign up error', { error });
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signInWithGoogle = async () => {
        try {
            setLoading(true);
            setError(null);
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            // result.user contains the authenticated user
            await syncUserProfile(result.user);
            setUser(toSerializableUser(result.user));
            logger.info('User signed in with Google', { userId: result.user.uid });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Google sign in failed';
            logger.error('Google sign in error', { error });
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        try {
            // Clear the auth cookie
            document.cookie = 'firebase-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

            await firebaseSignOut(auth);
            logout();
            logger.info('User signed out');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
            logger.error('Sign out error', { error });
            setError(errorMessage);
            throw error;
        }
    };

    return {
        user,
        isLoading,
        isAuthenticated,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
    };
}
