'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { logger } from '@/lib/logger';
import { PreferencesForm } from './preferences-form';
import type { UserPreferences } from '@/types';

interface AuthFormProps {
    mode: 'login' | 'signup';
}

export function AuthForm({ mode }: AuthFormProps) {
    const router = useRouter();
    const { signIn, signUp, signInWithGoogle, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [showPreferences, setShowPreferences] = useState(false);
    const [pendingCredentials, setPendingCredentials] = useState<{ email: string; password: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (mode === 'signup' && password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            if (mode === 'login') {
                await signIn(email, password);
                logger.info('User logged in successfully', { email });
                router.push('/');
            } else {
                // For signup, show preferences form first
                setPendingCredentials({ email, password });
                setShowPreferences(true);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An error occurred';
            setError(message);
            logger.error('Authentication error', { error: message, mode });
        }
    };

    const handlePreferencesComplete = async (preferences: UserPreferences) => {
        if (!pendingCredentials) return;

        try {
            await signUp(pendingCredentials.email, pendingCredentials.password, preferences);
            logger.info('User signed up successfully with preferences', { email: pendingCredentials.email });
            router.push('/');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Sign up failed';
            setError(message);
            setShowPreferences(false);
            logger.error('Signup error', { error: message });
        }
    };

    const handlePreferencesSkip = async () => {
        if (!pendingCredentials) return;

        try {
            await signUp(pendingCredentials.email, pendingCredentials.password);
            logger.info('User signed up successfully', { email: pendingCredentials.email });
            router.push('/');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Sign up failed';
            setError(message);
            setShowPreferences(false);
            logger.error('Signup error', { error: message });
        }
    };

    const handleGoogle = async () => {
        setError('');
        try {
            await signInWithGoogle();
            router.push('/');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Google sign-in failed';
            setError(message);
            logger.error('Google authentication error', { error: message });
        }
    };

    // Show preferences form for signup
    if (mode === 'signup' && showPreferences) {
        return (
            <PreferencesForm
                onComplete={handlePreferencesComplete}
                onSkip={handlePreferencesSkip}
                isLoading={isLoading}
            />
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{mode === 'login' ? 'Sign In' : 'Sign Up'}</CardTitle>
                <CardDescription>
                    {mode === 'login'
                        ? 'Enter your credentials to access your account'
                        : 'Create a new account to get started'}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                            Email
                        </label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium">
                            Password
                        </label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {mode === 'signup' && (
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium">
                                Confirm Password
                            </label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Continue'}
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleGoogle}
                        className="w-full"
                        disabled={isLoading}
                    >
                        Continue with Google
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">{mode === 'login' ? (
                        <>
                            Don&apos;t have an account?{' '}
                            <a href="/signup" className="text-primary hover:underline">
                                Sign up
                            </a>
                        </>
                    ) : (
                        <>
                            Already have an account?{' '}
                            <a href="/login" className="text-primary hover:underline">
                                Sign in
                            </a>
                        </>
                    )}
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
}
