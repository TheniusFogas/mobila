'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, ContactShadows } from '@react-three/drei';

/* ─── Smart selective material application ─── */
function applyMaterials(
    obj: THREE.Object3D,
    extColor: string,
    intColor: string,
    roughness: number,
    metalness: number
) {
    const ext = new THREE.Color(extColor);
    const int = new THREE.Color(intColor);
    const INTERIOR = /interior|inside|inner|innere|interieur|innen/i;
    const HARDWARE = /hardware|hinge|rail|screw|handle|knob|bolt|cam|minifix|hef|band|schraube/i;

    obj.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const name = child.name;
        if (HARDWARE.test(name)) return;
        const isInt = INTERIOR.test(name);
        child.castShadow = true;
        child.receiveShadow = true;
        const patch = (m: THREE.Material) => {
            if (!(m instanceof THREE.MeshStandardMaterial)) return;
            m.color.set(isInt ? int : ext);
            m.roughness = isInt ? 0.9 : roughness;
            m.metalness = isInt ? 0 : metalness;
            m.needsUpdate = true;
        };
        if (Array.isArray(child.material)) child.material.forEach(patch);
        else patch(child.material);
    });
}

/* ─── Single wardrobe module (no X scaling!) ─── */
function WardrobeModule({ pos, extColor, intColor, roughness, metalness, scaleY, scaleZ }: {
    pos: [number, number, number];
    extColor: string; intColor: string;
    roughness: number; metalness: number;
    scaleY: number; scaleZ: number;
}) {
    const { scene } = useGLTF('/models/dulap.glb');
    const cloned = useMemo(() => {
        const c = scene.clone(true);
        c.traverse(ch => {
            if (ch instanceof THREE.Mesh) {
                ch.material = Array.isArray(ch.material)
                    ? ch.material.map(m => m.clone())
                    : ch.material.clone();
            }
        });
        return c;
    }, [scene]);

    useEffect(() => {
        applyMaterials(cloned, extColor, intColor, roughness, metalness);
    }, [cloned, extColor, intColor, roughness, metalness]);

    return (
        <group position={pos} scale={[1, scaleY, scaleZ]}>
            <primitive object={cloned} />
        </group>
    );
}

/* ─── Human silhouette as 3D in-scene sprite ─── */
function HumanSilhouette({ cabinetHeight }: { cabinetHeight: number }) {
    // Draw silhouette on an off-screen canvas → CanvasTexture
    const texture = useMemo(() => {
        const W = 256, H = 512;
        const canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext('2d')!;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(120,120,120,0.55)';

        // Draw a smooth human silhouette using bezier paths
        // Scale: H=512px = 1.75m person
        const cx = W / 2;

        // Head (ellipse)
        ctx.beginPath();
        ctx.ellipse(cx, 58, 32, 40, 0, 0, Math.PI * 2);
        ctx.fill();

        // Neck
        ctx.beginPath();
        ctx.roundRect(cx - 16, 94, 32, 24, 6);
        ctx.fill();

        // Shoulders + torso
        ctx.beginPath();
        ctx.moveTo(cx - 66, 116);
        ctx.bezierCurveTo(cx - 70, 120, cx - 60, 155, cx - 52, 160);
        ctx.lineTo(cx - 38, 280);
        ctx.lineTo(cx + 38, 280);
        ctx.lineTo(cx + 52, 160);
        ctx.bezierCurveTo(cx + 60, 155, cx + 70, 120, cx + 66, 116);
        ctx.bezierCurveTo(cx + 50, 108, cx + 20, 104, cx, 104);
        ctx.bezierCurveTo(cx - 20, 104, cx - 50, 108, cx - 66, 116);
        ctx.fill();

        // Left arm
        ctx.beginPath();
        ctx.moveTo(cx - 66, 116);
        ctx.bezierCurveTo(cx - 80, 140, cx - 90, 220, cx - 78, 280);
        ctx.lineTo(cx - 60, 278);
        ctx.bezierCurveTo(cx - 70, 220, cx - 58, 150, cx - 50, 130);
        ctx.closePath();
        ctx.fill();

        // Right arm
        ctx.beginPath();
        ctx.moveTo(cx + 66, 116);
        ctx.bezierCurveTo(cx + 80, 140, cx + 90, 220, cx + 78, 280);
        ctx.lineTo(cx + 60, 278);
        ctx.bezierCurveTo(cx + 70, 220, cx + 58, 150, cx + 50, 130);
        ctx.closePath();
        ctx.fill();

        // Left leg
        ctx.beginPath();
        ctx.moveTo(cx - 38, 278);
        ctx.bezierCurveTo(cx - 46, 340, cx - 52, 390, cx - 48, 500);
        ctx.lineTo(cx - 20, 500);
        ctx.bezierCurveTo(cx - 22, 390, cx - 18, 340, cx - 8, 278);
        ctx.closePath();
        ctx.fill();

        // Right leg
        ctx.beginPath();
        ctx.moveTo(cx + 38, 278);
        ctx.bezierCurveTo(cx + 46, 340, cx + 52, 390, cx + 48, 500);
        ctx.lineTo(cx + 20, 500);
        ctx.bezierCurveTo(cx + 22, 390, cx + 18, 340, cx + 8, 278);
        ctx.closePath();
        ctx.fill();

        const tex = new THREE.CanvasTexture(canvas);
        tex.needsUpdate = true;
        return tex;
    }, []);

    // The human is exactly 1.75m. Position them so feet are at ground (y=-cabinetHeight/2 in world space)
    // The module root is at y=0, bottom of module = -1*scaleY*...  actually model origin varies.
    // Simplest: feet at y=0 (ground level), head at y=1.75m
    const HUMAN_H = 1.75;
    const HUMAN_W = HUMAN_H * (256 / 512); // aspect ratio

    // Slight bob of the silhouette to the left of center
    const xOffset = -(Math.max(1, Math.round(cabinetHeight / 900)) * 0.9) / 2 - HUMAN_W * 0.7;

    return (
        <mesh position={[xOffset, HUMAN_H / 2, 0.05]}>
            <planeGeometry args={[HUMAN_W, HUMAN_H]} />
            <meshBasicMaterial
                map={texture}
                transparent
                alphaTest={0.05}
                depthWrite={false}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}

/* ─── Room (wall + floor) ─── */
function Room({ moduleCount, scaleY }: { moduleCount: number; scaleY: number }) {
    const roomW = moduleCount * 0.9 + 2.4;
    const roomH = 2.1 * scaleY + 0.6;

    // Wall behind the wardrobe
    const wallMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: new THREE.Color('#DEDAD4'), roughness: 1, metalness: 0,
    }), []);

    // Floor
    const floorMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: new THREE.Color('#CBC6BE'), roughness: 0.9, metalness: 0,
    }), []);

    return (
        <>
            {/* Back wall */}
            <mesh position={[0, roomH / 2 - 0.3, -0.32]} receiveShadow material={wallMat}>
                <planeGeometry args={[roomW, roomH + 0.6]} />
            </mesh>
            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0.4]} receiveShadow material={floorMat}>
                <planeGeometry args={[roomW, 3.5]} />
            </mesh>
        </>
    );
}

/* ─── Scene lighting ─── */
function SceneSetup() {
    const { scene } = useThree();
    useEffect(() => {
        scene.background = new THREE.Color('#E8E4DC');
        const ambient = new THREE.AmbientLight(0xffffff, 0.85);
        const key = new THREE.DirectionalLight(0xfffaf4, 1.2);
        key.position.set(3, 6, 5);
        key.castShadow = true;
        key.shadow.mapSize.setScalar(1024);
        key.shadow.camera.near = 0.5;
        key.shadow.camera.far = 20;
        const fill = new THREE.DirectionalLight(0xf0f4ff, 0.3);
        fill.position.set(-4, 3, -2);
        scene.add(ambient, key, fill);
        return () => { scene.remove(ambient, key, fill); };
    }, [scene]);
    return null;
}

/* ─── Props ─── */
const MODULE_W = 0.9;
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
    const camZ = moduleCount * MODULE_W * 0.9 + 2.6;
    const camX = moduleCount * MODULE_W * 0.4 + 0.5;

    return (
        <Canvas
            shadows
            camera={{ position: [camX, 1.2, camZ], fov: 32 }}
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
            style={{ width: '100%', height: '100%' }}
        >
            <SceneSetup />
            <Room moduleCount={moduleCount} scaleY={scaleY} />

            {Array.from({ length: moduleCount }).map((_, i) => (
                <WardrobeModule
                    key={i}
                    pos={[startX + i * MODULE_W, 0, 0]}
                    extColor={exteriorColor}
                    intColor={interiorColor}
                    roughness={roughness}
                    metalness={metalness}
                    scaleY={scaleY}
                    scaleZ={scaleZ}
                />
            ))}

            {/* Human silhouette — lives inside the 3D scene, orbits with camera */}
            <HumanSilhouette cabinetHeight={width} />

            <ContactShadows position={[0, 0, 0]} opacity={0.3} scale={10} blur={2} far={1} />

            <OrbitControls
                enableDamping dampingFactor={0.05}
                minPolarAngle={Math.PI * 0.1}
                maxPolarAngle={Math.PI * 0.52}
                minDistance={1.2} maxDistance={14}
                target={[0, 0.5 * scaleY, 0]}
                enablePan={false}
            />
        </Canvas>
    );
}

useGLTF.preload('/models/dulap.glb');
