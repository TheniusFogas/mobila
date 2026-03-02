'use client';

import React from 'react';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface DynamicCabinetProps {
    width: number;    // mm
    height: number;   // mm
    depth: number;    // mm
    materialColor?: string;
    isXray?: boolean;
}

export const DynamicCabinet: React.FC<DynamicCabinetProps> = ({
    width = 600,
    height = 800,
    depth = 450,
    materialColor = '#2a2a2a',
    isXray = false,
}) => {
    const groupRef = useRef<THREE.Group>(null);

    const w = width / 1000;
    const h = height / 1000;
    const d = depth / 1000;
    const t = 0.018; // 18mm in meters

    const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(materialColor),
        roughness: 0.15,
        metalness: 0.0,
        transparent: isXray,
        opacity: isXray ? 0.25 : 1,
        wireframe: isXray,
        side: THREE.FrontSide,
    });

    const edgeMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#1a1a1a'),
        roughness: 0.3,
        metalness: 0.0,
    });

    // Cabinet panels using THREE geometry imperatively
    const panels: { pos: [number, number, number]; size: [number, number, number] }[] = [
        // Left side
        { pos: [-w / 2 + t / 2, 0, 0], size: [t, h, d] },
        // Right side
        { pos: [w / 2 - t / 2, 0, 0], size: [t, h, d] },
        // Top
        { pos: [0, h / 2 - t / 2, 0], size: [w - t * 2, t, d] },
        // Bottom
        { pos: [0, -h / 2 + t / 2, 0], size: [w - t * 2, t, d] },
        // Back (HDF 3mm)
        { pos: [0, 0, -d / 2 + 0.0015], size: [w, h, 0.003] },
        // Middle shelf
        { pos: [0, 0, 0], size: [w - t * 2, t, d - 0.02] },
        // Plinth
        { pos: [0, -h / 2 + 0.08, d / 2 - 0.02], size: [w, 0.12, 0.02] },
    ];

    const G = 'group' as unknown as React.FC<{ ref?: React.RefObject<THREE.Group>;[key: string]: unknown }>;

    return (
        <group ref={groupRef as React.RefObject<THREE.Group | null>} position={[0, 0, 0]}>
            {panels.map((panel, i) => {
                const geo = new THREE.BoxGeometry(...panel.size);
                return (
                    <mesh
                        key={i}
                        position={panel.pos}
                        castShadow
                        receiveShadow
                        geometry={geo}
                        material={mat}
                    />
                );
            })}
            {/* X-Ray drill dot indicators */}
            {isXray && [
                [-w / 2 + t, h / 2 - 0.032, 0],
                [-w / 2 + t, h / 2 - 0.064, 0],
                [w / 2 - t, h / 2 - 0.032, 0],
                [w / 2 - t, h / 2 - 0.064, 0],
            ].map((pos, i) => (
                <mesh key={`drill-${i}`} position={pos as [number, number, number]}>
                    <sphereGeometry args={[0.006, 12, 12]} />
                    <meshBasicMaterial color="#3b82f6" />
                </mesh>
            ))}
        </group>
    );
};
