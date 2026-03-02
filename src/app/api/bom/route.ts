import { NextResponse } from 'next/server';

/**
 * ARCH 3: BOM (Bill of Materials) API
 * Returns the full material list for a given cabinet configuration.
 */

interface Panel {
    name: string;
    width: number;
    height: number;
    thickness: number;
    edgeBanding: string[];
    areaM2: number;
}

interface BOMResponse {
    panels: Panel[];
    hardware: Record<string, number>;
    totalMaterialM2: number;
    costRON: number;
    sheetsRequired: number;
    nestingEfficiency: number;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const w = parseInt(searchParams.get('w') || '600');
    const h = parseInt(searchParams.get('h') || '800');
    const d = parseInt(searchParams.get('d') || '450');
    const t = 18; // Standard PAL thickness

    const rawPanels = [
        { name: 'Panou Lateral Stâng', width: d, height: h, thickness: t, edgeBanding: ['front', 'top', 'bottom'] },
        { name: 'Panou Lateral Drept', width: d, height: h, thickness: t, edgeBanding: ['front', 'top', 'bottom'] },
        { name: 'Blat Superior', width: w - t * 2, height: d, thickness: t, edgeBanding: ['front'] },
        { name: 'Fund Inferior', width: w - t * 2, height: d, thickness: t, edgeBanding: ['front'] },
        { name: 'Spate HDF', width: w - 4, height: h - 4, thickness: 3, edgeBanding: [] },
    ];

    const panels: Panel[] = rawPanels.map(p => ({
        ...p,
        areaM2: Math.round((p.width * p.height) / 10000) / 100,
    }));

    const totalM2 = panels.reduce((sum, p) => sum + p.areaM2, 0);

    // Sheet nesting estimate (standard 2800x2070mm sheet = 5.796m²)
    const usableSheetM2 = 5.5;
    const sheetsRequired = Math.ceil(totalM2 / usableSheetM2);
    const nestingEfficiency = Math.round((totalM2 / (sheetsRequired * usableSheetM2)) * 100);

    const PricePerM2 = 125;
    const LaborBase = 95;
    const HardwareBase = 45;
    const costRON = Math.round(totalM2 * PricePerM2 + LaborBase + HardwareBase);

    const bom: BOMResponse = {
        panels,
        hardware: {
            'Bolt Minifix 15mm': 8,
            'Cam Minifix': 8,
            'Diblu 8x35mm': 8,
            'Suport polita': 4,
        },
        totalMaterialM2: Math.round(totalM2 * 100) / 100,
        costRON,
        sheetsRequired,
        nestingEfficiency,
    };

    return NextResponse.json(bom);
}
