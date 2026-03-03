'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';

/* ─── constants ─── */
const WALL = '#F0EDE8';
const FLOOR = '#E2DDD6';
const EDGE = '#C8BFAF';
const T = 0.018;   // panel thickness 18 mm

/* ─── Infinite floor + wall ─── */
function InfiniteRoom() {
    return (
        <group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[80, 80]} />
                <meshStandardMaterial color={FLOOR} roughness={1} />
            </mesh>
            <mesh position={[0, 20, -8]} receiveShadow>
                <planeGeometry args={[80, 40]} />
                <meshStandardMaterial color={WALL} roughness={1} />
            </mesh>
        </group>
    );
}

/* ─── SVG-traced human silhouette from the PNG reference ─── */
function HumanSilhouette({ x }: { x: number }) {
    const tex = useMemo(() => {
        if (typeof window === 'undefined') return null;
        const W = 200, H = 480;
        const c = document.createElement('canvas');
        c.width = W; c.height = H;
        const ctx = c.getContext('2d')!;
        ctx.fillStyle = 'rgba(60,55,50,0.28)';

        // Head
        ctx.beginPath();
        ctx.ellipse(W / 2, 36, 22, 28, 0, 0, Math.PI * 2);
        ctx.fill();

        // Neck
        ctx.beginPath();
        ctx.rect(W / 2 - 9, 62, 18, 16);
        ctx.fill();

        const body = new Path2D();
        body.moveTo(W / 2 - 48, 78);
        body.bezierCurveTo(W / 2 - 52, 90, W / 2 - 38, 140, W / 2 - 32, 195);
        body.lineTo(W / 2 - 24, 260);
        body.lineTo(W / 2 + 24, 260);
        body.lineTo(W / 2 + 32, 195);
        body.bezierCurveTo(W / 2 + 38, 140, W / 2 + 52, 90, W / 2 + 48, 78);
        body.bezierCurveTo(W / 2 + 34, 68, W / 2 + 15, 64, W / 2, 65);
        body.bezierCurveTo(W / 2 - 15, 64, W / 2 - 34, 68, W / 2 - 48, 78);
        ctx.fill(body);

        // left arm
        const al = new Path2D();
        al.moveTo(W / 2 - 48, 78);
        al.bezierCurveTo(W / 2 - 68, 120, W / 2 - 74, 190, W / 2 - 62, 248);
        al.lineTo(W / 2 - 50, 242);
        al.bezierCurveTo(W / 2 - 60, 188, W / 2 - 52, 122, W / 2 - 34, 94);
        al.closePath(); ctx.fill(al);

        // right arm
        const ar = new Path2D();
        ar.moveTo(W / 2 + 48, 78);
        ar.bezierCurveTo(W / 2 + 68, 120, W / 2 + 74, 190, W / 2 + 62, 248);
        ar.lineTo(W / 2 + 50, 242);
        ar.bezierCurveTo(W / 2 + 60, 188, W / 2 + 52, 122, W / 2 + 34, 94);
        ar.closePath(); ctx.fill(ar);

        // hips
        ctx.beginPath();
        ctx.ellipse(W / 2, 260, 32, 14, 0, 0, Math.PI);
        ctx.fill();

        // left leg
        const ll = new Path2D();
        ll.moveTo(W / 2 - 26, 260);
        ll.bezierCurveTo(W / 2 - 36, 330, W / 2 - 40, 390, W / 2 - 38, 475);
        ll.lineTo(W / 2 - 14, 475);
        ll.bezierCurveTo(W / 2 - 14, 388, W / 2 - 10, 326, W / 2 - 2, 260);
        ll.closePath(); ctx.fill(ll);

        // right leg
        const rl = new Path2D();
        rl.moveTo(W / 2 + 26, 260);
        rl.bezierCurveTo(W / 2 + 36, 330, W / 2 + 40, 390, W / 2 + 38, 475);
        rl.lineTo(W / 2 + 14, 475);
        rl.bezierCurveTo(W / 2 + 14, 388, W / 2 + 10, 326, W / 2 + 2, 260);
        rl.closePath(); ctx.fill(rl);

        const tex = new THREE.CanvasTexture(c);
        tex.needsUpdate = true;
        return tex;
    }, []);

    if (!tex) return null;
    const PH = 1.75, PW = PH * (200 / 480);
    return (
        <mesh position={[x - PW * 0.6, PH / 2, 0.06]}>
            <planeGeometry args={[PW, PH]} />
            <meshBasicMaterial map={tex} transparent alphaTest={0.02} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
    );
}

/* ─── 3D Bar handle (horizontal pull) ─── */
function Handle3D({ w, y, z }: { w: number; y: number; z: number }) {
    const barLen = Math.min(w * 0.28, 0.14);
    return (
        <group position={[0, y, z]}>
            {/* bar */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.0045, 0.0045, barLen, 10]} />
                <meshStandardMaterial color="#B8B0A4" roughness={0.2} metalness={0.8} />
            </mesh>
            {/* left post */}
            <mesh position={[-barLen / 2, 0, -0.012]}>
                <cylinderGeometry args={[0.004, 0.004, 0.022, 8]} />
                <meshStandardMaterial color="#B8B0A4" roughness={0.2} metalness={0.8} />
            </mesh>
            {/* right post */}
            <mesh position={[barLen / 2, 0, -0.012]}>
                <cylinderGeometry args={[0.004, 0.004, 0.022, 8]} />
                <meshStandardMaterial color="#B8B0A4" roughness={0.2} metalness={0.8} />
            </mesh>
        </group>
    );
}

/* ─── 3D Hinge (2 plates + barrel) ─── */
function Hinge3D({ y }: { y: number }) {
    return (
        <group position={[0, y, 0]}>
            {/* Fixed plate (on frame) */}
            <mesh position={[-0.022, 0, 0]}>
                <boxGeometry args={[0.02, 0.032, 0.006]} />
                <meshStandardMaterial color="#A09888" roughness={0.3} metalness={0.6} />
            </mesh>
            {/* Moving plate (on door) */}
            <mesh position={[0.008, 0, 0.003]}>
                <boxGeometry args={[0.024, 0.032, 0.006]} />
                <meshStandardMaterial color="#A09888" roughness={0.3} metalness={0.6} />
            </mesh>
            {/* Barrel */}
            <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.005, 0.005, 0.034, 8]} />
                <meshStandardMaterial color="#888070" roughness={0.2} metalness={0.7} />
            </mesh>
        </group>
    );
}

/* ─── Animated door with 3D hinges ─── */
function Door({ colW, H, openRight, color }: {
    colW: number; H: number; openRight: boolean; color: string;
}) {
    const groupRef = useRef<THREE.Group>(null);
    const [open, setOpen] = useState(false);
    const targetY = open ? (openRight ? -Math.PI * 0.47 : Math.PI * 0.47) : 0;
    const curY = useRef(0);

    useFrame(() => {
        if (!groupRef.current) return;
        curY.current = THREE.MathUtils.lerp(curY.current, targetY, 0.08);
        groupRef.current.rotation.y = curY.current;
    });

    const dw = colW - 2 * T - 0.002;
    const dh = H - T * 2 - 0.004;
    const hingeX = openRight ? -colW / 2 + T : colW / 2 - T;

    return (
        <group ref={groupRef} position={[hingeX, 0, 0]}>
            {/* Door panel */}
            <mesh
                position={[openRight ? dw / 2 : -dw / 2, dh / 2 + T, T / 2]}
                onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
                castShadow
            >
                <boxGeometry args={[dw, dh, T]} />
                <meshStandardMaterial color={color} roughness={0.85} />
            </mesh>
            {/* Hinges at 20% and 80% height */}
            {[0.2, 0.8].map((f, i) => (
                <Hinge3D key={i} y={dh * f + T} />
            ))}
            {/* Handle on the pull side */}
            <Handle3D
                w={dw}
                y={dh * 0.42 + T}
                z={T + 0.018}
            />
        </group>
    );
}

/* ─── Animated drawer with proper casing ─── */
function Drawer({ colW, D, h, y, color }: {
    colW: number; D: number; h: number; y: number; color: string;
}) {
    const ref = useRef<THREE.Group>(null);
    const [open, setOpen] = useState(false);
    const slideZ = D * 0.82;
    const curZ = useRef(0);
    const tw = colW - 2 * T - 0.004; // interior width
    const td = D - T;                // interior depth

    useFrame(() => {
        if (!ref.current) return;
        curZ.current = THREE.MathUtils.lerp(curZ.current, open ? slideZ : 0, 0.08);
        ref.current.position.z = curZ.current;
    });

    return (
        <group ref={ref} position={[0, y + h / 2, 0]}>
            {/* Front panel */}
            <mesh
                position={[0, 0, T / 2]}
                onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
                castShadow
            >
                <boxGeometry args={[tw, h - 0.003, T]} />
                <meshStandardMaterial color={color} roughness={0.85} />
            </mesh>
            {/* Handle */}
            <Handle3D w={tw} y={0} z={T + 0.018} />
            {/* Box bottom */}
            <mesh position={[0, -h / 2 + 0.008, -td / 2]}>
                <boxGeometry args={[tw - 0.008, 0.012, td]} />
                <meshStandardMaterial color={EDGE} roughness={0.9} />
            </mesh>
            {/* Box left side */}
            <mesh position={[-tw / 2 + 0.006, 0, -td / 2]}>
                <boxGeometry args={[0.012, h * 0.85, td]} />
                <meshStandardMaterial color={EDGE} roughness={0.9} />
            </mesh>
            {/* Box right side */}
            <mesh position={[tw / 2 - 0.006, 0, -td / 2]}>
                <boxGeometry args={[0.012, h * 0.85, td]} />
                <meshStandardMaterial color={EDGE} roughness={0.9} />
            </mesh>
            {/* Box back */}
            <mesh position={[0, 0, -td + 0.006]}>
                <boxGeometry args={[tw - 0.02, h * 0.85, 0.012]} />
                <meshStandardMaterial color={EDGE} roughness={0.9} />
            </mesh>
        </group>
    );
}

/* ─── One wardrobe column ─── */
function Column({
    x, colW, H, D, extColor, intColor, backPanel, variant,
}: {
    x: number; colW: number; H: number; D: number;
    extColor: string; intColor: string; backPanel: boolean;
    variant: 'open' | 'shelves' | 'drawers' | 'door';
}) {
    const innerW = colW - 2 * T;
    const innerD = D - T;

    return (
        <group position={[x, 0, 0]}>
            {/* Left panel */}
            <mesh position={[-colW / 2 + T / 2, H / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[T, H, D]} />
                <meshStandardMaterial color={extColor} roughness={0.85} />
            </mesh>
            {/* Right panel */}
            <mesh position={[colW / 2 - T / 2, H / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[T, H, D]} />
                <meshStandardMaterial color={extColor} roughness={0.85} />
            </mesh>
            {/* Top panel */}
            <mesh position={[0, H - T / 2, 0]} castShadow>
                <boxGeometry args={[innerW, T, D]} />
                <meshStandardMaterial color={extColor} roughness={0.85} />
            </mesh>
            {/* Bottom panel */}
            <mesh position={[0, T / 2, 0]} castShadow>
                <boxGeometry args={[innerW, T, D]} />
                <meshStandardMaterial color={extColor} roughness={0.85} />
            </mesh>
            {/* Back panel */}
            {backPanel && (
                <mesh position={[0, H / 2, -D / 2 + 0.005]}>
                    <boxGeometry args={[innerW, H - 2 * T, 0.006]} />
                    <meshStandardMaterial color={intColor} roughness={0.9} />
                </mesh>
            )}

            {/* ── INTERIOR VARIANTS ── */}

            {variant === 'shelves' && [0.33, 0.54, 0.73].map((f, i) => (
                <mesh key={i} position={[0, H * f, 0]}>
                    <boxGeometry args={[innerW - 0.002, T * 0.8, innerD]} />
                    <meshStandardMaterial color={intColor} roughness={0.9} />
                </mesh>
            ))}

            {variant === 'drawers' && (() => {
                const usableH = H - 2 * T;
                const n = 4;
                const gap = 0.004;
                const dh = (usableH - gap * (n + 1)) / n;
                return Array.from({ length: n }).map((_, i) => (
                    <Drawer
                        key={i}
                        colW={colW} D={D}
                        h={dh}
                        y={T + gap + i * (dh + gap)}
                        color={extColor}
                    />
                ));
            })()}

            {variant === 'door' && (
                <Door colW={colW} H={H} openRight color={extColor} />
            )}

            {variant === 'open' && (
                /* Hanging rail */
                <mesh position={[0, H * 0.82, -D * 0.15]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.007, 0.007, innerW - 0.02, 12]} />
                    <meshStandardMaterial color="#BAB2A8" roughness={0.25} metalness={0.55} />
                </mesh>
            )}
        </group>
    );
}

/* ─── Auto-frame camera to fit the cabinet ─── */
function CameraFramer({ W, H }: { W: number; H: number }) {
    const { camera } = useThree();
    useEffect(() => {
        const diag = Math.sqrt(W * W + H * H);
        const fov = (camera as THREE.PerspectiveCamera).fov ?? 32;
        const dist = (diag / 2) / Math.tan((fov * Math.PI) / 360) * 1.35;
        camera.position.set(W * 0.28, H * 0.52, dist);
        camera.lookAt(0, H * 0.45, 0);
        camera.updateProjectionMatrix();
    }, [W, H, camera]);
    return null;
}

/* ─── Lighting ─── */
function SceneSetup() {
    const { scene } = useThree();
    useEffect(() => {
        scene.background = new THREE.Color('#EDEBE8');
        scene.fog = new THREE.Fog('#EDEBE8', 14, 28);
        const amb = new THREE.AmbientLight(0xffffff, 0.85);
        const key = new THREE.DirectionalLight(0xfff9f4, 1.15);
        key.position.set(5, 9, 7); key.castShadow = true;
        key.shadow.mapSize.setScalar(2048);
        key.shadow.camera.near = 0.5;
        key.shadow.camera.far = 30;
        key.shadow.camera.left = -6; key.shadow.camera.right = 6;
        key.shadow.camera.top = 6; key.shadow.camera.bottom = -6;
        const fill = new THREE.DirectionalLight(0xeef0ff, 0.32);
        fill.position.set(-4, 4, -3);
        scene.add(amb, key, fill);
        return () => { scene.remove(amb, key, fill); };
    }, [scene]);
    return null;
}

/* ─── Pencil overlay per column ─── */
function ColumnEditIcon({ x, idx, onEdit }: { x: number; idx: number; onEdit: (i: number) => void }) {
    return (
        <Html position={[x, -0.05, 0.05]} center zIndexRange={[10, 20]} style={{ pointerEvents: 'none' }}>
            <button
                onClick={e => { e.stopPropagation(); onEdit(idx); }}
                style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.94)', border: '1px solid rgba(0,0,0,0.10)',
                    boxShadow: '0 1px 6px rgba(0,0,0,0.12)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, color: '#444', pointerEvents: 'auto',
                }}
            >✎</button>
        </Html>
    );
}

/* ─── Props ─── */
export interface ConfiguratorProps {
    exteriorColor: string;
    interiorColor: string;
    width: number;   // mm
    height: number;  // mm
    depth: number;   // mm
    columns: number;
    backPanel: boolean;
    columnVariants: ('open' | 'shelves' | 'drawers' | 'door')[];
    onColumnEdit?: (colIndex: number) => void;
}

export default function ThreeViewer(props: ConfiguratorProps) {
    const { exteriorColor, interiorColor, width, height, depth, columns, backPanel, columnVariants, onColumnEdit } = props;

    const W = width / 1000;
    const H = height / 1000;
    const D = depth / 1000;

    const colW = W / columns;
    const startX = -(W / 2) + colW / 2;

    return (
        <Canvas
            shadows
            camera={{ position: [W * 0.28, H * 0.52, W + 2.4], fov: 32 }}
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
            style={{ width: '100%', height: '100%' }}
        >
            <SceneSetup />
            <CameraFramer W={W} H={H} />
            <InfiniteRoom />

            {Array.from({ length: columns }).map((_, i) => {
                const variant = columnVariants[i] ?? 'shelves';
                const cx = startX + i * colW;
                return (
                    <group key={i}>
                        <Column
                            x={cx} colW={colW}
                            H={H} D={D}
                            extColor={exteriorColor}
                            intColor={interiorColor}
                            backPanel={backPanel}
                            variant={variant}
                        />
                        {onColumnEdit && (
                            <ColumnEditIcon x={cx} idx={i} onEdit={onColumnEdit} />
                        )}
                    </group>
                );
            })}

            <HumanSilhouette x={-W / 2} />

            <OrbitControls
                enableDamping dampingFactor={0.05}
                minPolarAngle={Math.PI * 0.08}
                maxPolarAngle={Math.PI * 0.48}
                minDistance={0.8} maxDistance={20}
                target={[0, H * 0.45, 0]}
                enablePan={false}
            />
        </Canvas>
    );
}
