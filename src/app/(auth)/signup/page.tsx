import { AuthForm } from '@/components/features/auth-form';

export default function SignupPage() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-md space-y-6 px-4">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Create an account</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Sign up to get started with your new account
                    </p>
                </div>
                <AuthForm mode="signup" />
            </div>
        </div>
    );
}
