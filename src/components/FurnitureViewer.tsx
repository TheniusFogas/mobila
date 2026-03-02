'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';

// Lazy load Three.js only in browser to prevent SSR crashes
const ThreeViewer = React.lazy(() => import('./ThreeViewer'));

export default function FurnitureViewer() {
    const { dimensions, updateDimension } = useConfiguratorStore();
    const [isXray, setIsXray] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Safe BOM calculation with fallback values
    const panelCount = 5;
    const surfaceM2 = Math.max(0, (
        (dimensions.depth * dimensions.height * 2) +
        ((dimensions.width - 36) * dimensions.depth * 2) +
        ((dimensions.width - 4) * (dimensions.height - 4))
    ) / 1000000).toFixed(2);
    const costRON = Math.round(parseFloat(surfaceM2) * 125 + 95);

    return (
        <div className="w-full h-screen bg-black relative overflow-hidden">
            {/* 3D CANVAS - client only */}
            {isClient && (
                <Suspense fallback={
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="text-white/20 text-xs font-mono uppercase tracking-widest animate-pulse">
                            Loading 3D Engine...
                        </div>
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
            <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-10">
                <div className="glass p-5 rounded-2xl">
                    <h1 className="text-xl font-bold text-white tracking-tight">
                        KAGU <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30 font-mono ml-1">INDUSTRIAL v3</span>
                    </h1>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">Parametric Manufacturing Engine</p>
                </div>

                <button
                    onClick={() => setIsXray(!isXray)}
                    className={`glass px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all ${isXray ? 'bg-blue-500/40 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    {isXray ? '⚡ X-RAY ON' : 'X-RAY'}
                </button>
            </div>

            {/* DIMENSION CONTROLS */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 z-10">
                <div className="glass p-6 rounded-2xl w-[280px] space-y-7">
                    {(['width', 'height', 'depth'] as const).map((dim) => {
                        const config = {
                            width: { label: 'Lățime (W)', min: 300, max: 1200 },
                            height: { label: 'Înălțime (H)', min: 300, max: 2400 },
                            depth: { label: 'Adâncime (D)', min: 300, max: 600 },
                        };
                        const c = config[dim];
                        return (
                            <div key={dim} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{c.label}</span>
                                    <span className="text-sm text-white font-mono">{dimensions[dim]} <span className="text-gray-500 text-[9px]">mm</span></span>
                                </div>
                                <input
                                    type="range"
                                    min={c.min}
                                    max={c.max}
                                    step={15}
                                    value={dimensions[dim]}
                                    onChange={(e) => updateDimension(dim, parseInt(e.target.value))}
                                    className="w-full"
                                />
                                {dim === 'width' && dimensions.width > 900 && (
                                    <p className="text-[9px] text-red-400 border border-red-500/20 bg-red-500/10 rounded-lg px-2 py-1.5">
                                        ⚠ Placă necesită suport central
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* BOTTOM DATA */}
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-10">
                <div className="glass p-5 rounded-2xl">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Specificații Fabricație</span>
                    <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-3">
                        <div>
                            <p className="text-[9px] text-gray-500 uppercase">Total Panouri</p>
                            <p className="text-xs text-white font-mono">{panelCount} piese</p>
                        </div>
                        <div>
                            <p className="text-[9px] text-gray-500 uppercase">Suprafață PAL</p>
                            <p className="text-xs text-white font-mono">{surfaceM2} m²</p>
                        </div>
                        <div>
                            <p className="text-[9px] text-gray-500 uppercase">Sistem Conectare</p>
                            <p className="text-xs text-blue-400 font-mono">Minifix + System 32</p>
                        </div>
                        <div>
                            <p className="text-[9px] text-gray-500 uppercase">Export</p>
                            <p className="text-xs text-white font-mono">DXF / MPR</p>
                        </div>
                    </div>
                </div>

                <div className="glass p-6 rounded-2xl min-w-[300px]">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Cost Estimat Material</span>
                    <div className="flex items-baseline gap-1.5 mt-2 mb-5">
                        <span className="text-5xl font-light text-white tracking-tighter">{costRON}</span>
                        <span className="text-sm text-gray-400">RON</span>
                    </div>
                    <button className="w-full py-3.5 bg-white text-black text-[10px] font-black rounded-xl hover:bg-white/90 transition-all uppercase tracking-[2px] active:scale-95">
                        DESCARCĂ FIȘIERE CNC (.DXF)
                    </button>
                </div>
            </div>
        </div>
    );
}
