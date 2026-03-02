'use client';

import React, { useEffect, useState, Suspense, lazy } from 'react';

const ThreeViewer = lazy(() => import('./ThreeViewer'));

interface Material { id: string; name: string; color: string; roughness: number; metalness: number; }
interface SeedItem {
    name: string;
    materials: Material[];
    interiorOptions: { id: string; name: string }[];
    currency: string;
    pricePerM2: number;
    laborBase: number;
}

const WIDTH_PRESETS = [900, 1800, 2700, 3600];
const HEIGHT_PRESETS = [1800, 2000, 2100, 2400];
const DEPTH_PRESETS = [450, 500, 550, 600];
const cm = (mm: number) => `${mm / 10} cm`;

const INTERIOR_COLORS = [
    { id: 'w', color: '#F5F0EB', label: 'Bej' },
    { id: 's', color: '#E8A898', label: 'Salmon' },
    { id: 'sg', color: '#98B498', label: 'Sage' },
    { id: 'g', color: '#555555', label: 'Grafit' },
    { id: 'n', color: '#C4956A', label: 'Nuc' },
    { id: 'nv', color: '#3A4E6A', label: 'Navy' },
];

const CONFIG_ICONS = [
    { id: 'open', icon: '□', label: 'Deschis' },
    { id: 'shelves', icon: '☰', label: 'Polițe' },
    { id: 'drawers', icon: '≡', label: 'Sertare' },
    { id: 'rail', icon: '⌶', label: 'Șina' },
    { id: 'mixed', icon: '⊟', label: 'Mixt' },
];

export default function FurnitureViewer() {
    const [mounted, setMounted] = useState(false);
    const [seed, setSeed] = useState<SeedItem | null>(null);
    const [tab, setTab] = useState<'form' | 'function'>('form');
    const [width, setWidth] = useState(900);
    const [height, setHeight] = useState(2100);
    const [depth, setDepth] = useState(600);
    const [extMat, setExtMat] = useState<Material | null>(null);
    const [intColor, setIntColor] = useState(INTERIOR_COLORS[0]);
    const [lighting, setLighting] = useState<'none' | 'internal'>('none');
    const [configIcon, setConfigIcon] = useState('shelves');
    const [price, setPrice] = useState(0);
    const [priceOld, setPriceOld] = useState(0);
    const [nestingEff, setNestingEff] = useState<number | null>(null);
    const [shelfWarn, setShelfWarn] = useState<string | null>(null);
    const [ordering, setOrdering] = useState(false);
    const [orderCode, setOrderCode] = useState<string | null>(null);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        fetch('/models/dulap-seed.json').then(r => r.json()).then((d: SeedItem[]) => {
            setSeed(d[0]);
            setExtMat(d[0].materials[0]);
        });
    }, []);

    useEffect(() => {
        if (!mounted) return;
        fetch(`/api/pricing?w=${width}&h=${height}&d=${depth}&light=${lighting === 'internal' ? 1 : 0}`)
            .then(r => r.json()).then((d: { totalRON?: number; priceOldRON?: number }) => {
                if (d.totalRON) setPrice(d.totalRON);
                if (d.priceOldRON) setPriceOld(d.priceOldRON);
            }).catch(() => null);
        fetch(`/api/bom?w=${width}&h=${height}&d=${depth}`)
            .then(r => r.json()).then((d: { nestingEfficiency?: number; engineering?: { shelfWarning?: string | null } }) => {
                setNestingEff(d.nestingEfficiency ?? null);
                setShelfWarn(d.engineering?.shelfWarning ?? null);
            }).catch(() => null);
    }, [width, height, depth, lighting, mounted]);

    const moduleCount = Math.max(1, Math.round(width / 900));

    async function handleOrder() {
        if (ordering || !extMat) return;
        setOrdering(true);
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ width, height, depth, exteriorColor: extMat.color, interiorColor: intColor.color, lighting, moduleCount }),
            });
            const data: { ok?: boolean; orderCode?: string } = await res.json();
            if (data.ok) setOrderCode(data.orderCode ?? 'KAGU-???');
        } finally {
            setOrdering(false);
        }
    }

    if (!mounted || !seed || !extMat) {
        return (
            <div style={{ width: '100vw', height: '100vh', background: '#E8E4DC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter,sans-serif' }}>
                <div style={{ width: 26, height: 26, border: '2px solid #ccc', borderTopColor: '#333', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    const chip = (active: boolean): React.CSSProperties => ({
        padding: '5px 13px', borderRadius: 100,
        border: `1.5px solid ${active ? '#E8472C' : '#E0DBD4'}`,
        fontSize: 12, fontWeight: 500, cursor: 'pointer',
        color: active ? '#fff' : '#1A1A1A',
        background: active ? '#E8472C' : '#fff',
        transition: 'all 0.14s', whiteSpace: 'nowrap',
    });

    const sw = (active: boolean, color: string): React.CSSProperties => ({
        width: 24, height: 24, borderRadius: '50%', background: color, cursor: 'pointer',
        outline: active ? '2.5px solid #1A1A1A' : 'none', outlineOffset: 2,
        border: '2px solid transparent', transition: 'all 0.14s',
        boxShadow: (color === '#FFFFFF' || color === '#F5F0EB') ? 'inset 0 0 0 1px #ddd' : 'none',
    });

    const ROW: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 5 };
    const LBL: React.CSSProperties = { fontSize: 10, fontWeight: 700, letterSpacing: 1, color: '#999', textTransform: 'uppercase', marginBottom: 6 };

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#E8E4DC', overflow: 'hidden', fontFamily: 'Inter,system-ui,sans-serif' }}>

            {/* 3D Canvas — silhouette is INSIDE the scene */}
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

            {/* Dimension badge */}
            <div style={{ position: 'absolute', bottom: 18, left: 18, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(6px)', padding: '5px 14px', borderRadius: 100, fontSize: 11, fontWeight: 600, color: '#555', border: '1px solid rgba(0,0,0,0.07)', userSelect: 'none' }}>
                {width} × {height} × {depth} mm &nbsp;·&nbsp; {moduleCount} {moduleCount === 1 ? 'modul' : 'module'}
            </div>

            {/* Shelf warning */}
            {shelfWarn && (
                <div style={{ position: 'absolute', top: 14, left: 14, background: '#FFF8EE', border: '1px solid #F0C060', borderRadius: 7, padding: '8px 12px', fontSize: 11, color: '#7A5010', maxWidth: 260 }}>
                    {shelfWarn}
                </div>
            )}

            {/* Order success confirmation */}
            {orderCode && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: 14, padding: '32px 40px', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', textAlign: 'center', zIndex: 200 }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: '#1A1A1A' }}>Comandă plasată!</div>
                    <div style={{ fontSize: 13, color: '#888', marginTop: 8 }}>Cod: <strong>{orderCode}</strong></div>
                    <div style={{ fontSize: 12, color: '#aaa', marginTop: 6 }}>Vei fi contactat de echipa noastră în scurt timp.</div>
                    <button onClick={() => setOrderCode(null)} style={{ marginTop: 20, padding: '10px 24px', background: '#E8472C', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                        Continuă configurarea
                    </button>
                </div>
            )}

            {/* ─── FLOATING PANEL ─── */}
            <div style={{ position: 'absolute', top: 14, right: 14, width: 310, maxHeight: 'calc(100vh - 28px)', background: '#fff', borderRadius: 10, boxShadow: '0 4px 28px rgba(0,0,0,0.12)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

                {/* Price */}
                <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid #F0ECE7' }}>
                    {priceOld > 0 && (
                        <div style={{ display: 'flex', gap: 7, alignItems: 'baseline' }}>
                            <span style={{ fontSize: 11, color: '#bbb', textDecoration: 'line-through' }}>{priceOld.toLocaleString('ro-RO')} RON</span>
                            <span style={{ fontSize: 10, color: '#E8472C', fontWeight: 700 }}>-{Math.round((1 - price / priceOld) * 100)}%</span>
                        </div>
                    )}
                    <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px' }}>{price.toLocaleString('ro-RO')} <span style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>RON</span></div>
                    <div style={{ fontSize: 10, color: '#bbb', marginTop: 2 }}>Cel mai mic preț în ultimele 30 de zile</div>
                </div>

                {/* Config icon strip */}
                <div style={{ display: 'flex', gap: 4, padding: '8px 14px', borderBottom: '1px solid #F0ECE7', overflowX: 'auto' }}>
                    {CONFIG_ICONS.map(t => (
                        <div key={t.id} onClick={() => setConfigIcon(t.id)} style={{
                            flex: '0 0 auto', width: 46, height: 50, border: `2px solid ${configIcon === t.id ? '#E8472C' : '#E0DBD4'}`,
                            borderRadius: 6, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                            background: configIcon === t.id ? '#FFF4F2' : '#fff', transition: 'all 0.14s',
                        }}>
                            <span style={{ fontSize: 16, color: configIcon === t.id ? '#E8472C' : '#aaa' }}>{t.icon}</span>
                            <span style={{ fontSize: 8, fontWeight: 700, color: '#bbb', letterSpacing: 0.3 }}>{t.label}</span>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid #F0ECE7' }}>
                    {(['form', 'function'] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)} style={{
                            flex: 1, padding: '9px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', background: 'none',
                            color: tab === t ? '#1A1A1A' : '#aaa',
                            borderBottom: `2px solid ${tab === t ? '#1A1A1A' : 'transparent'}`,
                            transition: 'all 0.14s',
                        }}>
                            {t === 'form' ? 'Formă' : 'Funcție'}
                        </button>
                    ))}
                </div>

                {/* Controls */}
                <div style={{ padding: '10px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ background: '#F8F6F3', borderRadius: 6, padding: '7px 12px', fontSize: 12, color: '#666' }}>
                        <strong>Lățime coloană:</strong> 90 cm · {moduleCount} {moduleCount === 1 ? 'coloană' : 'coloane'} = {cm(width)}
                    </div>

                    <div><div style={LBL}>Lățime totală</div>
                        <div style={ROW}>{WIDTH_PRESETS.map(w => <div key={w} style={chip(width === w)} onClick={() => setWidth(w)}>{cm(w)}</div>)}</div>
                    </div>

                    <div><div style={LBL}>Înălțime</div>
                        <div style={ROW}>{HEIGHT_PRESETS.map(h => <div key={h} style={chip(height === h)} onClick={() => setHeight(h)}>{cm(h)}</div>)}</div>
                    </div>

                    <div><div style={LBL}>Adâncime</div>
                        <div style={ROW}>{DEPTH_PRESETS.map(d => <div key={d} style={chip(depth === d)} onClick={() => setDepth(d)}>{cm(d)}</div>)}</div>
                    </div>

                    <div><div style={LBL}>Iluminare</div>
                        <div style={ROW}>
                            {([['none', 'Fără'], ['internal', 'Internă']] as const).map(([v, l]) => <div key={v} style={chip(lighting === v)} onClick={() => setLighting(v)}>{l}</div>)}
                        </div>
                    </div>

                    <div><div style={LBL}>Exterior</div>
                        <div style={ROW}>{seed.materials.map(m => <div key={m.id} style={sw(extMat.id === m.id, m.color)} onClick={() => setExtMat(m)} title={m.name} />)}</div>
                    </div>

                    <div><div style={LBL}>Interior</div>
                        <div style={ROW}>{INTERIOR_COLORS.map(c => <div key={c.id} style={sw(intColor.id === c.id, c.color)} onClick={() => setIntColor(c)} title={c.label} />)}</div>
                        <div style={{ fontSize: 10, color: '#E8472C', marginTop: 7, cursor: 'pointer' }}>Nu te decizi? Comandă mostre →</div>
                    </div>

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
                <div style={{ padding: '10px 18px 16px', borderTop: '1px solid #F0ECE7', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
                    <button
                        onClick={handleOrder}
                        disabled={ordering}
                        style={{ width: '100%', padding: '13px', background: ordering ? '#ccc' : '#E8472C', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: ordering ? 'not-allowed' : 'pointer', letterSpacing: 0.3, transition: 'background 0.2s' }}
                    >
                        {ordering ? 'Se procesează…' : 'Adaugă în coș'}
                    </button>
                    <button style={{ width: '100%', padding: '9px', background: 'transparent', color: '#1A1A1A', border: '1.5px solid #E0DBD4', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
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
