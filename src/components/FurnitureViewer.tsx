'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, PerspectiveCamera } from '@react-three/drei';
import { DynamicCabinet } from './DynamicCabinet';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';

export default function FurnitureViewer() {
    const { dimensions, updateDimension } = useConfiguratorStore();

    return (
        <div className="w-full h-screen bg-[#0a0a0a]">
            <Canvas shadows>
                <PerspectiveCamera makeDefault position={[3, 3, 3]} fov={50} />
                <Suspense fallback={null}>
                    <Stage environment="city" intensity={0.6}>
                        <DynamicCabinet
                            width={dimensions.width}
                            height={dimensions.height}
                            depth={dimensions.depth}
                        />
                    </Stage>
                    <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
                </Suspense>
            </Canvas>

            {/* PREMIUM CAD UI OVERLAY */}
            <div className="absolute top-8 left-8 p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl pointer-events-auto">
                <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    家具 <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30 font-mono">PRO</span>
                </h1>

                <div className="mt-8 space-y-6">
                    {/* WIDTH CONTROL */}
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest">Lățime</span>
                            <span className="text-sm text-gray-200 font-mono">{dimensions.width}mm</span>
                        </div>
                        <input
                            type="range" min="300" max="1200" step="15"
                            value={dimensions.width}
                            onChange={(e) => updateDimension('width', parseInt(e.target.value))}
                            className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                    </div>

                    {/* HEIGHT CONTROL */}
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest">Înălțime</span>
                            <span className="text-sm text-gray-200 font-mono">{dimensions.height}mm</span>
                        </div>
                        <input
                            type="range" min="150" max="2400" step="15"
                            value={dimensions.height}
                            onChange={(e) => updateDimension('height', parseInt(e.target.value))}
                            className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                    </div>

                    {/* DEPTH CONTROL */}
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest">Adâncime</span>
                            <span className="text-sm text-gray-200 font-mono">{dimensions.depth}mm</span>
                        </div>
                        <input
                            type="range" min="300" max="600" step="15"
                            value={dimensions.depth}
                            onChange={(e) => updateDimension('depth', parseInt(e.target.value))}
                            className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                    </div>
                </div>
            </div>

            {/* REAL-TIME BOM / PRICE OVERLAY */}
            <div className="absolute bottom-8 right-8 p-6 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl min-w-[280px]">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">Preț Estimativ</span>
                        <div className="mt-1 flex items-baseline gap-1">
                            <span className="text-3xl font-light text-white">
                                {Math.round((dimensions.width * dimensions.height * 0.0004))}
                            </span>
                            <span className="text-sm text-gray-400 font-medium">RON</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">Material</span>
                        <p className="text-[10px] text-gray-300 font-medium mt-1">MDF Stejar 18mm</p>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                    <button className="w-full py-3 bg-white text-black text-[11px] font-bold rounded-xl hover:bg-gray-200 transition-all uppercase tracking-widest active:scale-95">
                        GENEREAZĂ FIȘIERE CNC
                    </button>
                </div>
            </div>
        </div>
    );
}
