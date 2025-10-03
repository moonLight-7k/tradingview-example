import { logger } from './logger';

// Define the structure of required environment variables
interface EnvironmentConfig {
    // Client-side Firebase config (safe to expose)
    NEXT_PUBLIC_FIREBASE_API_KEY: string;
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
    NEXT_PUBLIC_FIREBASE_APP_ID: string;
    NEXT_PUBLIC_FIREBASE_DATABASE_URL?: string;

    // Server-side only (sensitive)
    FIREBASE_PROJECT_ID: string;
    FIREBASE_PRIVATE_KEY: string;
    FIREBASE_CLIENT_EMAIL: string;

    // External API keys
    FINNHUB_API_KEY: string;
    NEXT_PUBLIC_FINNHUB_API_KEY?: string;

    // Email configuration
    SMTP_HOST?: string;
    SMTP_PORT?: string;
    SMTP_USER?: string;
    SMTP_PASS?: string;

    // Application settings
    NODE_ENV: 'development' | 'production' | 'test';
    NEXT_PUBLIC_LOG_LEVEL?: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Validates that all required environment variables are present
 */
function validateEnvironmentVariables(): EnvironmentConfig {
    const requiredVars = [
        'NEXT_PUBLIC_FIREBASE_API_KEY',
        'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
        'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
        'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
        'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
        'NEXT_PUBLIC_FIREBASE_APP_ID',
        'FIREBASE_PROJECT_ID',
        'FIREBASE_PRIVATE_KEY',
        'FIREBASE_CLIENT_EMAIL',
        'FINNHUB_API_KEY',
        'NODE_ENV',
    ];

    const missing: string[] = [];
    const config: Partial<EnvironmentConfig> = {};

    // Check for required variables
    for (const varName of requiredVars) {
        const value = process.env[varName];
        if (!value || value.trim() === '') {
            missing.push(varName);
        } else {
            (config as Record<string, string>)[varName] = value.trim();
        }
    }

    // Add optional variables
    const optionalVars = [
        'NEXT_PUBLIC_FIREBASE_DATABASE_URL',
        'NEXT_PUBLIC_FINNHUB_API_KEY',
        'SMTP_HOST',
        'SMTP_PORT',
        'SMTP_USER',
        'SMTP_PASS',
        'NEXT_PUBLIC_LOG_LEVEL',
    ];

    for (const varName of optionalVars) {
        const value = process.env[varName];
        if (value && value.trim() !== '') {
            (config as Record<string, string>)[varName] = value.trim();
        }
    }

    if (missing.length > 0) {
        const errorMessage = `Missing required environment variables: ${missing.join(', ')}`;
        logger.error('Environment validation failed', { missing });
        throw new Error(errorMessage);
    }

    // Validate NODE_ENV
    if (!['development', 'production', 'test'].includes(config.NODE_ENV!)) {
        throw new Error(`Invalid NODE_ENV: ${config.NODE_ENV}. Must be 'development', 'production', or 'test'`);
    }

    // Validate Firebase project ID consistency
    if (config.FIREBASE_PROJECT_ID !== config.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
        logger.warn('Firebase project ID mismatch between server and client configs');
    }

    // Validate email configuration (if any email vars are provided, all should be)
    const emailVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
    const providedEmailVars = emailVars.filter(varName => (config as Record<string, string>)[varName]);

    if (providedEmailVars.length > 0 && providedEmailVars.length < emailVars.length) {
        const missingEmailVars = emailVars.filter(varName => !(config as Record<string, string>)[varName]);
        logger.warn('Incomplete email configuration', {
            provided: providedEmailVars,
            missing: missingEmailVars
        });
    }

    logger.info('Environment validation successful', {
        nodeEnv: config.NODE_ENV,
        hasEmailConfig: providedEmailVars.length === emailVars.length,
        projectId: config.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });

    return config as EnvironmentConfig;
}

/**
 * Get validated environment configuration
 * This will throw an error if required variables are missing
 */
export function getEnvironmentConfig(): EnvironmentConfig {
    try {
        return validateEnvironmentVariables();
    } catch (error) {
        logger.error('Failed to validate environment configuration', { error });
        // In development, provide helpful error message
        if (process.env.NODE_ENV === 'development') {
            console.error('\n🚨 Environment Configuration Error 🚨');
            console.error(error instanceof Error ? error.message : 'Unknown error');
            console.error('\nPlease check your .env file and ensure all required variables are set.');
            console.error('\nRequired variables:');
            console.error('- NEXT_PUBLIC_FIREBASE_* (client-side Firebase config)');
            console.error('- FIREBASE_* (server-side Firebase admin config)');
            console.error('- FINNHUB_API_KEY (for stock data)');
            console.error('- NODE_ENV (development|production|test)\n');
        }
        throw error;
    }
}

/**
 * Check if we're running on the server side
 */
export function isServerSide(): boolean {
    return typeof window === 'undefined';
}

/**
 * Get client-safe environment config (only includes NEXT_PUBLIC_ variables)
 */
export function getClientConfig() {
    if (!isServerSide()) {
        // On client side, we can only access NEXT_PUBLIC_ variables
        return {
            NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
            NEXT_PUBLIC_FIREBASE_DATABASE_URL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
            NEXT_PUBLIC_FINNHUB_API_KEY: process.env.NEXT_PUBLIC_FINNHUB_API_KEY,
            NEXT_PUBLIC_LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL,
        };
    }

    // On server side, return the full validated config (filtered for client-safe vars)
    const config = getEnvironmentConfig();
    return {
        NEXT_PUBLIC_FIREBASE_API_KEY: config.NEXT_PUBLIC_FIREBASE_API_KEY,
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: config.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: config.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: config.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: config.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        NEXT_PUBLIC_FIREBASE_APP_ID: config.NEXT_PUBLIC_FIREBASE_APP_ID,
        NEXT_PUBLIC_FIREBASE_DATABASE_URL: config.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
        NEXT_PUBLIC_FINNHUB_API_KEY: config.NEXT_PUBLIC_FINNHUB_API_KEY,
        NEXT_PUBLIC_LOG_LEVEL: config.NEXT_PUBLIC_LOG_LEVEL,
    };
}