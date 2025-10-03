import type { Metadata } from 'next';
import { AuthGuard } from '@/components/features/auth-guard';
import { Navbar } from '@/components/features/navbar';

export const metadata: Metadata = {
    title: 'Dashboard',
    description: 'Your application dashboard',
};

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
            </div>
        </AuthGuard>
    );
}
