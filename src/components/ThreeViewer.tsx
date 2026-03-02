'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { DynamicCabinet } from './DynamicCabinet';

// Imperative scene setup — no lowercase JSX, no TypeScript conflicts
function SceneSetup() {
    const { scene } = useThree();

    useEffect(() => {
        const ambient = new THREE.AmbientLight(0xffffff, 0.3);
        const directional = new THREE.DirectionalLight(0xffffff, 1);
        directional.position.set(5, 10, 5);
        directional.castShadow = true;
        const spot = new THREE.SpotLight(0xffffff, 0.5, 0, 0.3, 1);
        spot.position.set(-5, 8, 3);

        scene.add(ambient, directional, spot);
        scene.background = new THREE.Color('#000000');
        scene.fog = new THREE.FogExp2('#000000', 0.025);

        return () => {
            scene.remove(ambient, directional, spot);
        };
    }, [scene]);

    return null;
}

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
                <SceneSetup />

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

                <Grid
                    args={[10, 10]}
                    position={[0, -0.001, 0]}
                    cellColor="#111"
                    sectionColor="#222"
                />
            </Canvas>
        </div>
    );
}
