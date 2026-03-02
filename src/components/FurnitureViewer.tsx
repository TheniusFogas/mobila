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

// Width: 1–4 modules × 90cm = 90, 180, 270, 360cm
const WIDTH_PRESETS = [900, 1800, 2700, 3600]; // mm
const HEIGHT_PRESETS = [1800, 2000, 2100, 2400]; // mm
const DEPTH_PRESETS = [450, 500, 550, 600];      // mm

function labelCm(mm: number) { return `${mm / 10} cm`; }

export default function FurnitureViewer() {
    const [mounted, setMounted] = useState(false);
    const [seed, setSeed] = useState<SeedItem | null>(null);
    const [tab, setTab] = useState<'form' | 'function'>('form');

    const [width, setWidth] = useState(900);
    const [height, setHeight] = useState(2100);
    const [depth, setDepth] = useState(600);
    const [activeMat, setActiveMat] = useState<Material | null>(null);
    const [interiorMat, setInteriorMat] = useState<Material | null>(null);
    const [lighting, setLighting] = useState<'none' | 'internal'>('none');
    const [price, setPrice] = useState(0);
    const [priceOld, setPriceOld] = useState(0);
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
                setInteriorMat(d.materials[2]);
            });
    }, []);

    useEffect(() => {
        if (!mounted) return;
        fetch(`/api/pricing?w=${width}&h=${height}&d=${depth}&light=${lighting === 'internal' ? 1 : 0}`)
            .then(r => r.json())
            .then((d: { totalRON?: number; priceOldRON?: number; nestingEfficiency?: number; engineering?: { shelfWarning?: string | null } }) => {
                if (d.totalRON) setPrice(d.totalRON);
                if (d.priceOldRON) setPriceOld(d.priceOldRON);
            })
            .catch(() => null);
        fetch(`/api/bom?w=${width}&h=${height}&d=${depth}`)
            .then(r => r.json())
            .then((d: { nestingEfficiency?: number; engineering?: { shelfWarning?: string | null } }) => {
                setNestingEff(d.nestingEfficiency ?? null);
                setShelfWarn(d.engineering?.shelfWarning ?? null);
            })
            .catch(() => null);
    }, [width, height, depth, lighting, mounted]);

    const moduleCount = Math.max(1, Math.round(width / 900));

    if (!mounted || !seed || !activeMat || !interiorMat) {
        return (
            <div style={{ width: '100vw', height: '100vh', background: '#EAE6DF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
                <div style={{ width: 28, height: 28, border: '2px solid #ccc', borderTopColor: '#1A1A1A', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const S: Record<string, React.CSSProperties> = {
        wrap: { position: 'relative', width: '100vw', height: '100vh', background: '#EAE6DF', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif' },
        canvas: { position: 'absolute', inset: 0 },

        /* Human silhouette overlay — 1.75m person, positioned left of center */
        human: {
            position: 'absolute',
            /* Height: figure is 1.75m, wardrobe is `height` mm.
               In a 100vh viewport the wardrobe occupies roughly 70% of the height.
               So 1.75 / (height/1000) * 70% of viewport */
            height: `${(1750 / height) * 62}vh`,
            width: 'auto',
            bottom: '14%',
            left: '18%',
            opacity: 0.45,
            filter: 'grayscale(1)',
            userSelect: 'none',
            pointerEvents: 'none',
        },

        /* Compact floating panel */
        panel: {
            position: 'absolute', top: 20, right: 20,
            width: 310, maxHeight: 'calc(100vh - 40px)',
            background: '#fff', borderRadius: 10,
            boxShadow: '0 4px 24px rgba(0,0,0,0.11)',
            overflowY: 'auto', display: 'flex', flexDirection: 'column',
        },

        priceBar: { padding: '16px 20px 12px', borderBottom: '1px solid #F0ECE7' },
        priceOld: { fontSize: 12, color: '#aaa', textDecoration: 'line-through', marginBottom: 2 },
        priceMain: { fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', color: '#1A1A1A' },
        priceCur: { fontSize: 13, fontWeight: 500, color: '#888', marginLeft: 4 },
        priceNote: { fontSize: 10, color: '#bbb', marginTop: 3 },
        moduleBadge: { display: 'inline-block', marginTop: 6, background: '#F0ECE7', borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 600, color: '#666' },

        tabs: { display: 'flex', borderBottom: '1px solid #F0ECE7' },
        tab: { flex: 1, padding: '9px 0', textAlign: 'center', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#aaa', border: 'none', background: 'none', borderBottom: '2px solid transparent', transition: 'all 0.15s' },
        tabA: { color: '#1A1A1A', borderBottomColor: '#1A1A1A' },

        body: { padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 12 },
        lbl: { fontSize: 10, fontWeight: 700, letterSpacing: 1, color: '#999', textTransform: 'uppercase' as const, marginBottom: 5 },

        chips: { display: 'flex', flexWrap: 'wrap' as const, gap: 5 },
        chip: { padding: '5px 12px', borderRadius: 100, border: '1.5px solid #E2DDD6', fontSize: 12, fontWeight: 500, cursor: 'pointer', color: '#1A1A1A', background: '#fff', transition: 'all 0.15s', whiteSpace: 'nowrap' as const },
        chipA: { background: '#E8472C', borderColor: '#E8472C', color: '#fff' },

        sr: { display: 'flex', flexWrap: 'wrap' as const, gap: 6 },
        sw: { width: 22, height: 22, borderRadius: '50%', cursor: 'pointer', border: '2px solid transparent', outline: '2px solid transparent', outlineOffset: 2, transition: 'all 0.15s' },
        swA: { outline: '2px solid #1A1A1A' },
        link: { fontSize: 10, color: '#E8472C', marginTop: 6, cursor: 'pointer' },

        cta: { padding: '12px 20px 16px', borderTop: '1px solid #F0ECE7', display: 'flex', flexDirection: 'column', gap: 7 },
        btnP: { width: '100%', padding: '13px', background: '#E8472C', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: 'pointer' },
        btnS: { width: '100%', padding: '9px', background: 'transparent', color: '#1A1A1A', border: '1.5px solid #E2DDD6', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
        note: { fontSize: 10, color: '#bbb', textAlign: 'center' as const, lineHeight: 1.6 },

        dimBadge: { position: 'absolute', bottom: 22, left: 22, background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(8px)', padding: '5px 14px', borderRadius: 100, fontSize: 11, fontWeight: 600, color: '#555', border: '1px solid rgba(0,0,0,0.07)', userSelect: 'none' as const },
        warnBox: { position: 'absolute', top: 20, left: 20, background: '#FFF8EE', border: '1px solid #F0C060', borderRadius: 7, padding: '9px 12px', fontSize: 11, color: '#8A6020', maxWidth: 260 },
    };

    const chipStyle = (active: boolean) => ({ ...S.chip, ...(active ? S.chipA : {}) });
    const swatchStyle = (active: boolean, color: string) => ({ ...S.sw, background: color, boxShadow: color === '#FFFFFF' ? 'inset 0 0 0 1px #ddd' : 'none', ...(active ? S.swA : {}) });

    return (
        <div style={S.wrap}>
            <div style={S.canvas}>
                <Suspense fallback={null}>
                    <ThreeViewer materialColor={activeMat.color} roughness={activeMat.roughness} metalness={activeMat.metalness} width={width} height={height} depth={depth} />
                </Suspense>
            </div>

            {/* Human silhouette — PNG overlay, proportional to selected height */}
            <img src="/models/human.png" alt="" style={S.human} />

            {/* Dimension badge */}
            <div style={S.dimBadge}>{width} × {height} × {depth} mm · {moduleCount} {moduleCount === 1 ? 'modul' : 'module'}</div>

            {/* Shelf warning */}
            {shelfWarn && <div style={S.warnBox}>{shelfWarn}</div>}

            {/* FLOATING PANEL */}
            <div style={S.panel}>

                {/* Price */}
                <div style={S.priceBar}>
                    {priceOld > 0 && <div style={S.priceOld}>{priceOld.toLocaleString('ro-RO')} {seed.currency}</div>}
                    <div><span style={S.priceMain}>{price.toLocaleString('ro-RO')}</span><span style={S.priceCur}>{seed.currency}</span></div>
                    <div style={S.priceNote}>Cel mai mic preț în ultimele 30 de zile</div>
                    <div style={S.moduleBadge}>{moduleCount} × modul 90cm{moduleCount > 1 ? ` = ${width / 10}cm` : ''}</div>
                </div>

                {/* Tabs */}
                <div style={S.tabs}>
                    {(['form', 'function'] as const).map(t => (
                        <button key={t} style={{ ...S.tab, ...(tab === t ? S.tabA : {}) }} onClick={() => setTab(t)}>
                            {t === 'form' ? 'Formă' : 'Funcție'}
                        </button>
                    ))}
                </div>

                <div style={S.body}>
                    {/* LĂȚIME — module count displayed */}
                    <div>
                        <div style={S.lbl}>Lățime totală</div>
                        <div style={S.chips}>
                            {WIDTH_PRESETS.map(w => (
                                <div key={w} style={chipStyle(width === w)} onClick={() => setWidth(w)}>
                                    {labelCm(w)}{w > 900 ? ` (${w / 900}×)` : ''}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ÎNĂLȚIME */}
                    <div>
                        <div style={S.lbl}>Înălțime</div>
                        <div style={S.chips}>
                            {HEIGHT_PRESETS.map(h => (
                                <div key={h} style={chipStyle(height === h)} onClick={() => setHeight(h)}>{labelCm(h)}</div>
                            ))}
                        </div>
                    </div>

                    {/* ADÂNCIME */}
                    <div>
                        <div style={S.lbl}>Adâncime</div>
                        <div style={S.chips}>
                            {DEPTH_PRESETS.map(d => (
                                <div key={d} style={chipStyle(depth === d)} onClick={() => setDepth(d)}>{labelCm(d)}</div>
                            ))}
                        </div>
                    </div>

                    {/* ILUMINARE */}
                    <div>
                        <div style={S.lbl}>Iluminare</div>
                        <div style={S.chips}>
                            {([['none', 'Fără'], ['internal', 'Internă']] as const).map(([v, l]) => (
                                <div key={v} style={chipStyle(lighting === v)} onClick={() => setLighting(v)}>{l}</div>
                            ))}
                        </div>
                    </div>

                    {/* EXTERIOR */}
                    <div>
                        <div style={S.lbl}>Exterior</div>
                        <div style={S.sr}>
                            {seed.materials.map(m => (
                                <div key={m.id} style={swatchStyle(activeMat.id === m.id, m.color)} onClick={() => setActiveMat(m)} title={m.name} />
                            ))}
                        </div>
                    </div>

                    {/* INTERIOR */}
                    <div>
                        <div style={S.lbl}>Interior</div>
                        <div style={S.sr}>
                            {seed.materials.map(m => (
                                <div key={m.id} style={swatchStyle(interiorMat.id === m.id, m.color)} onClick={() => setInteriorMat(m)} title={m.name} />
                            ))}
                        </div>
                        <div style={S.link}>Nu te decizi? Comandă mostre →</div>
                    </div>

                    {/* Nesting */}
                    {nestingEff !== null && (
                        <div style={{ fontSize: 11, color: '#888', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>Eficiență PAL</span>
                            <div style={{ flex: 1, height: 2, background: '#eee', borderRadius: 2 }}>
                                <div style={{ height: '100%', width: `${nestingEff}%`, background: nestingEff > 70 ? '#2D7D4F' : '#B8842E', borderRadius: 2, transition: 'width 0.4s' }} />
                            </div>
                            <span style={{ fontWeight: 700, color: nestingEff > 70 ? '#2D7D4F' : '#B8842E' }}>{nestingEff}%</span>
                        </div>
                    )}
                </div>

                {/* CTA */}
                <div style={S.cta}>
                    <button style={S.btnP} onClick={() => window.open(`/api/cnc-export?w=${width}&h=${height}&d=${depth}`, '_blank')}>
                        Comandă producție
                    </button>
                    <button style={S.btnS} onClick={() => window.open(`/api/bom?w=${width}&h=${height}&d=${depth}`, '_blank')}>
                        ♡ Salvează configurația
                    </button>
                    <div style={S.note}>Fabricat CNC · {moduleCount} {moduleCount === 1 ? 'modul' : 'module'} · Livrat asamblat</div>
                </div>
            </div>
        </div>
    );
}
