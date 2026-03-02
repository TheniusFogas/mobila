import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * ARCH 2: System 32 DrillMap API
 * Generates the complete drilling matrix for a cabinet panel.
 * System 32 standard: holes every 32mm, 37mm setback from front edge.
 */

interface DrillHole {
    x: number;       // mm from panel origin
    y: number;       // mm from panel origin
    diameter: number; // mm
    depth: number;   // mm
    type: 'minifix_cam' | 'minifix_bolt' | 'hinge_cup' | 'shelf_pin' | 'dowel' | 'confirmat';
    layer: string;   // DXF layer / color code
}

interface DrillMap {
    panelId: string;
    panelWidth: number;
    panelHeight: number;
    holes: DrillHole[];
    recipe: 'premium' | 'economy';
}

function generateDrillMap(
    panelId: string,
    panelWidth: number,
    panelHeight: number,
    recipe: 'premium' | 'economy' = 'premium',
    hingeCount = 2
): DrillMap {
    const holes: DrillHole[] = [];
    const SETBACK = 37; // System 32 standard setback from front
    const GRID = 32;    // 32mm grid spacing

    // === MINIFIX pattern (top/bottom) ===
    const minifixPositionsX = [96, panelWidth - 96];
    for (const x of minifixPositionsX) {
        // Cam holes (ø15mm blind 13.5mm)
        holes.push({ x, y: 9.5, diameter: 15, depth: 13.5, type: 'minifix_cam', layer: 'MINIFIX_TOP' });
        holes.push({ x, y: panelHeight - 9.5, diameter: 15, depth: 13.5, type: 'minifix_cam', layer: 'MINIFIX_BOT' });
        // Bolt holes (ø5mm through)
        holes.push({ x, y: 0, diameter: 5, depth: panelHeight, type: 'minifix_bolt', layer: 'BOLT' });
    }

    // === SHELF PINS (ø5mm grid, 32mm spacing) ===
    const shelfRows = Math.floor((panelHeight - SETBACK * 2) / GRID);
    for (let i = 0; i < shelfRows; i++) {
        const y = SETBACK + i * GRID;
        holes.push({ x: SETBACK, y, diameter: 5, depth: 12, type: 'shelf_pin', layer: 'SHELF_FRONT' });
        holes.push({ x: panelWidth - SETBACK, y, diameter: 5, depth: 12, type: 'shelf_pin', layer: 'SHELF_REAR' });
    }

    // === HINGE CUPS (ø35mm, only on door panels) ===
    const hingeOffsets = [100]; // 100mm from top
    if (hingeCount >= 2) hingeOffsets.push(panelHeight - 100);
    if (hingeCount >= 3) hingeOffsets.push(Math.round(panelHeight / 2));
    for (const y of hingeOffsets) {
        holes.push({ x: 22.5, y, diameter: 35, depth: 12, type: 'hinge_cup', layer: 'HINGE' });
    }

    // === ECONOMY: Confirmat screws ==
    if (recipe === 'economy') {
        const confirmPositions = [48, panelHeight - 48];
        for (const y of confirmPositions) {
            holes.push({ x: 4, y, diameter: 7, depth: 50, type: 'confirmat', layer: 'CONFIRMAT' });
            holes.push({ x: panelWidth - 4, y, diameter: 7, depth: 50, type: 'confirmat', layer: 'CONFIRMAT' });
        }
    }

    return { panelId, panelWidth, panelHeight, holes, recipe };
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const width = parseInt(searchParams.get('w') || '600');
    const height = parseInt(searchParams.get('h') || '800');
    const depth = parseInt(searchParams.get('d') || '450');
    const recipe = (searchParams.get('recipe') || 'premium') as 'premium' | 'economy';
    const hingeCount = parseInt(searchParams.get('hinges') || '2');
    const t = 18;

    const drillMaps: DrillMap[] = [
        generateDrillMap('side_left', depth, height, recipe, hingeCount),
        generateDrillMap('side_right', depth, height, recipe, hingeCount),
        generateDrillMap('top', width - t * 2, depth, recipe),
        generateDrillMap('bottom', width - t * 2, depth, recipe),
        generateDrillMap('door', width - t * 2, height, recipe, hingeCount),
    ];

    return NextResponse.json({
        standard: 'System 32',
        setback: 37,
        grid: 32,
        recipe,
        panels: drillMaps,
        totalHoles: drillMaps.reduce((sum, d) => sum + d.holes.length, 0),
    });
}
