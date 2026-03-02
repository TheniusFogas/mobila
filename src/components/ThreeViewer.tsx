'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid } from '@react-three/drei';
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
            <Canvas shadows gl={{ antialias: true }}>
                <PerspectiveCamera makeDefault position={[2.5, 1.8, 2.5]} fov={40} />

                {/* Scene */}
                <ambientLight intensity={0.3} />
                <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
                <spotLight position={[-5, 8, 3]} intensity={0.5} angle={0.3} penumbra={1} />

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
                <Grid args={[10, 10]} position={[0, -0.001, 0]} cellColor="#111" sectionColor="#222" />
            </Canvas>
        </div>
    );
}
