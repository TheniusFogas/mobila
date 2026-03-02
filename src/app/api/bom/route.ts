import { NextRequest, NextResponse } from 'next/server';
import { calcHingeCount, calcShelfDeflection, applyEdgeBandingMargin } from '@/lib/manufacturing/engineering';

export const dynamic = 'force-dynamic';

interface BOMPanel {
    name: string;
    finishedWidth: number;
    finishedHeight: number;
    rawWidth: number;
    rawHeight: number;
    thickness: number;
    edgeBanding: string[];
    areaM2: number;
    cncTags: string[];
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const w = parseInt(searchParams.get('w') || '600');
    const h = parseInt(searchParams.get('h') || '800');
    const d = parseInt(searchParams.get('d') || '450');
    const mat = (searchParams.get('mat') || 'PAL_18') as 'PAL_18' | 'MDF_18' | 'PAL_22' | 'SOLID_OAK';
    const t = 18;

    // === PANELS ===
    const rawPanels = [
        { name: 'Panou Lateral Stâng', w: d, h: h, edges: ['front', 'top', 'bottom'] },
        { name: 'Panou Lateral Drept', w: d, h: h, edges: ['front', 'top', 'bottom'] },
        { name: 'Blat Superior', w: w - t * 2, h: d, edges: ['front'] },
        { name: 'Fund Inferior', w: w - t * 2, h: d, edges: ['front'] },
        { name: 'Spate HDF', w: w - 4, h: h - 4, edges: [], thickness: 3 },
    ];

    const panels: BOMPanel[] = rawPanels.map(p => {
        const thickness = p.thickness ?? t;
        const withMargin = applyEdgeBandingMargin({ width: p.w, height: p.h }, p.edges.length);
        return {
            name: p.name,
            finishedWidth: withMargin.finishedWidth,
            finishedHeight: withMargin.finishedHeight,
            rawWidth: withMargin.rawWidth,
            rawHeight: withMargin.rawHeight,
            thickness,
            edgeBanding: p.edges,
            areaM2: Math.round((p.w * p.h) / 10000) / 100,
            cncTags: thickness === 3 ? ['HDF_3MM'] : [],
        };
    });

    const totalM2 = panels.reduce((sum, p) => sum + p.areaM2, 0);
    const usableSheetM2 = 5.5; // Standard 2800×2070mm sheet
    const sheetsRequired = Math.ceil(totalM2 / usableSheetM2);
    const nestingEfficiency = Math.round((totalM2 / (sheetsRequired * usableSheetM2)) * 100);

    // === SAGULATOR ===
    const shelfCheck = calcShelfDeflection(w - t * 2, t, d, 35, mat); // 35kg/m² bookshelf load

    // === HINGES ===
    const hingeData = calcHingeCount(w, h, t, mat);

    // === COST ===
    const PricePerM2 = 125;
    const laborBase = 95;
    const hardwareBase = 45 + hingeData.count * 8;
    const costRON = Math.round(totalM2 * PricePerM2 + laborBase + hardwareBase);

    return NextResponse.json({
        panels,
        hardware: {
            'Bolt Minifix 15mm': 8,
            'Cam Minifix': 8,
            'Diblu 8×35mm': 8,
            [`Balamale (${hingeData.count}buc × ${HINGE_WEIGHT_LIMIT_KG}kg)`]: hingeData.count,
            'Suport poliță': 4,
        },
        totalMaterialM2: Math.round(totalM2 * 100) / 100,
        sheetsRequired,
        nestingEfficiency,
        costRON,
        engineering: {
            shelfDeflectionMm: Math.round(shelfCheck.deflectionMm * 100) / 100,
            shelfWarning: shelfCheck.isWarning ? shelfCheck.warningText : null,
            doorWeightKg: hingeData.totalWeightKg,
            hingeCount: hingeData.count,
            edgeBandingPreMill: '+2mm raw per panel (ABS flush finish)',
        },
    });
}

const HINGE_WEIGHT_LIMIT_KG = 8;
