import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { logger } from './logger';

// Server-side Firebase Admin configuration
let adminApp: App | null = null;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;

/**
 * Initialize Firebase Admin SDK with service account
 * This should only be used on the server side
 */
function initializeFirebaseAdmin(): App {
    if (adminApp) {
        return adminApp;
    }

    try {
        // Check if already initialized
        const existingApps = getApps();
        if (existingApps.length > 0) {
            adminApp = existingApps[0];
            return adminApp;
        }

        // Validate required environment variables
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

        if (!projectId || !privateKey || !clientEmail) {
            throw new Error(
                'Missing required Firebase Admin environment variables. ' +
                'Please set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL'
            );
        }

        // Initialize with service account credentials
        adminApp = initializeApp({
            credential: cert({
                projectId,
                privateKey,
                clientEmail,
            }),
            projectId,
        });

        logger.info('Firebase Admin SDK initialized successfully');
        return adminApp;

    } catch (error) {
        logger.error('Failed to initialize Firebase Admin SDK', { error });
        throw error;
    }
}

/**
 * Get Firebase Admin Auth instance
 */
export function getAdminAuth(): Auth {
    if (!adminAuth) {
        const app = initializeFirebaseAdmin();
        adminAuth = getAuth(app);
    }
    return adminAuth;
}

/**
 * Get Firebase Admin Firestore instance
 */
export function getAdminFirestore(): Firestore {
    if (!adminDb) {
        const app = initializeFirebaseAdmin();
        adminDb = getFirestore(app);
    }
    return adminDb;
}

/**
 * Verify Firebase ID token on server side
 */
export async function verifyFirebaseToken(idToken: string) {
    try {
        const auth = getAdminAuth();
        const decodedToken = await auth.verifyIdToken(idToken);

        logger.info('Token verified successfully', {
            uid: decodedToken.uid,
            email: decodedToken.email
        });

        return decodedToken;
    } catch (error) {
        logger.error('Token verification failed', { error });
        return null;
    }
}

/**
 * Create a custom token for a user (useful for testing or admin operations)
 */
export async function createCustomToken(uid: string, additionalClaims?: object) {
    try {
        const auth = getAdminAuth();
        const customToken = await auth.createCustomToken(uid, additionalClaims);

        logger.info('Custom token created', { uid });
        return customToken;
    } catch (error) {
        logger.error('Failed to create custom token', { error, uid });
        throw error;
    }
}

/**
 * Get user by UID from Firebase Admin
 */
export async function getAdminUser(uid: string) {
    try {
        const auth = getAdminAuth();
        const userRecord = await auth.getUser(uid);

        return {
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
            photoURL: userRecord.photoURL,
            emailVerified: userRecord.emailVerified,
            disabled: userRecord.disabled,
            metadata: {
                creationTime: userRecord.metadata.creationTime,
                lastSignInTime: userRecord.metadata.lastSignInTime,
            },
        };
    } catch (error) {
        logger.error('Failed to get user', { error, uid });
        return null;
    }
}

/**
 * Set custom claims for a user (useful for role-based access)
 */
export async function setUserClaims(uid: string, claims: object) {
    try {
        const auth = getAdminAuth();
        await auth.setCustomUserClaims(uid, claims);

        logger.info('Custom claims set successfully', { uid, claims });
        return true;
    } catch (error) {
        logger.error('Failed to set custom claims', { error, uid, claims });
        return false;
    }
}