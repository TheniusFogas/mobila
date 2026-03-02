import Link from 'next/link';
import type { Metadata } from 'next';

interface PageProps {
    params: Promise<{ category: string; slug: string }>;
}

// Fallback product data — replaced by Payload CMS fetch once seeded
const FALLBACK_PRODUCTS: Record<string, {
    name: string; subtitle: string; description: string;
    priceFrom: number; colors: { name: string; hex: string }[];
    roomImage?: string;
}> = {
    'dulap-edge': {
        name: 'Edge',
        subtitle: 'Linii verticale, formă ritmică',
        description: 'Dulapul Edge combină linii verticale cu aluminiu full-size pentru un ritm sculptural. Suprafețe generoase ascund sau evidențiază ce alegi. Disponibil în toate culorile din catalog.',
        priceFrom: 1617,
        colors: [
            { name: 'Alb Artic', hex: '#F5F0EB' },
            { name: 'Gri Piatră', hex: '#888' },
            { name: 'Antracit', hex: '#333' },
            { name: 'Nuc Natural', hex: '#C4956A' },
            { name: 'Verde Sage', hex: '#8B9E8B' },
        ],
    },
    'dulap-tone': {
        name: 'Tone',
        subtitle: 'Design minimal, suprafețe curate',
        description: 'Tone e definiția minimalismului. Fără decoruri. Fără distrageri. Suprafețe plane și proporții echilibrate pentru orice dormitor modern.',
        priceFrom: 1820,
        colors: [
            { name: 'Alb Optical', hex: '#FFFFFF' },
            { name: 'Gri Cald', hex: '#CCC' },
            { name: 'Grafit', hex: '#555' },
            { name: 'Caramel', hex: '#B8956A' },
        ],
    },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const p = FALLBACK_PRODUCTS[slug];
    return {
        title: p ? `${p.name} – ${p.subtitle} | KAGU` : 'Produs | KAGU',
        description: p?.description || '',
    };
}

export default async function ProductPage({ params }: PageProps) {
    const { category, slug } = await params;
    const product = FALLBACK_PRODUCTS[slug] || FALLBACK_PRODUCTS['dulap-edge'];

    return (
        <main style={{ minHeight: '100vh', background: '#F7F5F2', fontFamily: 'Inter, system-ui, sans-serif' }}>
            {/* Navbar */}
            <nav style={{ background: '#1A1A1A', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', gap: 24, position: 'sticky', top: 0, zIndex: 100 }}>
                <Link href="/" style={{ fontWeight: 800, fontSize: 18, color: '#E8472C', textDecoration: 'none' }}>KAGU</Link>
                <span style={{ color: '#555', fontSize: 12 }}>/</span>
                <Link href={`/${category}`} style={{ color: '#aaa', fontSize: 13, textDecoration: 'none' }}>{category.charAt(0).toUpperCase() + category.slice(1)}</Link>
                <span style={{ color: '#555', fontSize: 12 }}>/</span>
                <span style={{ color: '#ccc', fontSize: 13 }}>{product.name}</span>
            </nav>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 48px 80px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48, alignItems: 'start' }}>
                {/* LEFT — Product image gallery */}
                <div>
                    {/* Main image */}
                    <div style={{ background: '#EAE6DF', borderRadius: 16, height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                        <div style={{ textAlign: 'center', color: '#aaa' }}>
                            <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>Adaugă imagini din Admin → Produse → {product.name}</div>
                        </div>
                    </div>
                    {/* Thumbnail strip */}
                    <div style={{ display: 'flex', gap: 8 }}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{ flex: 1, height: 80, background: '#E0DCD6', borderRadius: 8, cursor: 'pointer', border: i === 1 ? '2px solid #E8472C' : '2px solid transparent', transition: 'border 0.15s' }} />
                        ))}
                    </div>

                    {/* Description */}
                    <div style={{ marginTop: 32 }}>
                        <h2 style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#aaa', marginBottom: 12 }}>Despre această linie</h2>
                        <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7 }}>{product.description}</p>
                    </div>
                </div>

                {/* RIGHT — Configure panel */}
                <div style={{ position: 'sticky', top: 80 }}>
                    <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 4px 24px rgba(0,0,0,0.1)', padding: '24px' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.5px' }}>{product.name}</div>
                        <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{product.subtitle}</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', marginTop: 16 }}>
                            de la {product.priceFrom.toLocaleString('ro-RO')} RON
                        </div>

                        <div style={{ marginTop: 20 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#999', textTransform: 'uppercase', marginBottom: 10 }}>Culori disponibile</div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {product.colors.map((c) => (
                                    <div
                                        key={c.hex}
                                        title={c.name}
                                        style={{ width: 28, height: 28, borderRadius: '50%', background: c.hex, border: '2px solid rgba(0,0,0,0.1)', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <Link
                                href={`/${category}/${slug}/configure`}
                                style={{ display: 'block', textAlign: 'center', background: '#E8472C', color: '#fff', padding: '15px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none', letterSpacing: 0.3 }}
                            >
                                Configurează
                            </Link>
                            <div style={{ fontSize: 11, color: '#aaa', textAlign: 'center', lineHeight: 1.6 }}>
                                Livrare 6–9 săptămâni · Produs industrial CNC
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
