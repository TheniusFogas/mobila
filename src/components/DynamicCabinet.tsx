import React, { useMemo } from 'react';
import * as THREE from 'three';
import { applyInverseScaling } from '@/lib/engine/scaling';

interface DynamicCabinetProps {
    width: number;  // in mm
    height: number; // in mm
    depth: number;  // in mm
    materialColor?: string;
}

/**
 * ARCH 1: Core Parametric Engine - DynamicCabinet
 * This is the base component that renders a cabinet and applies 
 * industrial scaling rules in real-time.
 */
export const DynamicCabinet: React.FC<DynamicCabinetProps> = ({
    width = 600,
    height = 800,
    depth = 450,
    materialColor = '#555',
}) => {
    // Convert mm to Three.js units (1 unit = 1 meter)
    const w = width / 1000;
    const h = height / 1000;
    const d = depth / 1000;

    // Base dimensions of the original model (default 1x1x1m for now)
    const baseSize = { x: 1, y: 1, z: 1 };

    return (
        <group>
            {/* 
        MAIN BODY 
        In a real scenario, this would be a loaded GLTF model.
        For now, we mock the mesh with sub-components to demonstrate Inverse Scaling.
      */}
            <mesh
                castShadow
                receiveShadow
                scale={[w, h, d]}
            >
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color={materialColor} roughness={0.2} metalness={0.1} />

                {/* 
          FIXED COMPONENTS (e.g. Rounded Corners, Handles)
          The '_fixed' suffix triggers our inverse scaling logic.
        */}
                <group name="fixed_components">
                    {/* Mocked handle that shouldn't stretch when the cabinet grows */}
                    <mesh
                        name="handle_fixed"
                        position={[0.5, 0, 0.51]}
                        scale={[1 / w, 1 / h, 1 / d]} // Applied Inverse Scaling
                    >
                        <boxGeometry args={[0.02, 0.2, 0.02]} />
                        <meshStandardMaterial color="#888" metalness={1} roughness={0} />
                    </mesh>

                    {/* Mocked Decorative Bevel/Fixed Edge */}
                    <mesh
                        name="edge_fixed"
                        position={[0, 0.5, 0]}
                        scale={[1, 0.01 / h, 1]} // Only Y is inversely scaled to keep thickness fixed
                    >
                        <boxGeometry args={[1, 1, 1]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                </group>
            </mesh>
        </group>
    );
};
