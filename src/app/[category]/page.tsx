import Link from 'next/link';
import type { Metadata } from 'next';
import ProductCard from './ProductCard';

interface PageProps {
    params: Promise<{ category: string }>;
}

// Category metadata from slug
const CATEGORY_META: Record<string, { name: string; description: string }> = {
    dulapuri: { name: 'Dulapuri', description: 'Dulapuri de dormitor configurabile — culoare, dimensiuni, interior.' },
    paturi: { name: 'Paturi', description: 'Paturi tapițate și din lemn masiv, configurabile.' },
    bucatarie: { name: 'Bucătărie', description: 'Module de bucătărie CNC, configurate online.' },
    birou: { name: 'Birou', description: 'Biblioteci și birouri modulate, realizate industrial.' },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { category } = await params;
    const meta = CATEGORY_META[category] || { name: category, description: '' };
    return {
        title: `${meta.name} | KAGU Industrial`,
        description: meta.description,
    };
}

// Fetch products from Payload for this category
async function getProducts(categorySlug: string) {
    try {
        const base = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
        const res = await fetch(
            `${base}/api/payload-products?category=${categorySlug}&published=true`,
            { next: { revalidate: 60 } }
        );
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

// Fallback placeholder products (replace with real Payload data)
const FALLBACK_PRODUCTS = [
    { slug: 'dulap-edge', name: 'Edge', subtitle: 'Linii verticale, formă ritmică', priceFrom: 1617, colors: ['#F5F0EB', '#888', '#333', '#C4956A', '#8B9E8B'] },
    { slug: 'dulap-tone', name: 'Tone', subtitle: 'Design minimal, suprafețe curate', priceFrom: 1820, colors: ['#F5F0EB', '#CCC', '#555', '#B8956A'] },
];

export default async function CategoryPage({ params }: PageProps) {
    const { category } = await params;
    const meta = CATEGORY_META[category] || { name: category, description: '' };
    const products = FALLBACK_PRODUCTS; // swap with await getProducts(category)

    return (
        <main style={{ minHeight: '100vh', background: '#F7F5F2', fontFamily: 'Inter, system-ui, sans-serif' }}>
            {/* Navbar */}
            <nav style={{ background: '#1A1A1A', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', gap: 24, position: 'sticky', top: 0, zIndex: 100 }}>
                <Link href="/" style={{ fontWeight: 800, fontSize: 18, color: '#E8472C', textDecoration: 'none' }}>KAGU</Link>
                <span style={{ color: '#555', fontSize: 12 }}>/</span>
                <span style={{ color: '#ccc', fontSize: 13 }}>{meta.name}</span>
            </nav>

            {/* Header */}
            <div style={{ padding: '48px 48px 32px', maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>
                    <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>Toate produsele</Link>
                    {' '} › {meta.name}
                </div>
                <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-1.5px', color: '#1A1A1A', margin: 0 }}>{meta.name}</h1>
                <p style={{ color: '#888', marginTop: 8, fontSize: 14 }}>{meta.description}</p>
            </div>

            {/* Product grid */}
            <div style={{ padding: '0 48px 80px', maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                    {products.map((p) => (
                        <ProductCard key={p.slug} product={p} category={category} />
                    ))}
                </div>
            </div>
        </main>
    );
}
