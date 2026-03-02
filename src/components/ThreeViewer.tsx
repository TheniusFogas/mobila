'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, ContactShadows, Environment } from '@react-three/drei';

// Single wardrobe module. Only scales Y (height) and Z (depth), NEVER X.
// X-axis instancing is done by rendering multiple modules side by side.
interface ModuleProps {
    position: [number, number, number];
    materialColor: string;
    roughness: number;
    metalness: number;
    scaleY: number;    // height scaling only
    scaleZ: number;    // depth scaling only
}

function WardrobeModule({ position, materialColor, roughness, metalness, scaleY, scaleZ }: ModuleProps) {
    const { scene } = useGLTF('/models/dulap.glb');
    const color = useMemo(() => new THREE.Color(materialColor), [materialColor]);

    const cloned = useMemo(() => {
        const clone = scene.clone(true);
        clone.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                const applyMat = (mat: THREE.Material) => {
                    if (mat instanceof THREE.MeshStandardMaterial) {
                        mat.color.set(color);
                        mat.roughness = roughness;
                        mat.metalness = metalness;
                        mat.needsUpdate = true;
                    }
                };
                if (Array.isArray(child.material)) child.material.forEach(applyMat);
                else applyMat(child.material);
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        return clone;
    }, [scene, materialColor, roughness, metalness]);

    return (
        <group position={position} scale={[1, scaleY, scaleZ]}>
            <primitive object={cloned} />
        </group>
    );
}

// Scene: light neutral studio
function SceneSetup() {
    const { scene } = useThree();
    useEffect(() => {
        scene.background = new THREE.Color('#EAE6DF');
        const ambient = new THREE.AmbientLight(0xffffff, 0.85);
        const key = new THREE.DirectionalLight(0xfff8f0, 1.3);
        key.position.set(3, 6, 5);
        key.castShadow = true;
        key.shadow.mapSize.setScalar(1024);
        const fill = new THREE.DirectionalLight(0xf0f4ff, 0.35);
        fill.position.set(-3, 3, -2);
        scene.add(ambient, key, fill);
        return () => { scene.remove(ambient, key, fill); };
    }, [scene]);
    return null;
}

// MODULE WIDTH of the base GLB model in meters (900mm)
const MODULE_WIDTH_M = 0.9;

interface ThreeViewerProps {
    materialColor: string;
    roughness: number;
    metalness: number;
    width: number;   // mm total width
    height: number;  // mm
    depth: number;   // mm
}

const BASE_H = 2100; // mm
const BASE_D = 600;  // mm

export default function ThreeViewer({ materialColor, roughness, metalness, width, height, depth }: ThreeViewerProps) {
    // How many 900mm modules fit in the requested width?
    const moduleCount = Math.max(1, Math.round(width / 900));
    const totalWidthM = moduleCount * MODULE_WIDTH_M;
    const scaleY = height / BASE_H;
    const scaleZ = depth / BASE_D;

    // Center the whole row of modules
    const startX = -((moduleCount - 1) * MODULE_WIDTH_M) / 2;

    // Camera: pull back more for wider units
    const camX = totalWidthM * 0.6 + 1.0;
    const camZ = totalWidthM * 0.8 + 2.5;

    return (
        <Canvas
            shadows
            camera={{ position: [camX, 1.4, camZ], fov: 34 }}
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
            style={{ width: '100%', height: '100%' }}
        >
            <SceneSetup />

            {Array.from({ length: moduleCount }).map((_, i) => (
                <WardrobeModule
                    key={i}
                    position={[startX + i * MODULE_WIDTH_M, 0, 0]}
                    materialColor={materialColor}
                    roughness={roughness}
                    metalness={metalness}
                    scaleY={scaleY}
                    scaleZ={scaleZ}
                />
            ))}

            <ContactShadows position={[0, -1.05 * scaleY, 0]} opacity={0.2} scale={10} blur={2} far={2} />

            <OrbitControls
                enableDamping
                dampingFactor={0.05}
                minPolarAngle={Math.PI * 0.18}
                maxPolarAngle={Math.PI * 0.52}
                minDistance={1.2}
                maxDistance={12}
                target={[0, 0.5, 0]}
                enablePan={false}
            />
        </Canvas>
    );
}

useGLTF.preload('/models/dulap.glb');
