import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {

    // // Check for Firebase auth token in cookies
    // const firebaseToken = request.cookies.get('firebase-auth-token')?.value;
    // if (!firebaseToken)
    //     return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
}
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|sign-in|sign-up|assets).*)',
    ],
};