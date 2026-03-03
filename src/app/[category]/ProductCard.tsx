'use client';

import Link from 'next/link';

interface Product {
    slug: string;
    name: string;
    subtitle: string;
    priceFrom: number;
    colors: string[];
}

export default function ProductCard({ product, category }: { product: Product; category: string }) {
    const { slug, name, subtitle, priceFrom, colors } = product;
    return (
        <Link key={slug} href={`/${category}/${slug}`} style={{ textDecoration: 'none' }}>
            <div
                className="product-card"
                style={{
                    background: '#fff', borderRadius: 12, overflow: 'hidden',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)', cursor: 'pointer',
                    transition: 'transform 0.18s, box-shadow 0.18s',
                }}
                onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 28px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'none';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
                }}
            >
                {/* Product image box — admin uploads from Payload */}
                <div style={{ height: 280, background: '#EAE6DF', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <div style={{ fontSize: 13, color: '#aaa', fontWeight: 500 }}>
                        Imagine produs<br /><span style={{ fontSize: 10 }}>Adaugă din Admin → {name}</span>
                    </div>
                    <div style={{ position: 'absolute', bottom: 12, left: 14, display: 'flex', gap: 5 }}>
                        {colors.map((c: string) => (
                            <div key={c} style={{ width: 18, height: 18, borderRadius: '50%', background: c, border: '2px solid rgba(255,255,255,0.8)', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
                        ))}
                    </div>
                </div>
                <div style={{ padding: '14px 16px 18px' }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: '#1A1A1A' }}>{name}</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{subtitle}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>{priceFrom.toLocaleString('ro-RO')} RON</span>
                        <span style={{ fontSize: 11, color: '#E8472C', fontWeight: 600 }}>Configurare completă →</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
