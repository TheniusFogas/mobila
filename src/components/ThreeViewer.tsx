'use client';

import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, ContactShadows } from '@react-three/drei';

/**
 * Smart material handler — applies colors selectively by mesh name.
 * 
 * Strategy:
 * - If mesh name contains "interior|inside|innere|inner|interieur" → interiorColor
 * - If mesh name contains "hardware|hinge|rail|screw|handle|knob|bolt|bracket" → keep original
 * - Everything else (panel, door, carcass, side, top, bottom, shelf) → exteriorColor
 */
function applySelectiveMaterials(
    object: THREE.Object3D,
    exteriorColor: string,
    interiorColor: string,
    exteriorRoughness: number,
    exteriorMetalness: number
) {
    const extColor = new THREE.Color(exteriorColor);
    const intColor = new THREE.Color(interiorColor);

    const INTERIOR_KEYWORDS = /interior|inside|inner|innere|interieur|innen|interni/i;
    const HARDWARE_KEYWORDS = /hardware|hinge|rail|screw|handle|knob|bolt|bracket|cam|minifix|dowel|hef|band/i;

    object.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const name = child.name.toLowerCase();
        const isHardware = HARDWARE_KEYWORDS.test(name);
        const isInterior = INTERIOR_KEYWORDS.test(name);
        if (isHardware) return; // Keep original hardware materials

        child.castShadow = true;
        child.receiveShadow = true;

        const applyToMat = (mat: THREE.Material) => {
            if (!(mat instanceof THREE.MeshStandardMaterial)) return;
            if (isInterior) {
                mat.color.set(intColor);
                mat.roughness = 0.9;
                mat.metalness = 0;
            } else {
                mat.color.set(extColor);
                mat.roughness = exteriorRoughness;
                mat.metalness = exteriorMetalness;
            }
            mat.needsUpdate = true;
        };

        if (Array.isArray(child.material)) child.material.forEach(applyToMat);
        else applyToMat(child.material);
    });
}

interface ModuleProps {
    position: [number, number, number];
    exteriorColor: string;
    interiorColor: string;
    roughness: number;
    metalness: number;
    scaleY: number;
    scaleZ: number;
}

function WardrobeModule({ position, exteriorColor, interiorColor, roughness, metalness, scaleY, scaleZ }: ModuleProps) {
    const { scene } = useGLTF('/models/dulap.glb');

    const cloned = useMemo(() => {
        const clone = scene.clone(true);
        // Deep clone all materials to avoid shared-material mutation
        clone.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                if (Array.isArray(child.material)) {
                    child.material = child.material.map(m => m.clone());
                } else {
                    child.material = child.material.clone();
                }
            }
        });
        return clone;
    }, [scene]);

    useEffect(() => {
        applySelectiveMaterials(cloned, exteriorColor, interiorColor, roughness, metalness);
    }, [cloned, exteriorColor, interiorColor, roughness, metalness]);

    return (
        <group position={position} scale={[1, scaleY, scaleZ]}>
            <primitive object={cloned} />
        </group>
    );
}

function SceneSetup() {
    const { scene } = useThree();
    useEffect(() => {
        scene.background = new THREE.Color('#E8E4DC');
        const ambient = new THREE.AmbientLight(0xffffff, 0.9);
        const key = new THREE.DirectionalLight(0xfff8f0, 1.2);
        key.position.set(3, 6, 5);
        key.castShadow = true;
        key.shadow.mapSize.setScalar(1024);
        const fill = new THREE.DirectionalLight(0xf0f4ff, 0.3);
        fill.position.set(-4, 3, -2);
        scene.add(ambient, key, fill);
        return () => { scene.remove(ambient, key, fill); };
    }, [scene]);
    return null;
}

const MODULE_W = 0.9; // 900mm in meters
const BASE_H = 2100;
const BASE_D = 600;

interface Props {
    exteriorColor: string;
    interiorColor: string;
    roughness: number;
    metalness: number;
    width: number;
    height: number;
    depth: number;
}

export default function ThreeViewer({ exteriorColor, interiorColor, roughness, metalness, width, height, depth }: Props) {
    const moduleCount = Math.max(1, Math.round(width / 900));
    const scaleY = height / BASE_H;
    const scaleZ = depth / BASE_D;
    const startX = -((moduleCount - 1) * MODULE_W) / 2;
    const camZ = moduleCount * MODULE_W * 0.9 + 2.4;
    const camX = moduleCount * MODULE_W * 0.5 + 0.8;

    return (
        <Canvas
            shadows
            camera={{ position: [camX, 1.3, camZ], fov: 33 }}
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
            style={{ width: '100%', height: '100%' }}
        >
            <SceneSetup />
            {Array.from({ length: moduleCount }).map((_, i) => (
                <WardrobeModule
                    key={i}
                    position={[startX + i * MODULE_W, 0, 0]}
                    exteriorColor={exteriorColor}
                    interiorColor={interiorColor}
                    roughness={roughness}
                    metalness={metalness}
                    scaleY={scaleY}
                    scaleZ={scaleZ}
                />
            ))}
            <ContactShadows position={[0, -1.05 * scaleY, 0]} opacity={0.2} scale={10} blur={2.5} far={2} />
            <OrbitControls
                enableDamping dampingFactor={0.05}
                minPolarAngle={Math.PI * 0.15}
                maxPolarAngle={Math.PI * 0.55}
                minDistance={1.2} maxDistance={14}
                target={[0, 0.45 * scaleY, 0]}
                enablePan={false}
            />
        </Canvas>
    );
}

useGLTF.preload('/models/dulap.glb');
