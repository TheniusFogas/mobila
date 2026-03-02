/**
 * ARCH 2: Industrial Manufacturing - System 32 Coordinate Logic
 * Translates 3D coordinates from the viewer into drilling maps for the shop floor.
 */

export interface DrillHole {
    panel: string;
    side: 'front' | 'back' | 'top' | 'bottom' | 'face';
    x: number;
    y: number;
    diameter: number;
    depth: number;
    type: 'dowel' | 'minifix' | 'hinge' | 'shelf';
}

export const generateSystem32DrillMap = (
    width: number,
    height: number,
    depth: number,
    shelfPositions: number[] = []
): DrillHole[] => {
    const holes: DrillHole[] = [];
    const thickness = 18;

    // 1. Sidebar to Top/Bottom connections (Minifix + Dowels)
    // Logic: Holes at 32mm and 64mm from top/bottom edges, 37mm setback from front
    const connectionSetback = 37;
    const edgeDistances = [32, 64];

    // Sides (left and right)
    ['left', 'right'].forEach(side => {
        // Top and Bottom corners
        [0, height].forEach(zPos => {
            edgeDistances.forEach(dist => {
                const y = zPos === 0 ? dist : height - dist;
                holes.push({
                    panel: side,
                    side: 'face',
                    x: connectionSetback,
                    y: y,
                    diameter: 8,
                    depth: 12,
                    type: 'dowel'
                });
            });
        });
    });

    // 2. Shelf Supports (System 32 grid)
    shelfPositions.forEach(zLevel => {
        ['left', 'right'].forEach(side => {
            [37, depth - 37].forEach(xSetback => {
                holes.push({
                    panel: side,
                    side: 'face',
                    x: xSetback,
                    y: zLevel,
                    diameter: 5,
                    depth: 12,
                    type: 'shelf'
                });
            });
        });
    });

    return holes;
};
