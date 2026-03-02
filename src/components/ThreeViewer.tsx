'use client';

import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, PerspectiveCamera, Environment } from '@react-three/drei';
import { DynamicCabinet } from './DynamicCabinet';

interface ThreeViewerProps {
    width: number;
    height: number;
    depth: number;
    isXray: boolean;
}

export default function ThreeViewer({ width, height, depth, isXray }: ThreeViewerProps) {
    return (
        <div className="absolute inset-0">
            <Canvas
                shadows
                gl={{ antialias: true }}
                camera={{ position: [2.5, 1.8, 2.5], fov: 40 }}
            >
                <PerspectiveCamera makeDefault position={[2.5, 1.8, 2.5]} fov={40} />
                <color attach="background" args={['#000000']} />
                <fog attach="fog" args={['#000000', 8, 25]} />

                <ambientLight intensity={0.3} />
                <directionalLight
                    position={[5, 10, 5]}
                    intensity={1}
                    castShadow
                    shadow-mapSize={[2048, 2048]}
                />
                <spotLight
                    position={[-5, 8, 3]}
                    intensity={0.5}
                    angle={0.3}
                    penumbra={1}
                />

                <DynamicCabinet
                    width={width}
                    height={height}
                    depth={depth}
                    isXray={isXray}
                />

                <OrbitControls
                    enableDamping
                    dampingFactor={0.05}
                    minPolarAngle={Math.PI / 6}
                    maxPolarAngle={Math.PI / 1.8}
                    minDistance={1}
                    maxDistance={8}
                />

                <Environment preset="studio" />

                {/* Floor grid */}
                <gridHelper args={[10, 20, '#111', '#111']} position={[0, -0.001, 0]} />
            </Canvas>
        </div>
    );
}
