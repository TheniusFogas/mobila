'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, ContactShadows, Environment } from '@react-three/drei';

interface ModelProps {
    url: string;
    materialColor: string;
    roughness: number;
    metalness: number;
    dimensionScale: { x: number; y: number; z: number };
}

function CabinetModel({ url, materialColor, roughness, metalness, dimensionScale }: ModelProps) {
    const { scene } = useGLTF(url);
    const groupRef = useRef<THREE.Group>(null);

    useEffect(() => {
        if (!scene) return;
        const color = new THREE.Color(materialColor);
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => {
                        if (mat instanceof THREE.MeshStandardMaterial) {
                            mat.color.set(color);
                            mat.roughness = roughness;
                            mat.metalness = metalness;
                            mat.needsUpdate = true;
                        }
                    });
                } else if (child.material instanceof THREE.MeshStandardMaterial) {
                    child.material.color.set(color);
                    child.material.roughness = roughness;
                    child.material.metalness = metalness;
                    child.material.needsUpdate = true;
                }
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }, [scene, materialColor, roughness, metalness]);

    useEffect(() => {
        if (!groupRef.current) return;
        groupRef.current.scale.set(
            dimensionScale.x,
            dimensionScale.y,
            dimensionScale.z
        );
    }, [dimensionScale]);

    const cloned = React.useMemo(() => scene.clone(), [scene]);

    return (
        <group ref={groupRef as React.RefObject<THREE.Group | null>}>
            <primitive object={cloned} />
        </group>
    );
}

function SceneSetup() {
    const { scene } = useThree();
    useEffect(() => {
        scene.background = new THREE.Color('#F7F5F2');
        scene.fog = new THREE.Fog('#F7F5F2', 8, 20);
        const ambient = new THREE.AmbientLight(0xffffff, 0.7);
        const key = new THREE.DirectionalLight(0xffffff, 1.2);
        key.position.set(3, 6, 4);
        key.castShadow = true;
        const fill = new THREE.DirectionalLight(0xfff8f0, 0.4);
        fill.position.set(-3, 2, -2);
        scene.add(ambient, key, fill);
        return () => { scene.remove(ambient, key, fill); };
    }, [scene]);
    return null;
}

interface ThreeViewerProps {
    materialColor: string;
    roughness: number;
    metalness: number;
    width: number;
    height: number;
    depth: number;
}

export default function ThreeViewer({ materialColor, roughness, metalness, width, height, depth }: ThreeViewerProps) {
    // Base dimensions of the model (defaults from seed)
    const BASE = { w: 900, h: 2100, d: 600 };
    const dimensionScale = {
        x: width / BASE.w,
        y: height / BASE.h,
        z: depth / BASE.d,
    };

    return (
        <Canvas
            shadows
            camera={{ position: [2.5, 1.8, 3.5], fov: 35 }}
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
            style={{ width: '100%', height: '100%' }}
        >
            <SceneSetup />
            <CabinetModel
                url="/models/dulap.glb"
                materialColor={materialColor}
                roughness={roughness}
                metalness={metalness}
                dimensionScale={dimensionScale}
            />
            <ContactShadows position={[0, -1.05, 0]} opacity={0.3} scale={6} blur={2} far={2} />
            <Environment preset="apartment" />
            <OrbitControls
                enableDamping
                dampingFactor={0.06}
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI / 2.1}
                minDistance={2}
                maxDistance={7}
                target={[0, 0.5, 0]}
            />
        </Canvas>
    );
}

// Preload
useGLTF.preload('/models/dulap.glb');
