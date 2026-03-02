'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, ContactShadows, Environment } from '@react-three/drei';

/* ===== Human Silhouette (1750mm average) ===== */
function HumanSilhouette() {
    const groupRef = useRef<THREE.Group>(null);
    // Simple blocky human silhouette using box meshes
    const mat = new THREE.MeshBasicMaterial({ color: '#D0C8BC', transparent: true, opacity: 0.6 });
    // Placed to the left of center
    const x = -1.1;
    return (
        <group position={[x, 0, 0.2]}>
            {/* Body trunk */}
            <mesh position={[0, 0.65, 0]} material={mat}>
                <boxGeometry args={[0.24, 0.52, 0.12]} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 1.05, 0]} material={mat}>
                <boxGeometry args={[0.17, 0.2, 0.14]} />
            </mesh>
            {/* Left leg */}
            <mesh position={[-0.07, 0.22, 0]} material={mat}>
                <boxGeometry args={[0.1, 0.44, 0.12]} />
            </mesh>
            {/* Right leg */}
            <mesh position={[0.07, 0.22, 0]} material={mat}>
                <boxGeometry args={[0.1, 0.44, 0.12]} />
            </mesh>
            {/* Left arm */}
            <mesh position={[-0.17, 0.66, 0]} material={mat}>
                <boxGeometry args={[0.07, 0.4, 0.1]} />
            </mesh>
            {/* Right arm */}
            <mesh position={[0.17, 0.66, 0]} material={mat}>
                <boxGeometry args={[0.07, 0.4, 0.1]} />
            </mesh>
        </group>
    );
}

/* ===== GLB Cabinet Model ===== */
interface ModelProps {
    url: string;
    materialColor: string;
    roughness: number;
    metalness: number;
    scaleX: number;
    scaleY: number;
    scaleZ: number;
}

function CabinetModel({ url, materialColor, roughness, metalness, scaleX, scaleY, scaleZ }: ModelProps) {
    const { scene } = useGLTF(url);
    const color = new THREE.Color(materialColor);
    const groupRef = useRef<THREE.Group>(null);

    useEffect(() => {
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                const applyMat = (mat: THREE.Material) => {
                    if (mat instanceof THREE.MeshStandardMaterial) {
                        mat.color.set(color);
                        mat.roughness = roughness;
                        mat.metalness = metalness;
                        mat.needsUpdate = true;
                    }
                };
                Array.isArray(child.material) ? child.material.forEach(applyMat) : applyMat(child.material);
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }, [scene, materialColor, roughness, metalness]);

    useEffect(() => {
        if (groupRef.current) {
            groupRef.current.scale.set(scaleX, scaleY, scaleZ);
        }
    }, [scaleX, scaleY, scaleZ]);

    const cloned = React.useMemo(() => scene.clone(), [scene]);
    return (
        <group ref={groupRef as React.RefObject<THREE.Group | null>}>
            <primitive object={cloned} />
        </group>
    );
}

/* ===== Scene Setup ===== */
function SceneSetup() {
    const { scene } = useThree();
    useEffect(() => {
        scene.background = new THREE.Color('#EAE6DF');
        const ambient = new THREE.AmbientLight(0xffffff, 0.9);
        const key = new THREE.DirectionalLight(0xfff8f0, 1.4);
        key.position.set(2, 5, 4);
        key.castShadow = true;
        key.shadow.mapSize.width = 1024;
        key.shadow.mapSize.height = 1024;
        key.shadow.camera.near = 0.5;
        key.shadow.camera.far = 20;
        const fill = new THREE.DirectionalLight(0xf0f4ff, 0.4);
        fill.position.set(-3, 2, -2);
        const rim = new THREE.DirectionalLight(0xffffff, 0.2);
        rim.position.set(0, -1, -4);
        scene.add(ambient, key, fill, rim);
        return () => { scene.remove(ambient, key, fill, rim); };
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

const BASE = { w: 900, h: 2100, d: 600 };

export default function ThreeViewer(props: ThreeViewerProps) {
    const { materialColor, roughness, metalness, width, height, depth } = props;
    const scaleX = width / BASE.w;
    const scaleY = height / BASE.h;
    const scaleZ = depth / BASE.d;

    return (
        <Canvas
            shadows
            camera={{ position: [2.2, 1.4, 3.8], fov: 32 }}
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
            style={{ width: '100%', height: '100%' }}
        >
            <SceneSetup />

            <CabinetModel
                url="/models/dulap.glb"
                materialColor={materialColor}
                roughness={roughness}
                metalness={metalness}
                scaleX={scaleX}
                scaleY={scaleY}
                scaleZ={scaleZ}
            />

            <HumanSilhouette />

            <ContactShadows
                position={[0, -1.05, 0]}
                opacity={0.25}
                scale={8}
                blur={2.5}
                far={2}
            />

            <OrbitControls
                enableDamping
                dampingFactor={0.05}
                minPolarAngle={Math.PI * 0.2}
                maxPolarAngle={Math.PI * 0.52}
                minDistance={1.8}
                maxDistance={6}
                target={[0, 0.6, 0]}
                enablePan={false}
            />
        </Canvas>
    );
}

useGLTF.preload('/models/dulap.glb');
