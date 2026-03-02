'use client';

import React, { useEffect, useState } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function HomeClient() {
    const [FurnitureViewer, setFurnitureViewer] = useState<React.ComponentType | null>(null);
    const [DiscoveryEngine, setDiscoveryEngine] = useState<React.ComponentType | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Load everything dynamically after mount to ensure browser-only execution
        Promise.all([
            import('@/components/FurnitureViewer'),
            import('@/components/DiscoveryEngine'),
        ]).then(([furnitureModule, discoveryModule]) => {
            setFurnitureViewer(() => furnitureModule.default);
            setDiscoveryEngine(() => discoveryModule.DiscoveryEngine);
            setMounted(true);
        }).catch(err => {
            console.error('Failed to load components:', err);
        });
    }, []);

    if (!mounted || !FurnitureViewer) {
        return (
            <div style={{
                width: '100vw', height: '100vh', background: '#000',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '32px', height: '32px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        borderTopColor: 'white',
                        animation: 'spin 0.8s linear infinite',
                        margin: '0 auto 16px'
                    }} />
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase' }}>
                        KAGU Industrial
                    </p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <FurnitureViewer />
            {DiscoveryEngine && <DiscoveryEngine />}
        </ErrorBoundary>
    );
}
