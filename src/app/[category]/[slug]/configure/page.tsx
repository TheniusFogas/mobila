'use client';

import { Suspense, lazy } from 'react';
import Link from 'next/link';
import { use } from 'react';

const FurnitureViewer = lazy(() => import('@/components/FurnitureViewer'));

interface Props {
    params: Promise<{ category: string; slug: string }>;
}

export default function ConfiguratorPage({ params }: Props) {
    const { category, slug } = use(params);

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
            {/* Back breadcrumb — minimal, top-left */}
            <div style={{
                position: 'absolute', top: 14, left: 18, zIndex: 50,
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(6px)',
                borderRadius: 100, padding: '5px 14px',
                border: '1px solid rgba(0,0,0,0.07)', fontSize: 11, fontWeight: 600,
            }}>
                <Link href={`/${category}/${slug}`} style={{ color: '#555', textDecoration: 'none' }}>
                    ← {slug.replace(/-/g, ' ')}
                </Link>
            </div>

            {/* The 3D Configurator — full screen */}
            <Suspense fallback={
                <div style={{ width: '100vw', height: '100vh', background: '#E8E4DC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', color: '#999', fontSize: 14 }}>
                    Se încarcă configuratorul…
                </div>
            }>
                <FurnitureViewer />
            </Suspense>
        </div>
    );
}
