'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';

/* ─── Palette ─── */
const WALL_COLOR = '#E8E5E0';
const FLOOR_COLOR = '#D8D4CE';
const EDGE_COLOR = 0xD4C8B8; // visible MDF edge (birch-ply look)

/* ─── Room ─── */
function Room({ W }: { W: number }) {
    const roomW = W + 2.0;
    return (
        <group>
            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.4]} receiveShadow>
                <planeGeometry args={[roomW, 4]} />
                <meshStandardMaterial color={FLOOR_COLOR} roughness={0.95} />
            </mesh>
            {/* Wall */}
            <mesh position={[0, 1.4, -0.34]} receiveShadow>
                <planeGeometry args={[roomW, 2.8]} />
                <meshStandardMaterial color={WALL_COLOR} roughness={1} />
            </mesh>
        </group>
    );
}

/* ─── Human silhouette — bezier canvas, in 3D scene ─── */
function HumanSilhouette({ x }: { x: number }) {
    const tex = useMemo(() => {
        if (typeof window === 'undefined') return null;
        const W = 256, H = 512;
        const canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext('2d')!;
        const cx = W / 2;
        ctx.fillStyle = 'rgba(100,100,100,0.42)';
        // Head
        ctx.beginPath(); ctx.ellipse(cx, 52, 30, 38, 0, 0, Math.PI * 2); ctx.fill();
        // Neck
        ctx.beginPath(); ctx.rect(cx - 13, 87, 26, 22); ctx.fill();
        // Torso
        const t = new Path2D();
        t.moveTo(cx - 65, 108); t.bezierCurveTo(cx - 68, 120, cx - 50, 165, cx - 44, 200);
        t.lineTo(cx - 34, 285); t.lineTo(cx + 34, 285);
        t.lineTo(cx + 44, 200); t.bezierCurveTo(cx + 50, 165, cx + 68, 120, cx + 65, 108);
        t.bezierCurveTo(cx + 46, 97, cx + 20, 92, cx, 92);
        t.bezierCurveTo(cx - 20, 92, cx - 46, 97, cx - 65, 108);
        ctx.fill(t);
        // Left arm
        const al = new Path2D();
        al.moveTo(cx - 65, 108); al.bezierCurveTo(cx - 86, 145, cx - 94, 218, cx - 82, 278);
        al.lineTo(cx - 66, 272); al.bezierCurveTo(cx - 76, 216, cx - 66, 148, cx - 48, 124);
        al.closePath(); ctx.fill(al);
        // Right arm
        const ar = new Path2D();
        ar.moveTo(cx + 65, 108); ar.bezierCurveTo(cx + 86, 145, cx + 94, 218, cx + 82, 278);
        ar.lineTo(cx + 66, 272); ar.bezierCurveTo(cx + 76, 216, cx + 66, 148, cx + 48, 124);
        ar.closePath(); ctx.fill(ar);
        // Hips
        ctx.beginPath(); ctx.ellipse(cx, 285, 44, 18, 0, 0, Math.PI); ctx.fill();
        // Left leg
        const ll = new Path2D();
        ll.moveTo(cx - 34, 285); ll.bezierCurveTo(cx - 46, 355, cx - 52, 420, cx - 50, 505);
        ll.lineTo(cx - 22, 505); ll.bezierCurveTo(cx - 22, 418, cx - 18, 350, cx - 6, 285);
        ll.closePath(); ctx.fill(ll);
        // Right leg
        const rl = new Path2D();
        rl.moveTo(cx + 34, 285); rl.bezierCurveTo(cx + 46, 355, cx + 52, 420, cx + 50, 505);
        rl.lineTo(cx + 22, 505); rl.bezierCurveTo(cx + 22, 418, cx + 18, 350, cx + 6, 285);
        rl.closePath(); ctx.fill(rl);
        const tex = new THREE.CanvasTexture(canvas);
        tex.needsUpdate = true;
        return tex;
    }, []);

    if (!tex) return null;
    const H = 1.75, W = H * 0.5;
    return (
        <mesh position={[x - W * 0.8, H / 2, 0.02]}>
            <planeGeometry args={[W, H]} />
            <meshBasicMaterial map={tex} transparent alphaTest={0.04} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
    );
}

/* ─── Shared material factory ─── */
function useMat(color: string, roughness = 0.85, metalness = 0): THREE.MeshStandardMaterial {
    return useMemo(() => new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness, metalness }), [color, roughness, metalness]);
}

/* ─── Animated door ─── */
function Door({ w, h, hingeX, openRight, color, thickness }: {
    w: number; h: number; hingeX: number; openRight: boolean;
    color: string; thickness: number;
}) {
    const groupRef = useRef<THREE.Group>(null);
    const [open, setOpen] = useState(false);
    const targetY = open ? (openRight ? -Math.PI * 0.48 : Math.PI * 0.48) : 0;
    const currentY = useRef(0);
    const mat = useMat(color);
    const edgeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: EDGE_COLOR, roughness: 0.9 }), []);

    useFrame(() => {
        if (!groupRef.current) return;
        currentY.current = THREE.MathUtils.lerp(currentY.current, targetY, 0.1);
        groupRef.current.rotation.y = currentY.current;
    });

    return (
        <group ref={groupRef} position={[hingeX, 0, 0]}>
            {/* Panel */}
            <mesh
                position={[openRight ? w / 2 : -w / 2, h / 2, thickness / 2]}
                onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
                castShadow
            >
                <boxGeometry args={[w, h, thickness]} />
                <meshStandardMaterial color={color} roughness={0.85} />
            </mesh>
            {/* Handle */}
            <mesh position={[openRight ? w * 0.85 : -w * 0.85, h * 0.42, thickness + 0.005]}>
                <boxGeometry args={[0.008, 0.12, 0.01]} />
                <meshStandardMaterial color="#888" roughness={0.3} metalness={0.7} />
            </mesh>
        </group>
    );
}

/* ─── Animated drawer ─── */
function Drawer({ w, h, d, y, color, thickness }: { w: number; h: number; d: number; y: number; color: string; thickness: number; }) {
    const ref = useRef<THREE.Group>(null);
    const [open, setOpen] = useState(false);
    const slideOut = d * 0.85; // drawer slides out by 85% of cabinet depth
    const targetZ = open ? slideOut : 0;
    const currentZ = useRef(0);

    useFrame(() => {
        if (!ref.current) return;
        currentZ.current = THREE.MathUtils.lerp(currentZ.current, targetZ, 0.1);
        ref.current.position.z = currentZ.current;
    });

    return (
        <group ref={ref} position={[0, y, 0]}>
            {/* Front face */}
            <mesh position={[0, 0, thickness / 2]} onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }} castShadow>
                <boxGeometry args={[w, h - 0.006, thickness]} />
                <meshStandardMaterial color={color} roughness={0.85} />
            </mesh>
            {/* Handle — horizontal bar centered */}
            <mesh position={[0, 0, thickness + 0.006]}>
                <boxGeometry args={[w * 0.28, 0.009, 0.012]} />
                <meshStandardMaterial color="#A0968A" roughness={0.25} metalness={0.65} />
            </mesh>
            {/* Drawer box body (sides, bottom, back) — visible while open */}
            <mesh position={[0, -(h * 0.22), -(d * 0.4)]}>
                <boxGeometry args={[w - 0.012, h * 0.55, d * 0.8]} />
                <meshStandardMaterial color="#E0D8CC" roughness={0.92} side={THREE.BackSide} />
            </mesh>
        </group>
    );
}

/* ─── One wardrobe column ─── */
function Column({
    x, colW, H, D, T, extColor, intColor, backPanel,
    variant, // 'open' | 'shelves' | 'drawers' | 'door'
}: {
    x: number; colW: number; H: number; D: number; T: number;
    extColor: string; intColor: string; backPanel: boolean;
    variant: 'open' | 'shelves' | 'drawers' | 'door';
}) {
    const ext = useMat(extColor);
    const int_ = useMat(intColor);
    const back = useMat('#E8E0D8');

    const panelArgs = (w: number, h: number, d: number): [number, number, number] => [w, h, d];

    return (
        <group position={[x, 0, 0]}>
            {/* Left side (only leftmost column has unique left panel, others share internal divider) */}
            <mesh position={[-colW / 2 + T / 2, H / 2, 0]} castShadow receiveShadow material={ext}>
                <boxGeometry args={panelArgs(T, H, D)} />
            </mesh>
            {/* Right side */}
            <mesh position={[colW / 2 - T / 2, H / 2, 0]} castShadow receiveShadow material={ext}>
                <boxGeometry args={panelArgs(T, H, D)} />
            </mesh>
            {/* Top */}
            <mesh position={[0, H - T / 2, 0]} castShadow material={ext}>
                <boxGeometry args={panelArgs(colW - 2 * T, T, D)} />
            </mesh>
            {/* Bottom */}
            <mesh position={[0, T / 2, 0]} castShadow material={ext}>
                <boxGeometry args={panelArgs(colW - 2 * T, T, D)} />
            </mesh>
            {/* Back panel */}
            {backPanel && (
                <mesh position={[0, H / 2, -D / 2 + 0.006]} castShadow material={back}>
                    <boxGeometry args={panelArgs(colW - 2 * T, H - 2 * T, 0.006)} />
                </mesh>
            )}

            {/* INTERIOR CONTENT */}
            {variant === 'shelves' && [0.35, 0.55, 0.72].map((frac, i) => (
                <mesh key={i} position={[0, H * frac, 0]} material={int_}>
                    <boxGeometry args={panelArgs(colW - 2 * T - 0.002, T * 0.8, D - T)} />
                </mesh>
            ))}

            {variant === 'drawers' && [0.12, 0.26, 0.42, 0.58].map((frac, i) => (
                <Drawer key={i} w={colW - 2 * T - 0.005} h={H * 0.13} d={D} y={H * frac} color={extColor} thickness={T} />
            ))}

            {variant === 'door' && (
                <Door
                    w={colW - 2 * T - 0.003} h={H - T * 2.2 - 0.004}
                    hingeX={-colW / 2 + T}
                    openRight={true}
                    color={extColor}
                    thickness={T * 0.85}
                />
            )}

            {variant === 'open' && (
                /* Hanging rail — rotation on mesh, NOT on geometry */
                <mesh position={[0, H * 0.82, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.006, 0.006, colW - 2 * T - 0.02, 8]} />
                    <meshStandardMaterial color="#B0A898" roughness={0.3} metalness={0.5} />
                </mesh>
            )}
        </group>
    );
}

/* ─── Pencil icon overlay at bottom of each column ─── */
function ColumnEditIcon({ x, idx, onEdit }: { x: number; idx: number; onEdit: (i: number) => void }) {
    return (
        <Html position={[x, -0.04, 0.02]} center zIndexRange={[10, 20]} style={{ pointerEvents: 'none' }}>
            <button
                onClick={(e) => { e.stopPropagation(); onEdit(idx); }}
                style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.92)', border: '1.5px solid rgba(0,0,0,0.12)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.14)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, color: '#555', pointerEvents: 'auto',
                }}
            >✏</button>
        </Html>
    );
}

/* ─── Lighting ─── */
function SceneSetup() {
    const { scene } = useThree();
    useEffect(() => {
        scene.background = new THREE.Color('#EDEBE6');
        const amb = new THREE.AmbientLight(0xffffff, 0.9);
        const key = new THREE.DirectionalLight(0xfff8f4, 1.1);
        key.position.set(4, 7, 6); key.castShadow = true;
        key.shadow.mapSize.setScalar(1024);
        key.shadow.camera.near = 0.5; key.shadow.camera.far = 20;
        const fill = new THREE.DirectionalLight(0xf0f4ff, 0.28);
        fill.position.set(-4, 3, -2);
        scene.add(amb, key, fill);
        return () => { scene.remove(amb, key, fill); };
    }, [scene]);
    return null;
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
    onColumnEdit?: (colIndex: number) => void;
}

export default function ThreeViewer(props: ConfiguratorProps) {
    const { exteriorColor, interiorColor, width, height, depth, columns, backPanel, columnVariants, onColumnEdit } = props;

    const W = width / 1000;
    const H = height / 1000;
    const D = depth / 1000;
    const T = 0.018;

    const colW = W / columns;
    const startX = -(W / 2) + colW / 2;
    const camZ = W * 0.7 + 1.8;
    const camX = W * 0.25 + 0.3;

    return (
        <Canvas
            shadows
            camera={{ position: [camX, H * 0.55, camZ], fov: 32 }}
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
            style={{ width: '100%', height: '100%' }}
        >
            <SceneSetup />
            <Room W={W} />

            {Array.from({ length: columns }).map((_, i) => {
                const variant = columnVariants[i] ?? 'shelves';
                const cx = startX + i * colW;
                return (
                    <group key={i}>
                        <Column
                            x={cx} colW={colW}
                            H={H} D={D} T={T}
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
                enableDamping dampingFactor={0.06}
                minPolarAngle={Math.PI * 0.08}
                maxPolarAngle={Math.PI * 0.50}
                minDistance={1} maxDistance={14}
                target={[0, H * 0.45, 0]}
                enablePan={false}
            />
        </Canvas>
    );
}
