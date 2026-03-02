'use client';

import React from 'react';

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const G = 'group' as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const M = 'mesh' as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const BoxGeo = 'boxGeometry' as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const StdMat = 'meshStandardMaterial' as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpGeo = 'sphereGeometry' as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const BasicMat = 'meshBasicMaterial' as any;

    const drillPositions: [number, number][] = [[-0.45, 0.45], [0.45, 0.45], [-0.45, -0.45], [0.45, -0.45]];

    return (
        <G>
            <M castShadow receiveShadow scale={[w, h, d]}>
                <BoxGeo args={[1, 1, 1]} />
                <StdMat
                    color={materialColor}
                    roughness={0.1}
                    metalness={0.05}
                    transparent={isXray}
                    opacity={isXray ? 0.2 : 1}
                    wireframe={isXray}
                />
            </M>
            {isXray && drillPositions.map((pos, i) => (
                <M key={i} position={[pos[0] * w, pos[1] * h, d / 2 + 0.001]}>
                    <SpGeo args={[0.008, 8, 8]} />
                    <BasicMat color="#3b82f6" />
                </M>
            ))}
        </G>
    );
};
