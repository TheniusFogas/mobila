import type { Metadata } from 'next';
import Link from 'next/link';
import HomeClient from './HomeClient';

// Fallback categories — replaced automatically when admin adds categories in Payload CMS
const FALLBACK_CATEGORIES = [
  { slug: 'dormitor', name: 'Dormitor', description: 'Dulapuri, paturi, noptiere configurabile.', emoji: '🛏️' },
  { slug: 'bucatarie', name: 'Bucătărie', description: 'Module de bucătărie CNC, planuri personalizate.', emoji: '🍳' },
  { slug: 'living', name: 'Living', description: 'Biblioteci, TV units, structuri modulate.', emoji: '📺' },
  { slug: 'birou', name: 'Birou', description: 'Birouri și sisteme de depozitare pentru muncă.', emoji: '📚' },
];

export const metadata: Metadata = {
  title: 'Mobilă Industrială CNC | KAGU – Configurator Online',
  description: 'Configurează și comandă mobilier realizat industrial CNC din România. Precizie milimetrică, livrat asamblat.',
};

export default async function HomePage() {
  // When Payload DB is connected: fetch from /api/payload-categories
  const categories = FALLBACK_CATEGORIES;
  const firstCat = categories[0];

  return (
    <main style={{ minHeight: '100vh', background: '#EAE6DF', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* ── NAVBAR ── */}
      <nav style={{ background: '#1A1A1A', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: 20, color: '#E8472C', letterSpacing: '-0.5px', textDecoration: 'none' }}>
          KAGU
        </Link>
        <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          {categories.map(c => (
            <Link key={c.slug} href={`/${c.slug}`} style={{ color: '#ccc', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
              {c.name}
            </Link>
          ))}
          <Link href="/admin" style={{ color: '#E8472C', fontSize: 12, fontWeight: 700, border: '1px solid #E8472C', borderRadius: 4, padding: '4px 10px', textDecoration: 'none' }}>
            Admin
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ padding: '80px 48px 60px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ maxWidth: 600 }}>
          <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-2px', color: '#1A1A1A', margin: 0 }}>
            Mobilă industrială.<br />
            <span style={{ color: '#E8472C' }}>Configurată de tine.</span>
          </h1>
          <p style={{ fontSize: 18, color: '#666', marginTop: 20, lineHeight: 1.6 }}>
            Creăm piese CNC de precizie milimetrică, direct din configuratorul tău online. Fără compromisuri.
          </p>
          {/* CTA links to first category from CMS — not hardcoded */}
          <Link
            href={`/${firstCat.slug}`}
            style={{ display: 'inline-block', marginTop: 32, background: '#E8472C', color: '#fff', padding: '14px 32px', borderRadius: 8, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}
          >
            {firstCat.name} →
          </Link>
        </div>
      </section>

      {/* ── CATEGORY GRID — client component for hover effects ── */}
      <HomeClient categories={categories} />

      {/* ── TRUST STRIP ── */}
      <section style={{ background: '#1A1A1A', padding: '32px 48px', display: 'flex', justifyContent: 'center', gap: 64, flexWrap: 'wrap' }}>
        {[
          ['CNC Industrial', 'Tăiere de precizie 0.1mm'],
          ['6–9 săptămâni', 'De la comandă la livrare'],
          ['100% România', 'Produs și livrat local'],
          ['Garanție 5 ani', 'Pe structura carcasei'],
        ].map(([title, sub]) => (
          <div key={title} style={{ textAlign: 'center' }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{title}</div>
            <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>{sub}</div>
          </div>
        ))}
      </section>
    </main>
  );
}
