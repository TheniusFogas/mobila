'use client';

import React, { useEffect, useState, Suspense, lazy, useCallback } from 'react';
import type { ConfiguratorProps } from './ThreeViewer';

const ThreeViewer = lazy(() => import('./ThreeViewer'));

/* ─── Colours — from Tylko's palette ─── */
const COLOURS = [
    { id: 'birch', hex: '#E8DFC8', label: 'Birch Plywood' },
    { id: 'white', hex: '#F5F1EB', label: 'White' },
    { id: 'sand', hex: '#D4C8A8', label: 'Sand' },
    { id: 'grey', hex: '#9B9B9B', label: 'Grey' },
    { id: 'charcoal', hex: '#3D3D3D', label: 'Charcoal' },
    { id: 'black', hex: '#1A1A1A', label: 'Black' },
    { id: 'terracotta', hex: '#C4603A', label: 'Terracotta' },
    { id: 'sage', hex: '#7A9478', label: 'Sage' },
    { id: 'yellow', hex: '#E8C84A', label: 'Yellow Plywood' },
    { id: 'navy', hex: '#2A3E5E', label: 'Navy' },
];

const INT_COLOURS = [
    { id: 'natural', hex: '#E8DFD0', label: 'Natural' },
    { id: 'salmon', hex: '#E8A898', label: 'Salmon' },
    { id: 'sage-int', hex: '#98B498', label: 'Sage' },
    { id: 'grey-int', hex: '#555', label: 'Grey' },
];

type ColVariant = 'open' | 'shelves' | 'drawers' | 'door';

/* ─── Column variant SVG icons (Tylko schematic style) ─── */
const VARIANT_ICONS: Record<ColVariant, React.ReactNode> = {
    open: (
        <svg width="22" height="26" viewBox="0 0 24 28" fill="none">
            <rect x="1" y="1" width="22" height="26" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <line x1="12" y1="4" x2="12" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="12" y1="10" x2="12" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
    ),
    shelves: (
        <svg width="22" height="26" viewBox="0 0 24 28" fill="none">
            <rect x="1" y="1" width="22" height="26" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <line x1="4" y1="9" x2="20" y2="9" stroke="currentColor" strokeWidth="1.5" />
            <line x1="4" y1="15" x2="20" y2="15" stroke="currentColor" strokeWidth="1.5" />
            <line x1="4" y1="21" x2="20" y2="21" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),
    drawers: (
        <svg width="22" height="26" viewBox="0 0 24 28" fill="none">
            <rect x="1" y="1" width="22" height="26" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="4" y="5" width="16" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
            <rect x="4" y="12" width="16" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
            <rect x="4" y="19" width="16" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
            <line x1="10" y1="7.5" x2="14" y2="7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="10" y1="14.5" x2="14" y2="14.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="10" y1="21.5" x2="14" y2="21.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
    ),
    door: (
        <svg width="22" height="26" viewBox="0 0 24 28" fill="none">
            <rect x="1" y="1" width="22" height="26" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="3" y="3" width="18" height="22" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="18" cy="14" r="1.4" fill="currentColor" />
        </svg>
    ),
};

/* ─── Pill toggle: Off | On ─── */
function PillToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
        <div style={{ display: 'flex', border: '1px solid #DDD', borderRadius: 100, overflow: 'hidden', width: 'fit-content' }}>
            {(['Off', 'On'] as const).map(label => {
                const active = label === 'On' ? value : !value;
                return (
                    <button key={label} onClick={() => onChange(label === 'On')} style={{
                        padding: '5px 16px', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                        background: active ? '#1A1A1A' : '#fff', color: active ? '#fff' : '#888',
                        transition: 'all 0.15s',
                    }}>{label}</button>
                );
            })}
        </div>
    );
}

/* ─── Width slider ─── */
function WidthSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const MIN = 45, MAX = 360, STEP = 15; // cm
    const cm = value / 10;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => onChange(Math.max(MIN * 10, value - STEP * 10))} style={{ width: 28, height: 28, border: '1px solid #DDD', borderRadius: '50%', background: '#fff', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>−</button>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <input type="range" min={MIN} max={MAX} step={STEP} value={cm}
                    onChange={e => onChange(Number(e.target.value) * 10)}
                    style={{ width: '100%', accentColor: '#E8472C', cursor: 'pointer' }}
                />
            </div>
            <div style={{ minWidth: 48, textAlign: 'center', fontWeight: 700, fontSize: 14, color: '#1A1A1A' }}>{cm}cm</div>
            <button onClick={() => onChange(Math.min(MAX * 10, value + STEP * 10))} style={{ width: 28, height: 28, border: '1px solid #DDD', borderRadius: '50%', background: '#fff', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>+</button>
        </div>
    );
}

/* ─── Counter ─── */
function Counter({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#444' }}>{label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid #DDD', borderRadius: 4, overflow: 'hidden' }}>
                <button onClick={() => onChange(Math.max(min, value - 1))} style={{ width: 30, height: 28, border: 'none', background: '#fff', cursor: 'pointer', fontSize: 16, color: '#555' }}>−</button>
                <span style={{ padding: '0 10px', fontSize: 13, fontWeight: 700, borderLeft: '1px solid #DDD', borderRight: '1px solid #DDD', lineHeight: '28px' }}>{value}</span>
                <button onClick={() => onChange(Math.min(max, value + 1))} style={{ width: 30, height: 28, border: 'none', background: '#fff', cursor: 'pointer', fontSize: 16, color: '#555' }}>+</button>
            </div>
        </div>
    );
}

/* ─── Section label ─── */
const SL = ({ children }: { children: React.ReactNode }) => (
    <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>{children}</div>
);

/* ─── Tylko-style bottom canvas column icon bar ─── */
function BottomColumnBar({
    columns, variants, onVariantChange, visible,
}: {
    columns: number;
    variants: ColVariant[];
    onVariantChange: (i: number, v: ColVariant) => void;
    visible: boolean;
}) {
    const variantList: ColVariant[] = ['open', 'shelves', 'drawers', 'door'];

    return (
        <div style={{
            position: 'absolute',
            bottom: visible ? 20 : -200,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 10,
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(8px)',
            borderRadius: 14,
            boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
            padding: '10px 14px',
            zIndex: 50,
            transition: 'bottom 0.3s cubic-bezier(0.22,1,0.36,1)',
            maxWidth: 'calc(100vw - 340px)',
            overflowX: 'auto',
        }}>
            {Array.from({ length: columns }).map((_, colIdx) => {
                const activeVariant = variants[colIdx] ?? 'shelves';
                return (
                    <div key={colIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 44 }}>
                        {/* Column label */}
                        <div style={{ fontSize: 8, fontWeight: 700, color: '#aaa', letterSpacing: 0.5 }}>COL.{colIdx + 1}</div>
                        {/* Variant icons horizontal row */}
                        <div style={{ display: 'flex', gap: 3 }}>
                            {variantList.map(v => {
                                const active = activeVariant === v;
                                return (
                                    <button
                                        key={v}
                                        onClick={() => onVariantChange(colIdx, v)}
                                        title={v}
                                        style={{
                                            width: 36, height: 40,
                                            border: `1.5px solid ${active ? '#E8472C' : '#E0DBD4'}`,
                                            borderRadius: 7, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: active ? '#FFF4F2' : '#fff',
                                            color: active ? '#E8472C' : '#c0b8b0',
                                            transition: 'all 0.12s',
                                            padding: 0,
                                        }}
                                    >
                                        {VARIANT_ICONS[v]}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function FurnitureViewer() {
    const [mounted, setMounted] = useState(false);
    const [width, setWidth] = useState(900);
    const [height, setHeight] = useState(2100);
    const [depth, setDepth] = useState(600);
    const [columns, setColumns] = useState(1);
    const [backPanel, setBackPanel] = useState(true);
    const [extCol, setExtCol] = useState(COLOURS[0]);
    const [intCol, setIntCol] = useState(INT_COLOURS[0]);
    const [variants, setVariants] = useState<ColVariant[]>(['shelves']);
    const [price, setPrice] = useState(0);
    const [priceOld, setPriceOld] = useState(0);
    const [ordering, setOrdering] = useState(false);
    const [orderCode, setOrderCode] = useState<string | null>(null);
    const [editingCol, setEditingCol] = useState<number | null>(null);
    const [doorHinge, setDoorHinge] = useState<'left' | 'right'>('left');
    const [mobilePanel, setMobilePanel] = useState(false); // for mobile bottom sheet
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    // Detect mobile
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Keep variants array length in sync with columns
    useEffect(() => {
        setVariants(prev => {
            const next = [...prev];
            while (next.length < columns) next.push('shelves');
            return next.slice(0, columns);
        });
        setWidth(() => Math.min(3600, Math.max(450, columns * 900)));
    }, [columns]);

    useEffect(() => {
        if (!mounted) return;
        fetch(`/api/pricing?w=${width}&h=${height}&d=${depth}`)
            .then(r => r.json())
            .then((d: { totalRON?: number; priceOldRON?: number }) => {
                setPrice(d.totalRON || 0);
                setPriceOld(d.priceOldRON || 0);
            }).catch(() => null);
    }, [width, height, depth, mounted]);

    async function placeOrder() {
        if (ordering) return;
        setOrdering(true);
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ width, height, depth, exteriorColor: extCol.hex, interiorColor: intCol.hex, columns }),
            });
            const d: { ok?: boolean; orderCode?: string } = await res.json();
            if (d.ok) setOrderCode(d.orderCode ?? 'KAGU-???');
        } finally {
            setOrdering(false);
        }
    }

    const handleVariantChange = useCallback((colIdx: number, v: ColVariant) => {
        setVariants(prev => {
            const next = [...prev];
            next[colIdx] = v;
            return next;
        });
    }, []);

    if (!mounted) {
        return <div style={{ width: '100vw', height: '100vh', background: '#EDEBE6' }} />;
    }

    const viewerProps: ConfiguratorProps = {
        exteriorColor: extCol.hex,
        interiorColor: intCol.hex,
        width, height, depth, columns, backPanel,
        columnVariants: variants,
        onColumnEdit: (i) => setEditingCol(i),
    };

    /* ─── Right panel content (shared between desktop sidebar + mobile sheet) ─── */
    const panelContent = (
        <>
            {/* Price header */}
            <div style={{ padding: '18px 20px 12px', borderBottom: '1px solid #F0ECE7', flexShrink: 0 }}>
                {priceOld > 0 && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 2 }}>
                        <span style={{ fontSize: 12, color: '#aaa', textDecoration: 'line-through' }}>{priceOld.toLocaleString('ro-RO')} RON</span>
                        <span style={{ fontSize: 11, color: '#E8472C', fontWeight: 700, background: '#FFF0EE', borderRadius: 3, padding: '1px 5px' }}>-{Math.round((1 - price / priceOld) * 100)}%</span>
                    </div>
                )}
                <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                    {price > 0 ? `${price.toLocaleString('ro-RO')} RON` : '—'}
                </div>
                <div style={{ fontSize: 10, color: '#bbb', marginTop: 4 }}>Cel mai mic preț în ultimele 30 de zile</div>
            </div>

            {/* Controls */}
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 18, flex: 1, overflowY: 'auto' }}>
                {/* Width */}
                <div>
                    <SL>Lățime</SL>
                    <WidthSlider value={width} onChange={setWidth} />
                </div>

                {/* Height */}
                <div>
                    <SL>Înălțime — {height / 10} cm</SL>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {[1800, 2100, 2400].map(h => (
                            <button key={h} onClick={() => setHeight(h)} style={{
                                padding: '5px 12px', borderRadius: 100, border: `1.5px solid ${height === h ? '#E8472C' : '#E0DBD4'}`,
                                background: height === h ? '#E8472C' : '#fff', color: height === h ? '#fff' : '#555',
                                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            }}>{h / 10}cm</button>
                        ))}
                    </div>
                </div>

                {/* Depth */}
                <div>
                    <SL>Adâncime</SL>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {[450, 550, 600].map(d => (
                            <button key={d} onClick={() => setDepth(d)} style={{
                                padding: '5px 12px', borderRadius: 100, border: `1.5px solid ${depth === d ? '#E8472C' : '#E0DBD4'}`,
                                background: depth === d ? '#E8472C' : '#fff', color: depth === d ? '#fff' : '#555',
                                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            }}>{d / 10}cm</button>
                        ))}
                    </div>
                </div>

                {/* Storage columns */}
                <Counter label="Coloane de depozitare" value={columns} min={1} max={6} onChange={setColumns} />

                {/* Back panels */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: '#444' }}>Panou spate</span>
                    <PillToggle value={backPanel} onChange={setBackPanel} />
                </div>

                {/* Colour */}
                <div>
                    <SL>Culoare &nbsp;<span style={{ color: '#E8472C', cursor: 'pointer', fontWeight: 500 }}>Nu te decizi? Comandă mostre →</span></SL>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                        {COLOURS.map(c => (
                            <div key={c.id} title={c.label} onClick={() => setExtCol(c)} style={{
                                width: 26, height: 26, borderRadius: '50%', background: c.hex, cursor: 'pointer',
                                outline: extCol.id === c.id ? '2.5px solid #1A1A1A' : 'none',
                                outlineOffset: 2, border: '2px solid rgba(0,0,0,0.08)',
                                transition: 'outline 0.12s',
                            }} />
                        ))}
                    </div>
                </div>

                {/* Interior colour */}
                <div>
                    <SL>Interior</SL>
                    <div style={{ display: 'flex', gap: 7 }}>
                        {INT_COLOURS.map(c => (
                            <div key={c.id} title={c.label} onClick={() => setIntCol(c)} style={{
                                width: 26, height: 26, borderRadius: '50%', background: c.hex, cursor: 'pointer',
                                outline: intCol.id === c.id ? '2.5px solid #1A1A1A' : 'none',
                                outlineOffset: 2, border: '2px solid rgba(0,0,0,0.08)',
                            }} />
                        ))}
                    </div>
                </div>

                {/* Column variant selector — in sidebar */}
                {!isMobile && columns > 0 && (
                    <div>
                        <SL>Interior per coloană</SL>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {Array.from({ length: columns }).map((_, i) => (
                                <div key={i}>
                                    <div style={{ fontSize: 10, color: '#aaa', marginBottom: 5, fontWeight: 600 }}>COL. {i + 1}</div>
                                    <div style={{ display: 'flex', gap: 5 }}>
                                        {(['open', 'shelves', 'drawers', 'door'] as ColVariant[]).map(v => {
                                            const active = (variants[i] ?? 'shelves') === v;
                                            return (
                                                <div key={v} title={v} onClick={() => handleVariantChange(i, v)} style={{
                                                    width: 44, height: 50, border: `2px solid ${active ? '#E8472C' : '#E0DBD4'}`,
                                                    borderRadius: 7, cursor: 'pointer', display: 'flex', flexDirection: 'column',
                                                    alignItems: 'center', justifyContent: 'center', gap: 3,
                                                    background: active ? '#FFF4F2' : '#fff', transition: 'all 0.12s',
                                                    color: active ? '#E8472C' : '#bbb',
                                                }}>
                                                    {VARIANT_ICONS[v]}
                                                    <span style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: 0.2 }}>{v === 'open' ? 'DESCHIS' : v === 'shelves' ? 'POLIȚE' : v === 'drawers' ? 'SERTARE' : 'UȘĂ'}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* CTA — sticky footer like Tylko */}
            <div style={{ padding: '12px 20px 20px', borderTop: '1px solid #F0ECE7', background: '#fff', flexShrink: 0 }}>
                <button
                    onClick={placeOrder} disabled={ordering}
                    id="btn-add-to-cart"
                    style={{ width: '100%', padding: '14px', background: ordering ? '#ccc' : '#E8472C', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: ordering ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8, transition: 'background 0.2s' }}
                >
                    🛒 {ordering ? 'Se procesează…' : 'Adaugă în coș'}
                </button>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                    <button style={{ flex: 1, padding: '9px', background: '#fff', color: '#1A1A1A', border: '1.5px solid #DDD', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                        ♡ Salvează
                    </button>
                    <button
                        id="btn-dxf-export"
                        onClick={async () => {
                            const url = `/api/cnc-export?w=${width}&h=${height}&d=${depth}&cols=${columns}`;
                            const a = document.createElement('a');
                            a.href = url; a.download = `KAGU-${width}x${height}x${depth}.dxf`;
                            a.click();
                        }}
                        style={{ flex: 1, padding: '9px', background: '#fff', color: '#555', border: '1.5px solid #DDD', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                    >
                        ↓ DXF
                    </button>
                </div>
                <div style={{ fontSize: 10, color: '#bbb', textAlign: 'center', lineHeight: 1.6 }}>
                    Livrat în 6–9 săptămâni · Fabricat la comandă
                </div>
            </div>
        </>
    );

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#EDEBE6', overflow: 'hidden', fontFamily: "'Inter', system-ui, sans-serif" }}>

            {/* 3D Canvas */}
            <div style={{ position: 'absolute', inset: 0, right: isMobile ? 0 : 300 }}>
                <Suspense fallback={null}>
                    <ThreeViewer {...viewerProps} />
                </Suspense>
            </div>

            {/* Product title — top left */}
            <div style={{ position: 'absolute', top: 14, left: 18, fontSize: 12, color: '#666', fontWeight: 400, pointerEvents: 'none', zIndex: 10 }}>
                Dulap în {extCol.label}
            </div>

            {/* Dimension badge — bottom left */}
            <div style={{ position: 'absolute', bottom: editingCol !== null ? 160 : isMobile ? 82 : 18, left: 18, background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(6px)', padding: '5px 14px', borderRadius: 100, fontSize: 11, fontWeight: 600, color: '#555', border: '1px solid rgba(0,0,0,0.07)', userSelect: 'none', transition: 'bottom 0.25s', zIndex: 10 }}>
                {width / 10} × {height / 10} × {depth / 10} cm &nbsp;·&nbsp; {columns} {columns === 1 ? 'coloană' : 'coloane'}
            </div>

            {/* ─── Tylko bottom column icon bar (always visible on canvas) ─── */}
            <BottomColumnBar
                columns={columns}
                variants={variants}
                onVariantChange={handleVariantChange}
                visible={!isMobile}
            />

            {/* ─── COLUMN EDIT BOTTOM SHEET ─── */}
            <div style={{
                position: 'absolute', bottom: editingCol !== null ? 0 : -220,
                left: 0, right: isMobile ? 0 : 300, background: '#fff',
                borderRadius: '12px 12px 0 0', boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
                zIndex: 100, padding: '16px 20px 28px',
                transition: 'bottom 0.28s cubic-bezier(0.22,1,0.36,1)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>
                        Coloana {editingCol !== null ? editingCol + 1 : '—'}
                    </span>
                    <button onClick={() => setEditingCol(null)} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: '#aaa', lineHeight: 1 }}>×</button>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {(['open', 'shelves', 'drawers', 'door'] as ColVariant[]).map(v => {
                        const active = editingCol !== null && (variants[editingCol] ?? 'shelves') === v;
                        const labels: Record<ColVariant, string> = { open: 'Deschis', shelves: 'Polițe', drawers: 'Sertare', door: 'Ușă' };
                        return (
                            <div key={v} onClick={() => {
                                if (editingCol === null) return;
                                const next = [...variants]; next[editingCol] = v; setVariants(next);
                            }} style={{
                                width: 60, height: 64, border: `2px solid ${active ? '#E8472C' : '#E0DBD4'}`,
                                borderRadius: 8, cursor: 'pointer', display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center', gap: 5,
                                background: active ? '#FFF4F2' : '#fff', transition: 'all 0.14s',
                                color: active ? '#E8472C' : '#bbb',
                            }}>
                                {VARIANT_ICONS[v]}
                                <span style={{ fontSize: 9, fontWeight: 700, color: '#bbb' }}>{labels[v]}</span>
                            </div>
                        );
                    })}
                </div>
                {editingCol !== null && (variants[editingCol] ?? 'shelves') === 'door' && (
                    <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 12, color: '#666' }}>Deschidere ușă</span>
                        {(['left', 'right'] as const).map(side => (
                            <button key={side} onClick={() => setDoorHinge(side)} style={{
                                padding: '4px 14px', border: `1.5px solid ${doorHinge === side ? '#E8472C' : '#DDD'}`,
                                borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                background: doorHinge === side ? '#E8472C' : '#fff',
                                color: doorHinge === side ? '#fff' : '#555',
                            }}>{side === 'left' ? 'Stânga' : 'Dreapta'}</button>
                        ))}
                    </div>
                )}
            </div>

            {/* Order confirmation overlay */}
            {orderCode && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: 14, padding: '32px 40px', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', textAlign: 'center', zIndex: 200 }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                    <div style={{ fontWeight: 700, fontSize: 17 }}>Comandă plasată!</div>
                    <div style={{ fontSize: 13, color: '#888', marginTop: 8 }}>Cod: <strong>{orderCode}</strong></div>
                    <button onClick={() => setOrderCode(null)} style={{ marginTop: 20, padding: '10px 24px', background: '#E8472C', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                        Continuă
                    </button>
                </div>
            )}

            {/* ─── MOBILE: bottom FAB to open panel ─── */}
            {isMobile && (
                <button
                    id="btn-mobile-panel"
                    onClick={() => setMobilePanel(p => !p)}
                    style={{
                        position: 'absolute', bottom: 24, right: 24,
                        background: '#E8472C', color: '#fff',
                        border: 'none', borderRadius: 100,
                        padding: '12px 22px', fontSize: 13, fontWeight: 700,
                        boxShadow: '0 4px 20px rgba(232,71,44,0.4)',
                        cursor: 'pointer', zIndex: 150,
                        display: 'flex', alignItems: 'center', gap: 8,
                    }}
                >
                    ⚙️ {price > 0 ? `${price.toLocaleString('ro-RO')} RON` : 'Configurează'}
                </button>
            )}

            {/* ─── DESKTOP: Right panel sidebar ─── */}
            {!isMobile && (
                <div style={{ position: 'absolute', top: 0, right: 0, width: 300, height: '100vh', background: '#fff', boxShadow: '-2px 0 20px rgba(0,0,0,0.08)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                    {panelContent}
                </div>
            )}

            {/* ─── MOBILE: Bottom sheet panel ─── */}
            {isMobile && (
                <>
                    {/* Backdrop */}
                    {mobilePanel && (
                        <div
                            onClick={() => setMobilePanel(false)}
                            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 140 }}
                        />
                    )}
                    <div style={{
                        position: 'absolute',
                        bottom: mobilePanel ? 0 : '-85vh',
                        left: 0, right: 0,
                        height: '85vh',
                        background: '#fff',
                        borderRadius: '16px 16px 0 0',
                        boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
                        zIndex: 145,
                        display: 'flex', flexDirection: 'column',
                        transition: 'bottom 0.35s cubic-bezier(0.22,1,0.36,1)',
                        overflow: 'hidden',
                    }}>
                        {/* Drag handle */}
                        <div style={{ padding: '12px 0 0', display: 'flex', justifyContent: 'center', cursor: 'pointer' }} onClick={() => setMobilePanel(false)}>
                            <div style={{ width: 40, height: 4, borderRadius: 2, background: '#DDD' }} />
                        </div>
                        {panelContent}
                    </div>
                </>
            )}
        </div>
    );
}
