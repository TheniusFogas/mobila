'use client';

import Link from 'next/link';
import { useState } from 'react';

interface Category {
    slug: string;
    name: string;
    description: string;
    emoji: string;
}

export default function HomeClient({ categories }: { categories: Category[] }) {
    const [hovered, setHovered] = useState<string | null>(null);

    return (
        <section style={{ padding: '0 48px 80px', maxWidth: 1200, margin: '0 auto' }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, color: '#999', textTransform: 'uppercase', marginBottom: 24 }}>
                Colecții
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {categories.map(cat => (
                    <Link key={cat.slug} href={`/${cat.slug}`} style={{ textDecoration: 'none' }}>
                        <div
                            onMouseEnter={() => setHovered(cat.slug)}
                            onMouseLeave={() => setHovered(null)}
                            style={{
                                background: '#fff', borderRadius: 12, overflow: 'hidden',
                                boxShadow: hovered === cat.slug ? '0 8px 28px rgba(0,0,0,0.13)' : '0 2px 12px rgba(0,0,0,0.06)',
                                transform: hovered === cat.slug ? 'translateY(-4px)' : 'none',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                cursor: 'pointer',
                            }}
                        >
                            {/* Hero image from Payload — emoji until admin uploads */}
                            <div style={{ height: 180, background: '#F0ECE7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>
                                {cat.emoji}
                            </div>
                            <div style={{ padding: '16px 20px 20px' }}>
                                <div style={{ fontWeight: 700, fontSize: 17, color: '#1A1A1A' }}>{cat.name}</div>
                                <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{cat.description}</div>
                                <div style={{ marginTop: 12, fontSize: 12, color: '#E8472C', fontWeight: 600 }}>Explorează →</div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
