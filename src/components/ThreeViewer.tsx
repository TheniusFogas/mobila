'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, ContactShadows } from '@react-three/drei';

/* ─── Selective material application ─── */
function applyMaterials(obj: THREE.Object3D, extColor: string, intColor: string, roughness: number, metalness: number) {
    const ext = new THREE.Color(extColor);
    const int_ = new THREE.Color(intColor);
    const INTERIOR = /interior|inside|inner|innere|interieur/i;
    const HARDWARE = /hardware|hinge|rail|screw|handle|knob|bolt|cam|minifix/i;
    obj.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        if (HARDWARE.test(child.name)) return;
        const isInt = INTERIOR.test(child.name);
        child.castShadow = true;
        child.receiveShadow = true;
        const patch = (m: THREE.Material) => {
            if (!(m instanceof THREE.MeshStandardMaterial)) return;
            m.color.set(isInt ? int_ : ext);
            m.roughness = isInt ? 0.9 : roughness;
            m.metalness = isInt ? 0 : metalness;
            m.needsUpdate = true;
        };
        if (Array.isArray(child.material)) child.material.forEach(patch);
        else patch(child.material);
    });
}

/* ─── SVG Human Silhouette — vector-quality, drawn on canvas ─── */
function buildSilhouetteTexture(): THREE.CanvasTexture {
    const W = 320, H = 640;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d')!;
    const cx = W / 2;

    ctx.fillStyle = 'rgba(90,90,90,0.5)';

    // HEAD
    ctx.beginPath();
    ctx.ellipse(cx, 55, 36, 44, 0, 0, Math.PI * 2);
    ctx.fill();

    // NECK
    ctx.beginPath();
    ctx.roundRect(cx - 16, 95, 32, 30, 4);
    ctx.fill();

    // TORSO (shoulder width tapers to waist)
    const torso = new Path2D();
    torso.moveTo(cx - 72, 122);         // left shoulder
    torso.bezierCurveTo(cx - 75, 130, cx - 56, 165, cx - 48, 200);  // left side
    torso.bezierCurveTo(cx - 44, 215, cx - 38, 270, cx - 36, 292);  // left hip
    torso.lineTo(cx + 36, 292);         // waist
    torso.bezierCurveTo(cx + 38, 270, cx + 44, 215, cx + 48, 200);
    torso.bezierCurveTo(cx + 56, 165, cx + 75, 130, cx + 72, 122);
    torso.bezierCurveTo(cx + 52, 110, cx + 24, 104, cx, 104);
    torso.bezierCurveTo(cx - 24, 104, cx - 52, 110, cx - 72, 122);
    ctx.fill(torso);

    // LEFT ARM
    const armL = new Path2D();
    armL.moveTo(cx - 72, 122);
    armL.bezierCurveTo(cx - 92, 155, cx - 100, 220, cx - 90, 290);
    armL.bezierCurveTo(cx - 88, 300, cx - 84, 308, cx - 80, 312);
    armL.lineTo(cx - 64, 308);
    armL.bezierCurveTo(cx - 70, 298, cx - 72, 282, cx - 72, 260);
    armL.bezierCurveTo(cx - 70, 210, cx - 58, 158, cx - 52, 138);
    armL.closePath();
    ctx.fill(armL);

    // RIGHT ARM
    const armR = new Path2D();
    armR.moveTo(cx + 72, 122);
    armR.bezierCurveTo(cx + 92, 155, cx + 100, 220, cx + 90, 290);
    armR.bezierCurveTo(cx + 88, 300, cx + 84, 308, cx + 80, 312);
    armR.lineTo(cx + 64, 308);
    armR.bezierCurveTo(cx + 70, 298, cx + 72, 282, cx + 72, 260);
    armR.bezierCurveTo(cx + 70, 210, cx + 58, 158, cx + 52, 138);
    armR.closePath();
    ctx.fill(armR);

    // HIPS/PELVIS connector
    ctx.beginPath();
    ctx.ellipse(cx, 292, 48, 20, 0, 0, Math.PI);
    ctx.fill();

    // LEFT LEG
    const legL = new Path2D();
    legL.moveTo(cx - 36, 292);
    legL.bezierCurveTo(cx - 50, 360, cx - 58, 430, cx - 54, 515);
    legL.bezierCurveTo(cx - 54, 525, cx - 52, 532, cx - 48, 536);
    legL.lineTo(cx - 16, 536);
    legL.bezierCurveTo(cx - 18, 524, cx - 20, 498, cx - 18, 470);
    legL.bezierCurveTo(cx - 16, 430, cx - 10, 370, cx - 2, 292);
    legL.closePath();
    ctx.fill(legL);

    // RIGHT LEG
    const legR = new Path2D();
    legR.moveTo(cx + 36, 292);
    legR.bezierCurveTo(cx + 50, 360, cx + 58, 430, cx + 54, 515);
    legR.bezierCurveTo(cx + 54, 525, cx + 52, 532, cx + 48, 536);
    legR.lineTo(cx + 16, 536);
    legR.bezierCurveTo(cx + 18, 524, cx + 20, 498, cx + 18, 470);
    legR.bezierCurveTo(cx + 16, 430, cx + 10, 370, cx + 2, 292);
    legR.closePath();
    ctx.fill(legR);

    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
}

/* ─── Human silhouette plane — 1.75m in 3D space, moves with scene ─── */
function HumanSilhouette({ offsetX }: { offsetX: number }) {
    const texture = useMemo(() => typeof window !== 'undefined' ? buildSilhouetteTexture() : null, []);
    if (!texture) return null;
    const HUMAN_H = 1.75; // meters
    const HUMAN_W = HUMAN_H * (320 / 640);
    return (
        <mesh position={[offsetX - HUMAN_W / 2 - 0.08, HUMAN_H / 2, 0.02]}>
            <planeGeometry args={[HUMAN_W, HUMAN_H]} />
            <meshBasicMaterial map={texture} transparent alphaTest={0.04} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
    );
}

/* ─── Single wardrobe module ─── */
interface ModuleProps {
    pos: [number, number, number];
    extColor: string; intColor: string;
    roughness: number; metalness: number;
    scaleY: number; scaleZ: number;
    onWidth: (w: number) => void;
}

function WardrobeModule({ pos, extColor, intColor, roughness, metalness, scaleY, scaleZ, onWidth }: ModuleProps) {
    const { scene } = useGLTF('/models/dulap.glb');
    const measured = useRef(false);

    const cloned = useMemo(() => {
        const clone = scene.clone(true);
        clone.traverse(ch => {
            if (ch instanceof THREE.Mesh) {
                ch.material = Array.isArray(ch.material) ? ch.material.map(m => m.clone()) : ch.material.clone();
            }
        });
        return clone;
    }, [scene]);

    useEffect(() => {
        // Measure exact GLB width from bounding box (once)
        if (!measured.current) {
            const box = new THREE.Box3().setFromObject(scene);
            const size = new THREE.Vector3();
            box.getSize(size);
            onWidth(size.x); // report actual width to parent
            measured.current = true;
        }
        applyMaterials(cloned, extColor, intColor, roughness, metalness);
    }, [cloned, extColor, intColor, roughness, metalness, scene, onWidth]);

    return (
        <group position={pos} scale={[1, scaleY, scaleZ]}>
            <primitive object={cloned} />
        </group>
    );
}

/* ─── Room: wall + floor ─── */
function Room({ totalWidth, scaleY }: { totalWidth: number; scaleY: number }) {
    const wallMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#DEDAD4', roughness: 1, metalness: 0 }), []);
    const floorMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#CBC6BE', roughness: 0.9, metalness: 0 }), []);
    const roomW = totalWidth + 2.2;
    const roomH = 2.1 * scaleY + 0.8;
    return (
        <>
            <mesh position={[0, roomH / 2 - 0.3, -0.35]} receiveShadow material={wallMat}>
                <planeGeometry args={[roomW, roomH + 0.6]} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.3]} receiveShadow material={floorMat}>
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
        key.position.set(3, 6, 5); key.castShadow = true;
        key.shadow.mapSize.setScalar(1024);
        const fill = new THREE.DirectionalLight(0xf0f4ff, 0.3);
        fill.position.set(-4, 3, -2);
        scene.add(ambient, key, fill);
        return () => { scene.remove(ambient, key, fill); };
    }, [scene]);
    return null;
}

/* ─── Multi-module scene ─── */
const BASE_H = 2100, BASE_D = 600;

interface Props {
    exteriorColor: string; interiorColor: string;
    roughness: number; metalness: number;
    width: number; height: number; depth: number;
}

export default function ThreeViewer({ exteriorColor, interiorColor, roughness, metalness, width, height, depth }: Props) {
    const moduleCount = Math.max(1, Math.round(width / 900));
    const scaleY = height / BASE_H;
    const scaleZ = depth / BASE_D;

    // Measured from actual GLB bounding box — avoids hardcoded MODULE_W
    const [moduleW, setModuleW] = useState(0.9);
    const handleWidth = (w: number) => setModuleW(w);

    const totalWidth = moduleCount * moduleW;
    const startX = -(totalWidth / 2) + moduleW / 2;

    const camZ = totalWidth * 0.8 + 2.5;
    const camX = totalWidth * 0.3 + 0.4;

    return (
        <Canvas
            shadows
            camera={{ position: [camX, 1.2, camZ], fov: 32 }}
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
            style={{ width: '100%', height: '100%' }}
        >
            <SceneSetup />
            <Room totalWidth={totalWidth} scaleY={scaleY} />

            {Array.from({ length: moduleCount }).map((_, i) => (
                <WardrobeModule
                    key={i}
                    pos={[startX + i * moduleW, 0, 0]}
                    extColor={exteriorColor}
                    intColor={interiorColor}
                    roughness={roughness}
                    metalness={metalness}
                    scaleY={scaleY}
                    scaleZ={scaleZ}
                    onWidth={handleWidth}
                />
            ))}

            <HumanSilhouette offsetX={-(totalWidth / 2)} />

            <ContactShadows position={[0, 0, 0]} opacity={0.28} scale={12} blur={2} far={1} />
            <OrbitControls
                enableDamping dampingFactor={0.05}
                minPolarAngle={Math.PI * 0.1} maxPolarAngle={Math.PI * 0.52}
                minDistance={1.2} maxDistance={16}
                target={[0, 0.5 * scaleY, 0]}
                enablePan={false}
            />
        </Canvas>
    );
}

useGLTF.preload('/models/dulap.glb');
