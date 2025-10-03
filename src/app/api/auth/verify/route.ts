import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/firebase-admin';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            logger.warn('Missing or invalid authorization header');
            return NextResponse.json(
                { error: 'Missing or invalid authorization header' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        if (!token) {
            logger.warn('No token provided');
            return NextResponse.json(
                { error: 'No token provided' },
                { status: 401 }
            );
        }

        // Verify the token with Firebase Admin
        const decodedToken = await verifyFirebaseToken(token);

        if (!decodedToken) {
            logger.warn('Invalid token provided');
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        logger.info('Token verified successfully', { uid: decodedToken.uid });

        return NextResponse.json({
            success: true,
            uid: decodedToken.uid,
            email: decodedToken.email,
        });

    } catch (error) {
        logger.error('Token verification failed', { error });
        return NextResponse.json(
            { error: 'Token verification failed' },
            { status: 401 }
        );
    }
}