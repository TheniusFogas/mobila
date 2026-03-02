/**
 * ARCH 2: Industrial Manufacturing - BOM Service
 * Calculates exact panel sizes, edge-banding lengths, and hardware counts.
 */

interface Panel {
    name: string;
    width: number;
    height: number;
    thickness: number;
    edgeBanding: string[]; // ['top', 'bottom', 'left', 'right']
}

interface BOM {
    panels: Panel[];
    hardware: Record<string, number>;
    totalMaterialM2: number;
}

export const generateBOM = (width: number, height: number, depth: number): BOM => {
    const thickness = 18; // Standard PAL/MDF thickness in mm

    const panels: Panel[] = [
        // 1. Sides (x2)
        {
            name: 'Side Panel',
            width: depth,
            height: height,
            thickness,
            edgeBanding: ['front', 'top', 'bottom'],
        },
        {
            name: 'Side Panel',
            width: depth,
            height: height,
            thickness,
            edgeBanding: ['front', 'top', 'bottom'],
        },
        // 2. Top & Bottom
        {
            name: 'Top Panel',
            width: width - (thickness * 2), // Inside fit
            height: depth,
            thickness,
            edgeBanding: ['front'],
        },
        {
            name: 'Bottom Panel',
            width: width - (thickness * 2),
            height: depth,
            thickness,
            edgeBanding: ['front'],
        },
        // 3. Back (HDF 3mm)
        {
            name: 'Back Panel (HDF)',
            width: width - 4, // 2mm groove each side
            height: height - 4,
            thickness: 3,
            edgeBanding: [],
        }
    ];

    let totalM2 = 0;
    panels.forEach(p => totalM2 += (p.width * p.height) / 1000000);

    return {
        panels,
        hardware: {
            'Minifix Bolt': 8,
            'Minifix Cam': 8,
            'Dowel 8x35': 8,
            'Shelf Support': 4,
        },
        totalMaterialM2: totalM2,
    };
};
