'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useGetMeQuery } from '@/store/authApi';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const router = useRouter();
    const { data, isLoading, error } = useGetMeQuery();

    useEffect(() => {
        if (!isLoading && (error || !data?.data)) {
            router.push('/login');
        }
    }, [isLoading, error, data, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-600 border-t-white" />
                    <p className="text-neutral-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (error || !data?.data) {
        return null; // Redirecting...
    }

    return <>{children}</>;
}
