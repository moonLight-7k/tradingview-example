import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getClientConfig } from './env-config';
import { logger } from './logger';

// Get validated client-side configuration
let firebaseConfig: ReturnType<typeof getClientConfig>;

try {
    firebaseConfig = getClientConfig();

    // Validate that we have all required client-side config
    if (!firebaseConfig.NEXT_PUBLIC_FIREBASE_API_KEY ||
        !firebaseConfig.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
        !firebaseConfig.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
        throw new Error('Missing required Firebase client configuration');
    }
} catch (error) {
    logger.error('Failed to load Firebase client configuration', { error });
    throw error;
}

const clientFirebaseConfig = {
    apiKey: firebaseConfig.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: firebaseConfig.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: firebaseConfig.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: firebaseConfig.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: firebaseConfig.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: firebaseConfig.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: firebaseConfig.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: FirebaseApp;

try {
    // Initialize Firebase only on client side  
    if (!getApps().length) {
        app = initializeApp(clientFirebaseConfig);
        logger.info('Firebase client initialized successfully', {
            projectId: clientFirebaseConfig.projectId
        });
    } else {
        app = getApps()[0];
        logger.info('Using existing Firebase app instance');
    }
} catch (error) {
    logger.error('Failed to initialize Firebase client', { error });
    throw error;
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
