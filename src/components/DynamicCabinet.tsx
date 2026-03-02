import React from 'react';
import * as THREE from 'three';

interface DynamicCabinetProps {
    width: number;
    height: number;
    depth: number;
    materialColor?: string;
    isXray?: boolean;
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

                {/* X-RAY / INDUSTRIAL VIEW - DRILLING PATTERNS */}
                {isXray && (
                    <group>
                        {/* Visualize System 32 Connection Holes */}
                        {[[-0.45, 0.45], [0.45, 0.45], [-0.45, -0.45], [0.45, -0.45]].map((pos, i) => (
                            <mesh key={i} position={[pos[0], pos[1], 0.49]}>
                                <sphereGeometry args={[0.015, 16, 16]} />
                                <meshBasicMaterial color="#3b82f6" />
                            </mesh>
                        ))}

                        {/* Center Label Marker */}
                        <mesh position={[0, 0, 0]}>
                            <sphereGeometry args={[0.02]} />
                            <meshBasicMaterial color="red" />
                        </mesh>
                    </group>
                )}

                {/* FIXED HARDWARE - HANDLES */}
                <group name="fixed_components">
                    <mesh
                        position={[0, 0, 0.51]}
                        scale={[1 / w, 1 / h, 1 / d]}
                    >
                        <boxGeometry args={[0.4, 0.02, 0.03]} />
                        <meshStandardMaterial color="#888" metalness={1} roughness={0} />
                    </mesh>
                </group>
            </mesh>
        </group>
    );
};
