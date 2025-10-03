import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip auth check for public routes
    const publicRoutes = ['/login', '/signup', '/api/auth', '/'];
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    if (isPublicRoute) {
        return NextResponse.next();
    }

    // Check for Firebase auth token in cookies
    const firebaseToken = request.cookies.get('firebase-auth-token')?.value;

    if (!firebaseToken) {
        // Note: We can't use our logger here since middleware runs in edge runtime
        console.log('[Middleware] No auth token found, redirecting to login');
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        // Verify token with Firebase Admin
        const response = await fetch(new URL('/api/auth/verify', request.url), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${firebaseToken}`,
            },
        });

        if (!response.ok) {
            console.log('[Middleware] Token verification failed, redirecting to login');
            // Clear invalid token
            const redirectResponse = NextResponse.redirect(new URL('/login', request.url));
            redirectResponse.cookies.delete('firebase-auth-token');
            return redirectResponse;
        }

        return NextResponse.next();
    } catch (error) {
        console.error('[Middleware] Token verification error:', error);
        const redirectResponse = NextResponse.redirect(new URL('/login', request.url));
        redirectResponse.cookies.delete('firebase-auth-token');
        return redirectResponse;
    }
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|sign-in|sign-up|assets).*)',
    ],
};