import * as THREE from 'three';

/**
 * ARCH 1: Core Parametric Engine - Scaling Utility
 * This handles the "Inverse Scaling" logic to protect fixed geometries like 
 * rounded corners, bevels, and complex joins during cabinet resizing.
 */

interface ScalingParams {
    mesh: THREE.Mesh;
    targetSize: { x: number; y: number; z: number };
    baseSize: { x: number; y: number; z: number };
}

export const applyInverseScaling = (params: ScalingParams) => {
    const { mesh, targetSize, baseSize } = params;

    // 1. Calculate general scale factor for the whole body
    const scaleX = targetSize.x / baseSize.x;
    const scaleY = targetSize.y / baseSize.y;
    const scaleZ = targetSize.z / baseSize.z;

    mesh.scale.set(scaleX, scaleY, scaleZ);

    // 2. Identify and 'inverse scale' sub-components with the "_fixed" tag
    // This prevents distortion on rounded corners or specific engineering parts.
    mesh.traverse((child) => {
        if (child instanceof THREE.Mesh && child.name.includes('_fixed')) {
            // We divide by the parent's scale to keep the child at its original visual proportions
            // Example: A 50mm radius corner stays 50mm even if the cabinet grows to 2000mm.
            child.scale.set(1 / scaleX, 1 / scaleY, 1 / scaleZ);

            // We might also need to adjust the position to keep it anchored to its corner/edge.
            // Anchor logic depends on the specific mesh origin point.
        }
    });
};

/**
 * TYLKO-STYLE SNAPPING LOGIC
 * Snap dimensions to standardized increments (e.g., every 15mm)
 */
export const snapToStep = (value: number, step: number = 15): number => {
    return Math.round(value / step) * step;
};
