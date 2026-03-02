'use client';

import React, { useEffect, useState, Suspense, lazy } from 'react';

const ThreeViewer = lazy(() => import('./ThreeViewer'));

interface Material { id: string; name: string; color: string; roughness: number; metalness: number; }
interface SeedItem {
    name: string;
    defaultDimensions: { width: number; height: number; depth: number };
    constraints: Record<string, { min: number; max: number; step: number }>;
    materials: Material[];
    interiorOptions: { id: string; name: string }[];
    doorStyles: { id: string; name: string }[];
    pricePerM2: number;
    laborBase: number;
    currency: string;
}

/* Tylko uses preset chips, not continuous sliders */
const WIDTH_PRESETS = [600, 750, 900, 1050, 1200, 1500];
const HEIGHT_PRESETS = [1800, 2000, 2100, 2400];
const DEPTH_PRESETS = [450, 500, 550, 600];

export default function FurnitureViewer() {
    const [mounted, setMounted] = useState(false);
    const [seed, setSeed] = useState<SeedItem | null>(null);
    const [tab, setTab] = useState<'form' | 'function'>('form');

    const [width, setWidth] = useState(900);
    const [height, setHeight] = useState(2100);
    const [depth, setDepth] = useState(600);
    const [activeMat, setActiveMat] = useState<Material | null>(null);
    const [interiorMat, setInteriorMat] = useState<Material | null>(null);
    const [door, setDoor] = useState('full-overlay');
    const [lighting, setLighting] = useState<'none' | 'internal'>('none');
    const [price, setPrice] = useState(0);
    const [nestingEff, setNestingEff] = useState<number | null>(null);
    const [shelfWarn, setShelfWarn] = useState<string | null>(null);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        fetch('/models/dulap-seed.json')
            .then(r => r.json())
            .then((data: SeedItem[]) => {
                const d = data[0];
                setSeed(d);
                setActiveMat(d.materials[0]);
                setInteriorMat(d.materials[2]); // oak interior by default
            });
    }, []);

    useEffect(() => {
        if (!seed) return;
        const base = seed.pricePerM2;
        const est = Math.round((width / 1000) * (height / 1000) * base + seed.laborBase + (lighting === 'internal' ? 180 : 0));
        setPrice(est);
        // Fetch engineering data
        fetch(`/api/bom?w=${width}&h=${height}&d=${depth}`)
            .then(r => r.json())
            .then((d: { nestingEfficiency?: number; engineering?: { shelfWarning?: string | null } }) => {
                setNestingEff(d.nestingEfficiency ?? null);
                setShelfWarn(d.engineering?.shelfWarning ?? null);
            })
            .catch(() => null);
    }, [width, height, depth, seed, lighting]);

    if (!mounted || !seed || !activeMat || !interiorMat) {
        return (
            <div style={{ width: '100vw', height: '100vh', background: '#EAE6DF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 28, height: 28, border: '2px solid #ccc', borderTopColor: '#1A1A1A', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const S: Record<string, React.CSSProperties> = {
        wrap: { position: 'relative', width: '100vw', height: '100vh', background: '#EAE6DF', overflow: 'hidden' },
        canvas: { position: 'absolute', inset: 0 },

        /* ── Floating panel ── */
        panel: {
            position: 'absolute', top: 20, right: 20,
            width: 320, maxHeight: 'calc(100vh - 40px)',
            background: '#fff', borderRadius: 12,
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            overflowY: 'auto', display: 'flex', flexDirection: 'column',
        },

        /* Price header */
        priceBar: { padding: '18px 20px 12px', borderBottom: '1px solid #F0ECE7' },
        priceMain: { fontSize: 30, fontWeight: 700, letterSpacing: '-0.5px', color: '#1A1A1A' },
        priceCur: { fontSize: 14, fontWeight: 500, color: '#888', marginLeft: 4 },
        priceOld: { fontSize: 13, color: '#aaa', textDecoration: 'line-through', marginBottom: 2 },

        /* Tabs */
        tabs: { display: 'flex', borderBottom: '1px solid #F0ECE7' },
        tab: { flex: 1, padding: '10px 0', textAlign: 'center', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#999', border: 'none', background: 'none', borderBottom: '2px solid transparent', transition: 'all 0.15s' },
        tabActive: { color: '#1A1A1A', borderBottomColor: '#1A1A1A' },

        /* Section rows */
        body: { padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 14 },
        rowLabel: { fontSize: 11, fontWeight: 600, letterSpacing: 0.8, color: '#888', textTransform: 'uppercase' as const, marginBottom: 6 },
        chipRow: { display: 'flex', flexWrap: 'wrap' as const, gap: 6 },
        chip: { padding: '5px 14px', borderRadius: 100, border: '1.5px solid #E2DDD6', fontSize: 12, fontWeight: 500, cursor: 'pointer', color: '#1A1A1A', background: '#fff', transition: 'all 0.15s', whiteSpace: 'nowrap' as const },
        chipOn: { background: '#E8472C', borderColor: '#E8472C', color: '#fff' },

        /* Swatches */
        swatchRow: { display: 'flex', flexWrap: 'wrap' as const, gap: 6 },
        swatch: { width: 24, height: 24, borderRadius: '50%', cursor: 'pointer', border: '2px solid transparent', outline: '2px solid transparent', outlineOffset: 2, transition: 'all 0.15s' },
        swatchOn: { outline: '2px solid #1A1A1A' },

        /* CTA */
        ctaArea: { padding: '14px 20px 18px', borderTop: '1px solid #F0ECE7', display: 'flex', flexDirection: 'column', gap: 8 },
        btnPri: { width: '100%', padding: '13px', background: '#E8472C', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.5 },
        btnSec: { width: '100%', padding: '10px', background: 'transparent', color: '#1A1A1A', border: '1.5px solid #E2DDD6', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' },

        /* Badges */
        dimBadge: { position: 'absolute', bottom: 24, left: 24, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', padding: '6px 14px', borderRadius: 100, fontSize: 11, fontWeight: 600, color: '#555', letterSpacing: 0.3, border: '1px solid rgba(0,0,0,0.08)' },
        warnBox: { position: 'absolute', top: 20, left: 20, background: '#FFF8EE', border: '1px solid #F0C060', borderRadius: 8, padding: '10px 14px', fontSize: 11, color: '#8A6020', maxWidth: 280 },
        nestBox: { position: 'absolute', bottom: 24, right: 360, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', padding: '6px 14px', borderRadius: 100, fontSize: 11, fontWeight: 600, color: '#555', border: '1px solid rgba(0,0,0,0.08)', display: 'flex', gap: 8, alignItems: 'center' },
    };

    const chip = (active: boolean) => ({ ...S.chip, ...(active ? S.chipOn : {}) });
    const swatch = (active: boolean) => ({ ...S.swatch, ...(active ? S.swatchOn : {}) });

    return (
        <div style={S.wrap}>
            {/* 3D Canvas */}
            <div style={S.canvas}>
                <Suspense fallback={null}>
                    <ThreeViewer
                        materialColor={activeMat.color}
                        roughness={activeMat.roughness}
                        metalness={activeMat.metalness}
                        width={width}
                        height={height}
                        depth={depth}
                    />
                </Suspense>
            </div>

            {/* Dimension badge */}
            <div style={S.dimBadge}>{width} × {height} × {depth} mm</div>

            {/* Nesting efficiency badge */}
            {nestingEff !== null && (
                <div style={S.nestBox}>
                    <span>PAL</span>
                    <div style={{ width: 60, height: 3, background: '#ddd', borderRadius: 2 }}>
                        <div style={{ height: '100%', width: `${nestingEff}%`, background: nestingEff > 70 ? '#2D7D4F' : '#B8842E', borderRadius: 2 }} />
                    </div>
                    <span style={{ color: nestingEff > 70 ? '#2D7D4F' : '#B8842E' }}>{nestingEff}%</span>
                </div>
            )}

            {/* Shelf warning */}
            {shelfWarn && <div style={S.warnBox}>{shelfWarn}</div>}

            {/* ── FLOATING PANEL ── */}
            <div style={S.panel} className="fade-in">

                {/* Price */}
                <div style={S.priceBar}>
                    <div style={S.priceOld}>{Math.round(price * 1.36).toLocaleString('ro-RO')} {seed.currency}</div>
                    <div>
                        <span style={S.priceMain}>{price.toLocaleString('ro-RO')}</span>
                        <span style={S.priceCur}>{seed.currency}</span>
                    </div>
                    <div style={{ fontSize: 10, color: '#aaa', marginTop: 4 }}>Cel mai mic preț în ultimele 30 de zile</div>
                </div>

                {/* Form / Function tabs */}
                <div style={S.tabs}>
                    {(['form', 'function'] as const).map(t => (
                        <button key={t} style={{ ...S.tab, ...(tab === t ? S.tabActive : {}) }} onClick={() => setTab(t)}>
                            {t === 'form' ? 'Formă' : 'Funcție'}
                        </button>
                    ))}
                </div>

                <div style={S.body}>
                    {/* LĂȚIME */}
                    <div>
                        <div style={S.rowLabel}>Lățime</div>
                        <div style={S.chipRow}>
                            {WIDTH_PRESETS.filter(w => w >= seed.constraints.width.min && w <= seed.constraints.width.max).map(w => (
                                <div key={w} style={chip(width === w)} onClick={() => setWidth(w)}>{w / 10} cm</div>
                            ))}
                        </div>
                    </div>

                    {/* ÎNĂLȚIME */}
                    <div>
                        <div style={S.rowLabel}>Înălțime</div>
                        <div style={S.chipRow}>
                            {HEIGHT_PRESETS.filter(h => h >= seed.constraints.height.min && h <= seed.constraints.height.max).map(h => (
                                <div key={h} style={chip(height === h)} onClick={() => setHeight(h)}>{h / 10} cm</div>
                            ))}
                        </div>
                    </div>

                    {/* ADÂNCIME */}
                    <div>
                        <div style={S.rowLabel}>Adâncime</div>
                        <div style={S.chipRow}>
                            {DEPTH_PRESETS.filter(d => d >= seed.constraints.depth.min && d <= seed.constraints.depth.max).map(d => (
                                <div key={d} style={chip(depth === d)} onClick={() => setDepth(d)}>{d / 10} cm</div>
                            ))}
                        </div>
                    </div>

                    {/* ILUMINARE */}
                    <div>
                        <div style={S.rowLabel}>Iluminare</div>
                        <div style={S.chipRow}>
                            {([['none', 'Fără'], ['internal', 'Internă']] as const).map(([val, lbl]) => (
                                <div key={val} style={chip(lighting === val)} onClick={() => setLighting(val)}>{lbl}</div>
                            ))}
                        </div>
                    </div>

                    {/* EXTERIOR color */}
                    <div>
                        <div style={S.rowLabel}>Exterior</div>
                        <div style={S.swatchRow}>
                            {seed.materials.map(m => (
                                <div
                                    key={m.id}
                                    style={{ ...swatch(activeMat.id === m.id), background: m.color, boxShadow: m.color === '#FFFFFF' ? 'inset 0 0 0 1px #ddd' : 'none' }}
                                    onClick={() => setActiveMat(m)}
                                    title={m.name}
                                />
                            ))}
                        </div>
                    </div>

                    {/* INTERIOR color */}
                    <div>
                        <div style={S.rowLabel}>Interior</div>
                        <div style={S.swatchRow}>
                            {seed.materials.map(m => (
                                <div
                                    key={m.id}
                                    style={{ ...swatch(interiorMat.id === m.id), background: m.color, boxShadow: m.color === '#FFFFFF' ? 'inset 0 0 0 1px #ddd' : 'none' }}
                                    onClick={() => setInteriorMat(m)}
                                    title={m.name}
                                />
                            ))}
                        </div>
                        <div style={{ fontSize: 10, color: '#E8472C', marginTop: 8, cursor: 'pointer' }}>Nu te decizi? Comandă mostre →</div>
                    </div>
                </div>

                {/* CTA */}
                <div style={S.ctaArea}>
                    <button style={S.btnPri} onClick={() => window.open(`/api/cnc-export?w=${width}&h=${height}&d=${depth}`, '_blank')}>
                        Comandă producție
                    </button>
                    <button style={S.btnSec} onClick={() => window.open(`/api/bom?w=${width}&h=${height}&d=${depth}`, '_blank')}>
                        ♡ Salvează configurația
                    </button>
                    <div style={{ fontSize: 10, color: '#aaa', textAlign: 'center', lineHeight: 1.6 }}>
                        Fabricat în 6-9 săptămâni · Produs industrial CNC · Livrat asamblat
                    </div>
                </div>
            </div>
        </div>
    );
}
