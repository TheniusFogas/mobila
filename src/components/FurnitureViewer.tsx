'use client';

import React, { useEffect, useState, Suspense, lazy } from 'react';

const ThreeViewer = lazy(() => import('./ThreeViewer'));

interface Material { id: string; name: string; color: string; roughness: number; metalness: number; }
interface SeedItem {
    name: string;
    defaultDimensions: { width: number; height: number; depth: number };
    materials: Material[];
    interiorOptions: { id: string; name: string }[];
    doorStyles: { id: string; name: string }[];
    pricePerM2: number;
    laborBase: number;
    currency: string;
}

const WIDTH_PRESETS = [900, 1800, 2700, 3600];
const HEIGHT_PRESETS = [1800, 2000, 2100, 2400];
const DEPTH_PRESETS = [450, 500, 550, 600];
const labelCm = (mm: number) => `${mm / 10} cm`;

// Thumbnail config previews (like Tylko's strip)
const CONFIG_THUMBS = [
    { id: 'open-1', label: '1 col', icon: '▐' },
    { id: 'shelves', label: 'Polițe', icon: '☰' },
    { id: 'drawers', label: 'Sertare', icon: '≡' },
    { id: 'rail', label: 'Șina', icon: '⌶' },
    { id: 'mixed', label: 'Mixt', icon: '⊟' },
];

// Interior colors that match Tylko's interior palette
const INTERIOR_COLORS = [
    { id: 'white-int', color: '#F5F0EB', label: 'Bej' },
    { id: 'salmon', color: '#E8A898', label: 'Salmon' },
    { id: 'sage-int', color: '#98B498', label: 'Sage' },
    { id: 'graphite-int', color: '#555', label: 'Grafit' },
    { id: 'wood-int', color: '#C4956A', label: 'Nuc' },
    { id: 'navy-int', color: '#3A4E6A', label: 'Bleumarin' },
];

export default function FurnitureViewer() {
    const [mounted, setMounted] = useState(false);
    const [seed, setSeed] = useState<SeedItem | null>(null);

    const [width, setWidth] = useState(900);
    const [height, setHeight] = useState(2100);
    const [depth, setDepth] = useState(600);
    const [extMat, setExtMat] = useState<Material | null>(null);
    const [intColor, setIntColor] = useState(INTERIOR_COLORS[0]);
    const [lighting, setLighting] = useState<'none' | 'internal'>('none');
    const [configThumb, setConfigThumb] = useState('shelves');

    const [price, setPrice] = useState(0);
    const [priceOld, setPriceOld] = useState(0);
    const [nestingEff, setNestingEff] = useState<number | null>(null);
    const [shelfWarn, setShelfWarn] = useState<string | null>(null);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        fetch('/models/dulap-seed.json')
            .then(r => r.json())
            .then((data: SeedItem[]) => { const d = data[0]; setSeed(d); setExtMat(d.materials[0]); });
    }, []);

    useEffect(() => {
        if (!mounted) return;
        fetch(`/api/pricing?w=${width}&h=${height}&d=${depth}&light=${lighting === 'internal' ? 1 : 0}`)
            .then(r => r.json())
            .then((d: { totalRON?: number; priceOldRON?: number }) => {
                if (d.totalRON) setPrice(d.totalRON);
                if (d.priceOldRON) setPriceOld(d.priceOldRON);
            }).catch(() => null);
        fetch(`/api/bom?w=${width}&h=${height}&d=${depth}`)
            .then(r => r.json())
            .then((d: { nestingEfficiency?: number; engineering?: { shelfWarning?: string | null } }) => {
                setNestingEff(d.nestingEfficiency ?? null);
                setShelfWarn(d.engineering?.shelfWarning ?? null);
            }).catch(() => null);
    }, [width, height, depth, lighting, mounted]);

    const moduleCount = Math.max(1, Math.round(width / 900));

    if (!mounted || !seed || !extMat) {
        return (
            <div style={{ width: '100vw', height: '100vh', background: '#E8E4DC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter,sans-serif' }}>
                <div style={{ width: 26, height: 26, border: '2px solid #ccc', borderTopColor: '#333', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    // Human scale: 1750mm person. Wardrobe takes ~65% of canvas height.
    const humanHeightVh = (1750 / height) * 58;

    const chip = (active: boolean): React.CSSProperties => ({
        padding: '5px 12px', borderRadius: 100,
        border: `1.5px solid ${active ? '#E8472C' : '#E0DBD4'}`,
        fontSize: 12, fontWeight: 500, cursor: 'pointer',
        color: active ? '#fff' : '#1A1A1A',
        background: active ? '#E8472C' : '#fff',
        transition: 'all 0.14s', whiteSpace: 'nowrap',
    });

    const swatch = (active: boolean, color: string): React.CSSProperties => ({
        width: 24, height: 24, borderRadius: '50%',
        background: color, cursor: 'pointer',
        border: `2px solid ${active ? '#1A1A1A' : 'transparent'}`,
        outline: active ? '2px solid #1A1A1A' : 'none',
        outlineOffset: 2,
        boxShadow: color === '#FFFFFF' || color === '#F5F0EB' ? 'inset 0 0 0 1px #ddd' : 'none',
        transition: 'all 0.14s',
    });

    const row: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 5 };
    const lbl: React.CSSProperties = { fontSize: 10, fontWeight: 700, letterSpacing: 1, color: '#999', textTransform: 'uppercase', marginBottom: 6 };

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#E8E4DC', overflow: 'hidden', fontFamily: 'Inter,system-ui,sans-serif' }}>

            {/* 3D Canvas */}
            <div style={{ position: 'absolute', inset: 0 }}>
                <Suspense fallback={null}>
                    <ThreeViewer
                        exteriorColor={extMat.color}
                        interiorColor={intColor.color}
                        roughness={extMat.roughness}
                        metalness={extMat.metalness}
                        width={width} height={height} depth={depth}
                    />
                </Suspense>
            </div>

            {/* Human silhouette — HTML overlay, proportional */}
            <img
                src="/models/human.png" alt=""
                style={{
                    position: 'absolute', bottom: '13%', left: '16%',
                    height: `${humanHeightVh}vh`, width: 'auto',
                    opacity: 0.25, filter: 'grayscale(1) contrast(0.8)',
                    pointerEvents: 'none', userSelect: 'none',
                }}
            />

            {/* Breadcrumb */}
            <div style={{ position: 'absolute', top: 16, left: 20, fontSize: 11, color: 'rgba(0,0,0,0.35)', fontWeight: 500 }}>
                Dulap în {extMat.name.toLowerCase()} cu {seed.interiorOptions[0]?.name.toLowerCase()} ···
            </div>

            {/* Dimension badge */}
            <div style={{ position: 'absolute', bottom: 18, left: 20, background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(6px)', padding: '5px 14px', borderRadius: 100, fontSize: 11, fontWeight: 600, color: '#555', border: '1px solid rgba(0,0,0,0.06)', userSelect: 'none' }}>
                {width} × {height} × {depth} mm &nbsp;·&nbsp; {moduleCount} {moduleCount === 1 ? 'modul' : 'module'}
            </div>

            {/* Shelf warning */}
            {shelfWarn && (
                <div style={{ position: 'absolute', top: 48, left: 20, background: '#FFF8EE', border: '1px solid #F0C060', borderRadius: 7, padding: '8px 12px', fontSize: 11, color: '#7A5010', maxWidth: 260 }}>
                    {shelfWarn}
                </div>
            )}

            {/* ─── FLOATING PANEL ─── */}
            <div style={{ position: 'absolute', top: 16, right: 16, width: 310, maxHeight: 'calc(100vh - 32px)', background: '#fff', borderRadius: 10, boxShadow: '0 4px 28px rgba(0,0,0,0.12)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

                {/* Price header */}
                <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid #F0ECE7' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                        {priceOld > 0 && <span style={{ fontSize: 11, color: '#bbb', textDecoration: 'line-through' }}>{priceOld.toLocaleString('ro-RO')} {seed.currency}</span>}
                        {priceOld > 0 && <span style={{ fontSize: 10, color: '#E8472C', fontWeight: 700 }}>-{Math.round((1 - price / priceOld) * 100)}%</span>}
                    </div>
                    <div><span style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px' }}>{price.toLocaleString('ro-RO')}</span><span style={{ fontSize: 12, color: '#888', marginLeft: 4 }}>{seed.currency}</span></div>
                    <div style={{ fontSize: 10, color: '#bbb', marginTop: 2 }}>Cel mai mic preț în ultimele 30 de zile</div>
                </div>

                {/* Config thumbnail strip — like Tylko */}
                <div style={{ display: 'flex', gap: 4, padding: '10px 18px 0', overflowX: 'auto' }}>
                    {CONFIG_THUMBS.map(t => (
                        <div
                            key={t.id}
                            onClick={() => setConfigThumb(t.id)}
                            style={{
                                flex: '0 0 auto', width: 46, height: 52,
                                border: `2px solid ${configThumb === t.id ? '#E8472C' : '#E0DBD4'}`,
                                borderRadius: 5, cursor: 'pointer', display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center', gap: 3, background: configThumb === t.id ? '#FFF4F2' : '#fff',
                                transition: 'all 0.14s',
                            }}
                        >
                            <span style={{ fontSize: 18, lineHeight: 1, color: configThumb === t.id ? '#E8472C' : '#888' }}>{t.icon}</span>
                            <span style={{ fontSize: 8, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.3 }}>{t.label}</span>
                        </div>
                    ))}
                </div>

                {/* Body */}
                <div style={{ padding: '10px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>

                    {/* Column width info */}
                    <div style={{ background: '#F9F7F5', borderRadius: 6, padding: '8px 12px', fontSize: 12, color: '#555' }}>
                        <span style={{ fontWeight: 600 }}>Lățime coloană:</span> 90 cm &nbsp;·&nbsp; {moduleCount} {moduleCount === 1 ? 'coloană' : 'coloane'} = {labelCm(width)}
                    </div>

                    {/* LĂȚIME TOTALĂ */}
                    <div>
                        <div style={lbl}>Lățime totală</div>
                        <div style={row}>
                            {WIDTH_PRESETS.map(w => <div key={w} style={chip(width === w)} onClick={() => setWidth(w)}>{labelCm(w)}</div>)}
                        </div>
                    </div>

                    {/* ÎNĂLȚIME */}
                    <div>
                        <div style={lbl}>Înălțime</div>
                        <div style={row}>
                            {HEIGHT_PRESETS.map(h => <div key={h} style={chip(height === h)} onClick={() => setHeight(h)}>{labelCm(h)}</div>)}
                        </div>
                    </div>

                    {/* ADÂNCIME */}
                    <div>
                        <div style={lbl}>Adâncime</div>
                        <div style={row}>
                            {DEPTH_PRESETS.map(d => <div key={d} style={chip(depth === d)} onClick={() => setDepth(d)}>{labelCm(d)}</div>)}
                        </div>
                    </div>

                    {/* ILUMINARE */}
                    <div>
                        <div style={lbl}>Iluminare</div>
                        <div style={row}>
                            {([['none', 'Fără'], ['internal', 'Internă']] as const).map(([v, l]) => <div key={v} style={chip(lighting === v)} onClick={() => setLighting(v)}>{l}</div>)}
                        </div>
                    </div>

                    {/* EXTERIOR */}
                    <div>
                        <div style={lbl}>Exterior</div>
                        <div style={row}>
                            {seed.materials.map(m => <div key={m.id} style={swatch(extMat.id === m.id, m.color)} onClick={() => setExtMat(m)} title={m.name} />)}
                        </div>
                    </div>

                    {/* INTERIOR */}
                    <div>
                        <div style={lbl}>Interior</div>
                        <div style={row}>
                            {INTERIOR_COLORS.map(c => <div key={c.id} style={swatch(intColor.id === c.id, c.color)} onClick={() => setIntColor(c)} title={c.label} />)}
                        </div>
                        <div style={{ fontSize: 10, color: '#E8472C', marginTop: 7, cursor: 'pointer' }}>Nu te decizi? Comandă mostre →</div>
                    </div>

                    {/* Nesting efficiency */}
                    {nestingEff !== null && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#888' }}>
                            <span>Eficiență PAL</span>
                            <div style={{ flex: 1, height: 2, background: '#eee', borderRadius: 2 }}>
                                <div style={{ height: '100%', width: `${nestingEff}%`, background: nestingEff > 70 ? '#2D7D4F' : '#B8842E', borderRadius: 2, transition: 'width 0.4s' }} />
                            </div>
                            <span style={{ fontWeight: 700, color: nestingEff > 70 ? '#2D7D4F' : '#B8842E' }}>{nestingEff}%</span>
                        </div>
                    )}
                </div>

                {/* CTA */}
                <div style={{ padding: '10px 18px 16px', borderTop: '1px solid #F0ECE7', display: 'flex', flexDirection: 'column', gap: 7, marginTop: 'auto' }}>
                    <button
                        style={{ width: '100%', padding: '13px', background: '#E8472C', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.3 }}
                        onClick={() => window.open(`/api/cnc-export?w=${width}&h=${height}&d=${depth}`, '_blank')}
                    >
                        Comandă producție
                    </button>
                    <button
                        style={{ width: '100%', padding: '9px', background: 'transparent', color: '#1A1A1A', border: '1.5px solid #E0DBD4', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                        onClick={() => window.open(`/api/bom?w=${width}&h=${height}&d=${depth}`, '_blank')}
                    >
                        ♡ Salvează configurația
                    </button>
                    <div style={{ fontSize: 10, color: '#bbb', textAlign: 'center', lineHeight: 1.6 }}>
                        Livrat în 6–9 săptămâni · CNC industrial · {moduleCount} {moduleCount === 1 ? 'modul' : 'module'}
                    </div>
                </div>
            </div>
        </div>
    );
}
