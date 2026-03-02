'use client';

import React, { useEffect, useState } from 'react';

interface ClientOnlyProps {
    children: React.ReactNode;
}

/**
 * ClientOnly wrapper prevents any 3D or browser-only components
 * from being rendered during Next.js SSR/static build phase.
 */
export const ClientOnly: React.FC<ClientOnlyProps> = ({ children }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-full h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border border-white/20 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white/40 text-xs uppercase tracking-widest font-mono">KAGU Industrial</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
