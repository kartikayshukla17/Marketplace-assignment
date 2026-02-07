'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

export function ApiStatus() {
    const [isSlowLoading, setIsSlowLoading] = useState(false);
    const [requestStartTime, setRequestStartTime] = useState<number | null>(null);

    useEffect(() => {
        // Listen for fetch requests
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const startTime = Date.now();
            setRequestStartTime(startTime);

            const response = await originalFetch(...args);

            const duration = Date.now() - startTime;
            if (duration > 2000) {
                setIsSlowLoading(true);
                setTimeout(() => setIsSlowLoading(false), 3000);
            } else {
                setIsSlowLoading(false);
            }

            setRequestStartTime(null);
            return response;
        };

        return () => {
            window.fetch = originalFetch;
        };
    }, []);

    // Show message after 2 seconds of loading
    useEffect(() => {
        if (requestStartTime) {
            const timer = setTimeout(() => {
                setIsSlowLoading(true);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [requestStartTime]);

    if (!isSlowLoading) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500/10 border-b border-amber-500/20 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-center gap-3 text-amber-400">
                    <Loader2 className="animate-spin" size={18} />
                    <p className="text-sm font-medium">
                        Backend is waking up from sleep... This may take up to 60 seconds on first request.
                    </p>
                </div>
            </div>
        </div>
    );
}
