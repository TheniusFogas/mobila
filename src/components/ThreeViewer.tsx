'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Environment } from '@react-three/drei';

/* ─── constants ─── */
const T = 0.018; // 18mm panel

/* ─── Procedural HDR Environment (gradient sky dome) ─── */
function ProceduralEnvironment() {
    const { scene } = useThree();
    useEffect(() => {
        // Create a gradient sky texture
        const size = 256;
        const data = new Uint8Array(size * size * 4);
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const t = y / size;
                // Sky gradient: warm white top → beige bottom
                const r = Math.round(THREE.MathUtils.lerp(255, 230, t));
                const g = Math.round(THREE.MathUtils.lerp(252, 224, t));
                const b = Math.round(THREE.MathUtils.lerp(248, 210, t));
                const idx = (y * size + x) * 4;
                data[idx] = r; data[idx + 1] = g; data[idx + 2] = b; data[idx + 3] = 255;
            }
        }
        const tex = new THREE.DataTexture(data, size, size);
        tex.needsUpdate = true;
        // Use as environment map (simple)
        scene.background = new THREE.Color('#EDEAE4');
        scene.environmentIntensity = 1;
        return () => { };
    }, [scene]);
    return null;
}

/* ─── Wood grain canvas texture — STRONG CONTRAST, always visible ─── */
function createWoodTexture(hex: string): THREE.CanvasTexture {
    const W = 1024, H = 512;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d')!;

    // Parse base color
    const r0 = parseInt(hex.slice(1, 3), 16);
    const g0 = parseInt(hex.slice(3, 5), 16);
    const b0 = parseInt(hex.slice(5, 7), 16);
    // Luminance — for light colors we go darker, for dark colors we go lighter
    const lum = (r0 * 0.299 + g0 * 0.587 + b0 * 0.114) / 255;

    // Base coat
    ctx.fillStyle = hex;
    ctx.fillRect(0, 0, W, H);

    // Wide gradient banding — vertical panels
    for (let i = 0; i < 8; i++) {
        const x = (i / 8) * W + Math.random() * 40;
        const bw = 40 + Math.random() * 80;
        const g = ctx.createLinearGradient(x - bw, 0, x + bw, 0);
        const a = 0.06 + Math.random() * 0.10;
        const dark = Math.random() > 0.5;
        const rgba = dark
            ? `rgba(${Math.max(0, r0 - 55)},${Math.max(0, g0 - 40)},${Math.max(0, b0 - 25)},${a})`
            : `rgba(${Math.min(255, r0 + 40)},${Math.min(255, g0 + 30)},${Math.min(255, b0 + 18)},${a * 0.7})`;
        g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, rgba); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }

    const rng = (min: number, max: number) => min + Math.random() * (max - min);

    // PROMINENT grain lines — absolute dark/light contrast, not relative
    for (let i = 0; i < 80; i++) {
        const x = rng(0, W);
        const lineW = rng(0.5, 3.8);
        const isDark = Math.random() > 0.38;
        // Use absolute dark-brown for light woods, absolute cream for dark woods
        let r: number, g: number, b: number, alpha: number;
        if (isDark) {
            if (lum > 0.5) {
                // Light wood → dark espresso lines
                r = Math.max(0, r0 - Math.round(rng(40, 80)));
                g = Math.max(0, g0 - Math.round(rng(35, 65)));
                b = Math.max(0, b0 - Math.round(rng(20, 45)));
                alpha = rng(0.18, 0.38);
            } else {
                // Dark wood → medium dark lines
                r = Math.max(0, r0 - Math.round(rng(20, 50)));
                g = Math.max(0, g0 - Math.round(rng(18, 42)));
                b = Math.max(0, b0 - Math.round(rng(10, 28)));
                alpha = rng(0.22, 0.45);
            }
        } else {
            if (lum > 0.5) {
                // Light wood → platinum highlight
                r = Math.min(255, r0 + Math.round(rng(18, 42)));
                g = Math.min(255, g0 + Math.round(rng(14, 34)));
                b = Math.min(255, b0 + Math.round(rng(8, 22)));
                alpha = rng(0.10, 0.22);
            } else {
                // Dark wood → lighter grain highlight
                r = Math.min(255, r0 + Math.round(rng(30, 65)));
                g = Math.min(255, g0 + Math.round(rng(25, 52)));
                b = Math.min(255, b0 + Math.round(rng(15, 35)));
                alpha = rng(0.18, 0.35);
            }
        }

        ctx.beginPath();
        ctx.moveTo(x + rng(-3, 3), 0);
        let cy = 0, cx2 = x;
        while (cy < H) {
            const step = rng(15, 55);
            cx2 += rng(-7, 7);
            ctx.quadraticCurveTo(cx2 + rng(-12, 12), cy + step * 0.5, cx2, cy + step);
            cy += step;
        }
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.lineWidth = lineW;
        ctx.stroke();
    }

    // Fine wood pores — vertical micro-scratches
    for (let i = 0; i < 4000; i++) {
        const px = Math.random() * W;
        const py = Math.random() * H;
        const len = rng(3, 16);
        const isDark = Math.random() > 0.5;
        const a = rng(0.06, 0.18);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + rng(-0.8, 0.8), py + len);
        if (isDark) {
            const dr = lum > 0.5 ? -rng(30, 60) : -rng(15, 35);
            ctx.strokeStyle = `rgba(${Math.max(0, r0 + dr)},${Math.max(0, g0 + Math.round(dr * 0.8))},${Math.max(0, b0 + Math.round(dr * 0.5))},${a})`;
        } else {
            const dr = lum > 0.5 ? rng(15, 35) : rng(25, 55);
            ctx.strokeStyle = `rgba(${Math.min(255, r0 + dr)},${Math.min(255, g0 + Math.round(dr * 0.8))},${Math.min(255, b0 + Math.round(dr * 0.5))},${a * 0.6})`;
        }
        ctx.lineWidth = rng(0.3, 1.0);
        ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1.5, 3.5);
    tex.anisotropy = 16;
    tex.needsUpdate = true;
    return tex;
}

/* ─── Normal map for wood (fake depth) ─── */
function createWoodNormal(): THREE.CanvasTexture {
    const W = 512, H = 256;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#8080ff'; // flat normal baseline
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < 40; i++) {
        const x = Math.random() * W;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        let cy = 0, cx2 = x;
        while (cy < H) {
            const step = 20 + Math.random() * 40;
            cx2 += (Math.random() - 0.5) * 6;
            ctx.lineTo(cx2, cy + step);
            cy += step;
        }
        ctx.strokeStyle = `rgba(${100 + Math.round(Math.random() * 40)},${120 + Math.round(Math.random() * 30)},255,0.6)`;
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.stroke();
    }

    const n = new THREE.CanvasTexture(c);
    n.wrapS = n.wrapT = THREE.RepeatWrapping;
    n.repeat.set(2, 4);
    n.needsUpdate = true;
    return n;
}

/* ─── Material factory (no module-level cache — color changes need fresh textures) ─── */
function getWoodMat(hex: string, roughness = 0.55, metalness = 0.0): THREE.MeshStandardMaterial {
    if (typeof window === 'undefined') return new THREE.MeshStandardMaterial({ color: hex });
    const tex = createWoodTexture(hex);
    const norm = createWoodNormal();
    return new THREE.MeshStandardMaterial({
        map: tex,
        normalMap: norm,
        normalScale: new THREE.Vector2(0.55, 0.55),
        roughness,
        metalness,
    });
}

/* ─── Studio Lighting — 3-point + rim ─── */
function StudioLights({ cabinetW, cabinetH }: { cabinetW: number; cabinetH: number }) {
    const { scene } = useThree();
    useEffect(() => {
        const lights: THREE.Light[] = [];

        // Key light — warm, strong, from top-left
        const key = new THREE.DirectionalLight('#fff8f0', 2.8);
        key.position.set(-cabinetW * 1.5, cabinetH * 1.6, cabinetH * 1.2);
        key.castShadow = true;
        key.shadow.mapSize.setScalar(4096);
        key.shadow.camera.near = 0.1;
        key.shadow.camera.far = 20;
        key.shadow.camera.left = -cabinetW * 2;
        key.shadow.camera.right = cabinetW * 2;
        key.shadow.camera.top = cabinetH * 1.5;
        key.shadow.camera.bottom = -cabinetH * 0.5;
        key.shadow.bias = -0.0002;
        key.shadow.radius = 3;
        lights.push(key);

        // Fill light — cool, soft, from right
        const fill = new THREE.DirectionalLight('#d8e8ff', 0.9);
        fill.position.set(cabinetW * 2, cabinetH * 0.8, cabinetH * 0.6);
        lights.push(fill);

        // Rim light — from behind, warm accent
        const rim = new THREE.DirectionalLight('#ffead0', 1.2);
        rim.position.set(cabinetW * 0.5, cabinetH * 1.4, -cabinetH * 0.8);
        lights.push(rim);

        // Hemisphere — sky/ground ambient
        const hemi = new THREE.HemisphereLight('#e8ecff', '#c4b898', 0.7);
        lights.push(hemi);

        // Floor bounce
        const bounce = new THREE.PointLight('#fff5e8', 0.5, cabinetH * 3);
        bounce.position.set(0, 0, cabinetH * 0.8);
        lights.push(bounce);

        lights.forEach(l => scene.add(l));
        return () => lights.forEach(l => scene.remove(l));
    }, [scene, cabinetW, cabinetH]);
    return null;
}

/* ─── Polished marble floor ─── */
function Floor() {
    const tex = useMemo(() => {
        if (typeof window === 'undefined') return null;
        const W = 512, H = 512;
        const c = document.createElement('canvas');
        c.width = W; c.height = H;
        const ctx = c.getContext('2d')!;
        ctx.fillStyle = '#E8E4DC';
        ctx.fillRect(0, 0, W, H);
        // Subtle tile grid
        ctx.strokeStyle = 'rgba(0,0,0,0.06)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 8; i++) {
            ctx.beginPath(); ctx.moveTo(i * W / 8, 0); ctx.lineTo(i * W / 8, H); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i * H / 8); ctx.lineTo(W, i * H / 8); ctx.stroke();
        }
        const t = new THREE.CanvasTexture(c);
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(8, 8);
        t.needsUpdate = true;
        return t;
    }, []);

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[40, 40]} />
            <meshStandardMaterial
                map={tex ?? undefined}
                color="#E8E4DC"
                roughness={0.18}
                metalness={0.05}
                envMapIntensity={0.4}
            />
        </mesh>
    );
}

/* ─── Back wall ─── */
function BackWall({ cabinetH }: { cabinetH: number }) {
    return (
        <mesh position={[0, cabinetH * 0.6, -4]} receiveShadow>
            <planeGeometry args={[40, cabinetH * 2.5]} />
            <meshStandardMaterial color="#F2EFE9" roughness={0.95} />
        </mesh>
    );
}

/* ─── Human silhouette ─── */
function HumanSilhouette({ x }: { x: number }) {
    const tex = useMemo(() => {
        if (typeof window === 'undefined') return null;
        const W = 200, H = 480;
        const c = document.createElement('canvas');
        c.width = W; c.height = H;
        const ctx = c.getContext('2d')!;
        ctx.fillStyle = 'rgba(80,70,60,0.22)';
        ctx.beginPath(); ctx.ellipse(W / 2, 36, 22, 28, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.rect(W / 2 - 9, 62, 18, 16); ctx.fill();
        const body = new Path2D();
        body.moveTo(W / 2 - 48, 78); body.bezierCurveTo(W / 2 - 52, 90, W / 2 - 38, 140, W / 2 - 32, 195);
        body.lineTo(W / 2 - 24, 260); body.lineTo(W / 2 + 24, 260); body.lineTo(W / 2 + 32, 195);
        body.bezierCurveTo(W / 2 + 38, 140, W / 2 + 52, 90, W / 2 + 48, 78);
        body.bezierCurveTo(W / 2 + 34, 68, W / 2 + 15, 64, W / 2, 65);
        body.bezierCurveTo(W / 2 - 15, 64, W / 2 - 34, 68, W / 2 - 48, 78);
        ctx.fill(body);
        const al = new Path2D();
        al.moveTo(W / 2 - 48, 78); al.bezierCurveTo(W / 2 - 68, 120, W / 2 - 74, 190, W / 2 - 62, 248);
        al.lineTo(W / 2 - 50, 242); al.bezierCurveTo(W / 2 - 60, 188, W / 2 - 52, 122, W / 2 - 34, 94); al.closePath(); ctx.fill(al);
        const ar = new Path2D();
        ar.moveTo(W / 2 + 48, 78); ar.bezierCurveTo(W / 2 + 68, 120, W / 2 + 74, 190, W / 2 + 62, 248);
        ar.lineTo(W / 2 + 50, 242); ar.bezierCurveTo(W / 2 + 60, 188, W / 2 + 52, 122, W / 2 + 34, 94); ar.closePath(); ctx.fill(ar);
        ctx.beginPath(); ctx.ellipse(W / 2, 260, 32, 14, 0, 0, Math.PI); ctx.fill();
        const ll = new Path2D();
        ll.moveTo(W / 2 - 26, 260); ll.bezierCurveTo(W / 2 - 36, 330, W / 2 - 40, 390, W / 2 - 38, 475);
        ll.lineTo(W / 2 - 14, 475); ll.bezierCurveTo(W / 2 - 14, 388, W / 2 - 10, 326, W / 2 - 2, 260); ll.closePath(); ctx.fill(ll);
        const rl = new Path2D();
        rl.moveTo(W / 2 + 26, 260); rl.bezierCurveTo(W / 2 + 36, 330, W / 2 + 40, 390, W / 2 + 38, 475);
        rl.lineTo(W / 2 + 14, 475); rl.bezierCurveTo(W / 2 + 14, 388, W / 2 + 10, 326, W / 2 + 2, 260); rl.closePath(); ctx.fill(rl);
        const t = new THREE.CanvasTexture(c);
        t.needsUpdate = true;
        return t;
    }, []);
    if (!tex) return null;
    const PH = 1.75, PW = PH * (200 / 480);
    return (
        <mesh position={[x - PW * 0.55, PH / 2, 0.12]}>
            <planeGeometry args={[PW, PH]} />
            <meshBasicMaterial map={tex} transparent alphaTest={0.015} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
    );
}

/* ─── Bar handle ─── */
function Handle3D({ w, y, z }: { w: number; y: number; z: number }) {
    const barLen = Math.min(w * 0.28, 0.14);
    const brushed = new THREE.MeshStandardMaterial({ color: '#C8C0B4', roughness: 0.12, metalness: 0.92 });
    return (
        <group position={[0, y, z]}>
            <mesh rotation={[0, 0, Math.PI / 2]} material={brushed}><cylinderGeometry args={[0.0045, 0.0045, barLen, 12]} /></mesh>
            <mesh position={[-barLen / 2, 0, -0.013]} material={brushed}><cylinderGeometry args={[0.004, 0.004, 0.024, 8]} /></mesh>
            <mesh position={[barLen / 2, 0, -0.013]} material={brushed}><cylinderGeometry args={[0.004, 0.004, 0.024, 8]} /></mesh>
        </group>
    );
}

/* ─── Hinge ─── */
function Hinge3D({ y }: { y: number }) {
    const m = new THREE.MeshStandardMaterial({ color: '#A8A098', roughness: 0.25, metalness: 0.75 });
    return (
        <group position={[0, y, 0]}>
            <mesh position={[-0.022, 0, 0]} material={m}><boxGeometry args={[0.02, 0.032, 0.006]} /></mesh>
            <mesh position={[0.008, 0, 0.003]} material={m}><boxGeometry args={[0.024, 0.032, 0.006]} /></mesh>
            <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} material={m}><cylinderGeometry args={[0.005, 0.005, 0.034, 8]} /></mesh>
        </group>
    );
}

/* ─── Animated Door ─── */
function Door({ colW, H, openRight, extHex }: { colW: number; H: number; openRight: boolean; extHex: string }) {
    const groupRef = useRef<THREE.Group>(null);
    const [open, setOpen] = useState(false);
    const targetY = open ? (openRight ? -Math.PI * 0.47 : Math.PI * 0.47) : 0;
    const curY = useRef(0);
    useFrame(() => {
        if (!groupRef.current) return;
        curY.current = THREE.MathUtils.lerp(curY.current, targetY, 0.08);
        groupRef.current.rotation.y = curY.current;
    });
    const mat = useMemo(() => getWoodMat(extHex, 0.68), [extHex]);
    const dw = colW - 2 * T - 0.002;
    const dh = H - T * 2 - 0.004;
    const hingeX = openRight ? -colW / 2 + T : colW / 2 - T;
    return (
        <group ref={groupRef} position={[hingeX, 0, 0]}>
            <mesh position={[openRight ? dw / 2 : -dw / 2, dh / 2 + T, T / 2]}
                onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
                castShadow material={mat}>
                <boxGeometry args={[dw, dh, T]} />
            </mesh>
            {[0.2, 0.8].map((f, i) => <Hinge3D key={i} y={dh * f + T} />)}
            <Handle3D w={dw} y={dh * 0.42 + T} z={T + 0.018} />
        </group>
    );
}

/* ─── Animated Drawer ─── */
function Drawer({ colW, D, h, y, extHex }: { colW: number; D: number; h: number; y: number; extHex: string }) {
    const ref = useRef<THREE.Group>(null);
    const [open, setOpen] = useState(false);
    const slideZ = D * 0.82;
    const curZ = useRef(0);
    const tw = colW - 2 * T - 0.004;
    const td = D - T;
    const mat = useMemo(() => getWoodMat(extHex, 0.68), [extHex]);
    const sideMat = new THREE.MeshStandardMaterial({ color: '#C8C0B0', roughness: 0.85 });
    useFrame(() => {
        if (!ref.current) return;
        curZ.current = THREE.MathUtils.lerp(curZ.current, open ? slideZ : 0, 0.08);
        ref.current.position.z = curZ.current;
    });
    return (
        <group ref={ref} position={[0, y + h / 2, 0]}>
            <mesh position={[0, 0, T / 2]} onClick={e => { e.stopPropagation(); setOpen(o => !o); }} castShadow material={mat}>
                <boxGeometry args={[tw, h - 0.003, T]} />
            </mesh>
            <Handle3D w={tw} y={0} z={T + 0.018} />
            <mesh position={[0, -h / 2 + 0.008, -td / 2]} material={sideMat}><boxGeometry args={[tw - 0.008, 0.012, td]} /></mesh>
            <mesh position={[-tw / 2 + 0.006, 0, -td / 2]} material={sideMat}><boxGeometry args={[0.012, h * 0.85, td]} /></mesh>
            <mesh position={[tw / 2 - 0.006, 0, -td / 2]} material={sideMat}><boxGeometry args={[0.012, h * 0.85, td]} /></mesh>
            <mesh position={[0, 0, -td + 0.006]} material={sideMat}><boxGeometry args={[tw - 0.02, h * 0.85, 0.012]} /></mesh>
        </group>
    );
}

/* ─── Plinth ─── */
function Plinth({ colW, D, extHex }: { colW: number; D: number; extHex: string }) {
    const mat = useMemo(() => getWoodMat(extHex, 0.88), [extHex]);
    return (
        <mesh position={[0, 0.045, 0]} material={mat} castShadow receiveShadow>
            <boxGeometry args={[colW - 0.002, 0.09, D * 0.7]} />
        </mesh>
    );
}

/* ─── One Column ─── */
function Column({ x, colW, H, D, extHex, intHex, backPanel, variant }:
    { x: number; colW: number; H: number; D: number; extHex: string; intHex: string; backPanel: boolean; variant: 'open' | 'shelves' | 'drawers' | 'door' }) {
    const extMat = useMemo(() => getWoodMat(extHex, 0.72), [extHex]);
    const intMat = useMemo(() => getWoodMat(intHex, 0.82), [intHex]);
    const innerW = colW - 2 * T;
    const innerD = D - T;

    return (
        <group position={[x, 0, 0]}>
            <mesh position={[-colW / 2 + T / 2, H / 2, 0]} castShadow receiveShadow material={extMat}><boxGeometry args={[T, H, D]} /></mesh>
            <mesh position={[colW / 2 - T / 2, H / 2, 0]} castShadow receiveShadow material={extMat}><boxGeometry args={[T, H, D]} /></mesh>
            <mesh position={[0, H - T / 2, 0]} castShadow material={extMat}><boxGeometry args={[innerW, T, D]} /></mesh>
            <mesh position={[0, T / 2, 0]} castShadow material={extMat}><boxGeometry args={[innerW, T, D]} /></mesh>
            {backPanel && (
                <mesh position={[0, H / 2, -D / 2 + 0.005]} material={intMat}>
                    <boxGeometry args={[innerW, H - 2 * T, 0.006]} />
                </mesh>
            )}
            <Plinth colW={colW} D={D} extHex={extHex} />

            {variant === 'shelves' && [0.33, 0.54, 0.73].map((f, i) => (
                <mesh key={i} position={[0, H * f, 0]} receiveShadow material={intMat}>
                    <boxGeometry args={[innerW - 0.002, T * 0.85, innerD]} />
                </mesh>
            ))}

            {variant === 'drawers' && (() => {
                const n = 4, gap = 0.004;
                const dh = (H - 2 * T - gap * (n + 1)) / n;
                return Array.from({ length: n }).map((_, i) => (
                    <Drawer key={i} colW={colW} D={D} h={dh} y={T + gap + i * (dh + gap)} extHex={extHex} />
                ));
            })()}

            {variant === 'door' && <Door colW={colW} H={H} openRight extHex={extHex} />}

            {variant === 'open' && (
                <mesh position={[0, H * 0.82, -D * 0.15]} rotation={[0, 0, Math.PI / 2]} castShadow>
                    <cylinderGeometry args={[0.007, 0.007, innerW - 0.02, 14]} />
                    <meshStandardMaterial color="#C8C0B4" roughness={0.12} metalness={0.75} />
                </mesh>
            )}
        </group>
    );
}

/* ─── Auto-frame camera ─── */
function CameraFramer({ W, H, columns }: { W: number; H: number; columns: number }) {
    const { camera } = useThree();
    useEffect(() => {
        const fov = (camera as THREE.PerspectiveCamera).fov ?? 28;
        const diag = Math.sqrt((W * 1.1) ** 2 + H ** 2);
        const dist = (diag / 2) / Math.tan((fov * Math.PI) / 360) * 1.22;
        // Sexy 3/4 angle — lower horizon, more dramatic
        camera.position.set(-W * 0.28, H * 0.38, dist * 0.88);
        camera.lookAt(W * 0.06, H * 0.40, 0);
        camera.updateProjectionMatrix();
    }, [W, H, columns, camera]);
    return null;
}

/* ─── Column edit icon ─── */
function ColumnEditIcon({ x, idx, onEdit }: { x: number; idx: number; onEdit: (i: number) => void }) {
    return (
        <Html position={[x, -0.05, 0.05]} center zIndexRange={[10, 20]} style={{ pointerEvents: 'none' }}>
            <button onClick={e => { e.stopPropagation(); onEdit(idx); }}
                style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.96)', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.14)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#444', pointerEvents: 'auto' }}>
                ✎
            </button>
        </Html>
    );
}

/* ─── Props ─── */
export interface ConfiguratorProps {
    exteriorColor: string;
    interiorColor: string;
    width: number;
    height: number;
    depth: number;
    columns: number;
    backPanel: boolean;
    columnVariants: ('open' | 'shelves' | 'drawers' | 'door')[];
    onColumnEdit?: (i: number) => void;
}

export default function ThreeViewer(props: ConfiguratorProps) {
    const { exteriorColor, interiorColor, width, height, depth, columns, backPanel, columnVariants, onColumnEdit } = props;
    const W = width / 1000, H = height / 1000, D = depth / 1000;
    const colW = W / columns;
    const startX = -(W / 2) + colW / 2;

    return (
        <Canvas
            shadows={{ type: THREE.PCFSoftShadowMap }}
            camera={{ position: [-0.8, 0.9, 3.0], fov: 28 }}
            gl={{
                antialias: true,
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.18,
                outputColorSpace: THREE.SRGBColorSpace,
            }}
            style={{ width: '100%', height: '100%' }}
        >
            <ProceduralEnvironment />
            <StudioLights cabinetW={W} cabinetH={H} />
            <CameraFramer W={W} H={H} columns={columns} />

            <Floor />
            <BackWall cabinetH={H} />

            <fog attach="fog" args={['#EDEAE4', 10, 28]} />

            {Array.from({ length: columns }).map((_, i) => {
                const variant = columnVariants[i] ?? 'shelves';
                const cx = startX + i * colW;
                return (
                    <group key={i}>
                        <Column x={cx} colW={colW} H={H} D={D}
                            extHex={exteriorColor} intHex={interiorColor}
                            backPanel={backPanel} variant={variant} />
                        {onColumnEdit && <ColumnEditIcon x={cx} idx={i} onEdit={onColumnEdit} />}
                    </group>
                );
            })}

            <HumanSilhouette x={-W / 2} />

            <OrbitControls
                enableDamping dampingFactor={0.06}
                minPolarAngle={Math.PI * 0.06}
                maxPolarAngle={Math.PI * 0.46}
                minDistance={0.6} maxDistance={18}
                target={[0, H * 0.40, 0]}
                enablePan={false}
            />
        </Canvas>
    );
}
