import { AuthForm } from '@/components/features/auth-form';

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-md space-y-6 px-4">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Welcome back</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Sign in to your account to continue
                    </p>
                </div>
                <AuthForm mode="login" />
            </div>
        </div>
    );
}
