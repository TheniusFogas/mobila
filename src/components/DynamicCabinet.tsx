'use client';

import React from 'react';
import { type ThreeElements } from '@react-three/fiber';

interface DynamicCabinetProps {
    width: number;
    height: number;
    depth: number;
    materialColor?: string;
    isXray?: boolean;
}

declare global {
    namespace JSX {
        interface IntrinsicElements extends ThreeElements { }
    }
}

export const DynamicCabinet: React.FC<DynamicCabinetProps> = ({
    width = 600,
    height = 800,
    depth = 450,
    materialColor = '#222',
    isXray = false
}) => {
    const w = width / 1000;
    const h = height / 1000;
    const d = depth / 1000;

    return (
        <group>
            <mesh castShadow receiveShadow scale={[w, h, d]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial
                    color={materialColor}
                    roughness={0.1}
                    metalness={0.05}
                    transparent={isXray}
                    opacity={isXray ? 0.2 : 1}
                    wireframe={isXray}
                />

                {/* X-RAY drilling visualization */}
                {isXray && (
                    <>
                        {([[-0.45, 0.45], [0.45, 0.45], [-0.45, -0.45], [0.45, -0.45]] as [number, number][]).map((pos, i) => (
                            <mesh key={i} position={[pos[0], pos[1], 0.49]}>
                                <sphereGeometry args={[0.015, 16, 16]} />
                                <meshBasicMaterial color="#3b82f6" />
                            </mesh>
                        ))}
                    </>
                )}
            </mesh>
        </group>
    );
};
