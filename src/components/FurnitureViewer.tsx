'use client';

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';

const ThreeViewer = React.lazy(() => import('./ThreeViewer'));

interface BOMData {
    totalMaterialM2: number;
    costRON: number;
    sheetsRequired: number;
    nestingEfficiency: number;
    panels: Array<{ name: string; width: number; height: number; areaM2: number }>;
}

export default function FurnitureViewer() {
    const { dimensions, updateDimension } = useConfiguratorStore();
    const [isXray, setIsXray] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [bom, setBom] = useState<BOMData | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const fetchBOM = useCallback(async () => {
        try {
            const res = await fetch(`/api/bom?w=${dimensions.width}&h=${dimensions.height}&d=${dimensions.depth}`);
            if (res.ok) {
                const data = await res.json();
                setBom(data);
            }
        } catch { /* silent fail */ }
    }, [dimensions.width, dimensions.height, dimensions.depth]);

    useEffect(() => {
        const t = setTimeout(fetchBOM, 400); // debounce
        return () => clearTimeout(t);
    }, [fetchBOM]);

    const handleCNCExport = async () => {
        setIsExporting(true);
        try {
            const res = await fetch(`/api/cnc-export?w=${dimensions.width}&h=${dimensions.height}&d=${dimensions.depth}`);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `PROD_${dimensions.width}x${dimensions.height}x${dimensions.depth}.dxf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch { /* silent fail */ } finally {
            setIsExporting(false);
        }
    };

    const cost = bom?.costRON ?? Math.round((dimensions.width / 1000) * (dimensions.height / 1000) * (dimensions.depth / 1000) * 2500 + 140);
    const surfaceM2 = bom?.totalMaterialM2 ?? 0;

    return (
        <div id="furniture-viewer" className="w-full h-screen bg-black relative overflow-hidden font-sans">
            {/* 3D Canvas */}
            {isClient && (
                <Suspense fallback={
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-white/20 text-xs font-mono uppercase tracking-widest animate-pulse">Loading 3D Engine…</div>
                    </div>
                }>
                    <ThreeViewer
                        width={dimensions.width}
                        height={dimensions.height}
                        depth={dimensions.depth}
                        isXray={isXray}
                    />
                </Suspense>
            )}

            {/* HEADER */}
            <header className="absolute top-6 left-6 right-6 flex justify-between items-start z-10 pointer-events-none">
                <div className="glass p-5 rounded-2xl pointer-events-auto">
                    <h1 className="text-xl font-bold text-white tracking-tight">
                        KAGU <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30 font-mono ml-1">INDUSTRIAL v3</span>
                    </h1>
                    <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest">Configurator Mobilă Parametric</p>
                </div>
                <div className="flex gap-2 pointer-events-auto">
                    <button
                        id="xray-toggle"
                        onClick={() => setIsXray(!isXray)}
                        className={`glass px-4 py-2.5 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all ${isXray ? 'bg-blue-500/40 text-blue-200 border border-blue-400/40' : 'text-gray-400 hover:text-white'}`}
                    >
                        {isXray ? '⚡ X-RAY ON' : '🔬 X-RAY'}
                    </button>
                </div>
            </header>

            {/* DIMENSION CONTROLS */}
            <aside className="absolute left-6 top-1/2 -translate-y-1/2 z-10">
                <div className="glass p-6 rounded-2xl w-[285px] space-y-7">
                    <div>
                        <h2 className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-4">Dimensiuni Cabinet</h2>
                        {(['width', 'height', 'depth'] as const).map((dim) => {
                            const cfg = {
                                width: { label: 'Lățime  (W)', min: 300, max: 1200, step: 15 },
                                height: { label: 'Înălțime (H)', min: 300, max: 2400, step: 15 },
                                depth: { label: 'Adâncime (D)', min: 300, max: 600, step: 10 },
                            }[dim];
                            return (
                                <div key={dim} className="space-y-1.5 mb-5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">{cfg.label}</span>
                                        <span className="text-sm text-white font-mono tabular-nums">
                                            {dimensions[dim]} <span className="text-gray-600 text-[9px]">mm</span>
                                        </span>
                                    </div>
                                    <input
                                        id={`dim-${dim}`}
                                        type="range"
                                        min={cfg.min}
                                        max={cfg.max}
                                        step={cfg.step}
                                        value={dimensions[dim]}
                                        onChange={(e) => updateDimension(dim, parseInt(e.target.value))}
                                        className="w-full accent-white"
                                    />
                                    {dim === 'width' && dimensions.width > 900 && (
                                        <p className="text-[9px] text-amber-400/80 border border-amber-500/20 bg-amber-500/10 rounded-lg px-2 py-1.5">
                                            ⚠ Lățime &gt;900mm — necesită suport central
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* NESTING STATS */}
                    {bom && (
                        <div className="border-t border-white/5 pt-5 space-y-3">
                            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Fabricație</span>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/5 rounded-xl p-3">
                                    <p className="text-[8px] text-gray-500 uppercase">Suprafață</p>
                                    <p className="text-xs text-white font-mono mt-0.5">{bom.totalMaterialM2} m²</p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-3">
                                    <p className="text-[8px] text-gray-500 uppercase">Plăci PAL</p>
                                    <p className="text-xs text-white font-mono mt-0.5">{bom.sheetsRequired} buc</p>
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3">
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-[8px] text-gray-500 uppercase">Eficiență nesting</span>
                                    <span className="text-[9px] text-green-400 font-mono">{bom.nestingEfficiency}%</span>
                                </div>
                                <div className="w-full bg-black/40 rounded-full h-1">
                                    <div
                                        className="bg-green-400 h-1 rounded-full transition-all duration-500"
                                        style={{ width: `${bom.nestingEfficiency}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* BOTTOM PANEL */}
            <footer className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-10 gap-4">
                {/* SYSTEM INFO */}
                <div className="glass p-5 rounded-2xl">
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Sistem Asamblare</span>
                    <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-2">
                        <div>
                            <p className="text-[8px] text-gray-500">Conectori</p>
                            <p className="text-[10px] text-blue-400 font-mono">Minifix D15</p>
                        </div>
                        <div>
                            <p className="text-[8px] text-gray-500">Sablare</p>
                            <p className="text-[10px] text-white font-mono">System 32</p>
                        </div>
                        <div>
                            <p className="text-[8px] text-gray-500">Spate</p>
                            <p className="text-[10px] text-white font-mono">HDF 3mm</p>
                        </div>
                        <div>
                            <p className="text-[8px] text-gray-500">Export</p>
                            <p className="text-[10px] text-white font-mono">DXF / MPR</p>
                        </div>
                    </div>
                </div>

                {/* COST + CTA */}
                <div className="glass p-6 rounded-2xl min-w-[300px]">
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Cost Estimat Material</span>
                    <div className="flex items-baseline gap-1.5 mt-2 mb-5">
                        <span className="text-5xl font-light text-white tracking-tighter tabular-nums">{cost}</span>
                        <span className="text-sm text-gray-400">RON</span>
                    </div>
                    <button
                        id="cnc-export-btn"
                        onClick={handleCNCExport}
                        disabled={isExporting}
                        className="w-full py-3.5 bg-white text-black text-[10px] font-black rounded-xl hover:bg-gray-200 transition-all uppercase tracking-[2px] active:scale-[0.98] disabled:opacity-50"
                    >
                        {isExporting ? 'Se generează…' : 'DESCARCĂ FIȘIERE CNC (.DXF)'}
                    </button>
                    <p className="text-[8px] text-gray-600 text-center mt-2">Fișier DXF direct pentru CNC router</p>
                </div>
            </footer>
        </div>
    );
}
