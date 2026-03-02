'use client';

import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, PerspectiveCamera, Environment } from '@react-three/drei';
import { DynamicCabinet } from './DynamicCabinet';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { MeasurementOverlay } from './MeasurementOverlay';

export default function FurnitureViewer() {
    const { dimensions, updateDimension } = useConfiguratorStore();
    const [isXray, setIsXray] = useState(false);

    return (
        <div className="w-full h-screen bg-[#000] relative overflow-hidden">
            {/* BACKGROUND GRADIENT */}
            <div className="absolute inset-0 bg-radial-at-t from-[#111] via-[#000] to-[#000] opacity-50" />

            <Canvas shadows gl={{ antialias: true }}>
                <PerspectiveCamera makeDefault position={[2.5, 2, 2.5]} fov={45} />
                <Suspense fallback={null}>
                    <Stage environment="studio" intensity={0.5} shadows={{ type: 'contact', opacity: 0.4, blur: 2 }}>
                        <DynamicCabinet
                            width={dimensions.width}
                            height={dimensions.height}
                            depth={dimensions.depth}
                            isXray={isXray}
                        />
                    </Stage>
                    <OrbitControls
                        makeDefault
                        minPolarAngle={Math.PI / 4}
                        maxPolarAngle={Math.PI / 1.75}
                        enableDamping
                        dampingFactor={0.05}
                    />
                    <Environment preset="city" />
                </Suspense>
            </Canvas>

            <MeasurementOverlay />

            {/* TOP NAVIGATION / STATUS */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
                <div className="glass p-5 rounded-2xl pointer-events-auto transition-all hover:border-white/20">
                    <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        KAGU <span className="text-[10px] px-2 py-0.5 bg-accent/20 text-accent rounded-full border border-accent/30 font-mono">INDUSTRIAL v3</span>
                    </h1>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-medium">Parametric Manufacturing Engine</p>
                </div>

                <div className="flex gap-4 pointer-events-auto">
                    <button
                        onClick={() => setIsXray(!isXray)}
                        className={`glass px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all ${isXray ? 'bg-accent/40 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        {isXray ? 'X-RAY ACTIVE' : 'X-RAY MODE'}
                    </button>
                </div>
            </div>

            {/* SIDE CONTROLS */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 pointer-events-auto">
                <div className="glass p-6 rounded-2xl w-[300px] space-y-8">
                    {/* WIDTH */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Lățime (W)</span>
                            <span className="text-sm text-white font-mono">{dimensions.width}</span>
                        </div>
                        <input
                            type="range" min="300" max="1200" step="15"
                            value={dimensions.width}
                            onChange={(e) => updateDimension('width', parseInt(e.target.value))}
                            className="w-full"
                        />
                    </div>

                    {/* HEIGHT */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Înălțime (H)</span>
                            <span className="text-sm text-white font-mono">{dimensions.height}</span>
                        </div>
                        <input
                            type="range" min="300" max="2400" step="15"
                            value={dimensions.height}
                            onChange={(e) => updateDimension('height', parseInt(e.target.value))}
                            className="w-full"
                        />
                    </div>

                    {/* DEPTH */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Adâncime (D)</span>
                            <span className="text-sm text-white font-mono">{dimensions.depth}</span>
                        </div>
                        <input
                            type="range" min="300" max="600" step="15"
                            value={dimensions.depth}
                            onChange={(e) => updateDimension('depth', parseInt(e.target.value))}
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            {/* BOTTOM INFO - PRODUCTION DATA */}
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none">
                <div className="glass p-6 rounded-2xl pointer-events-auto max-w-sm">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Specificații Fabricație</span>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[9px] text-gray-500 uppercase">Găuri Minifix</p>
                            <p className="text-xs text-white font-mono">16 Unități</p>
                        </div>
                        <div>
                            <p className="text-[9px] text-gray-500 uppercase">Tip Cant (ABS)</p>
                            <p className="text-xs text-white font-mono">2.0 mm / 0.4 mm</p>
                        </div>
                        <div>
                            <p className="text-[9px] text-gray-500 uppercase">Eficiență Nesting</p>
                            <p className="text-xs text-accent font-mono">92.4%</p>
                        </div>
                        <div>
                            <p className="text-[9px] text-gray-500 uppercase">Timp Producție</p>
                            <p className="text-xs text-white font-mono">2 Zile</p>
                        </div>
                    </div>
                </div>

                <div className="glass p-8 rounded-2xl pointer-events-auto min-w-[320px]">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Cost Total</span>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-4xl font-light text-white tracking-tighter">
                                    {Math.round((dimensions.width * dimensions.height * 0.00045) + 150)}
                                </span>
                                <span className="text-sm text-gray-400 font-medium">RON</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Material</span>
                            <p className="text-xs text-white font-medium mt-1">MDF Stejar 18mm</p>
                        </div>
                    </div>

                    <button className="w-full py-4 bg-white text-black text-[10px] font-black rounded-xl hover:bg-white/90 transition-all uppercase tracking-[2px] shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 flex items-center justify-center gap-2">
                        FINALIZARE COMANDĂ
                    </button>
                </div>
            </div>
        </div>
    );
}
