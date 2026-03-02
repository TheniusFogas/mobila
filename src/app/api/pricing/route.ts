import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * ARCH 3.4: Programmatic Pricing Engine
 * Price = (MaterialArea * PricePerM2) + FurnitureSum + LaborCoefficient + WastageFactor
 * + Affiliate commission tracking via `ref` cookie
 */

interface PricingInput {
    widthMm: number;
    heightMm: number;
    depthMm: number;
    thickness?: number;
    materialPriceM2?: number;  // from Payload CMS admin (fallback default)
    laborCoefficient?: number;
    wastageFactor?: number;
    hasBeveledMDF?: boolean;
    hasLighting?: boolean;
    refCode?: string;
}

function calcPrice(input: PricingInput) {
    const {
        widthMm, heightMm, depthMm,
        thickness = 18,
        materialPriceM2 = 125,
        laborCoefficient = 1.35,
        wastageFactor = 1.12,
        hasBeveledMDF = false,
        hasLighting = false,
    } = input;

    const t = thickness / 1000;
    const w = widthMm / 1000;
    const h = heightMm / 1000;
    const d = depthMm / 1000;

    // Panel areas
    const panels = [
        { name: 'Lateral Stâng', area: d * h },
        { name: 'Lateral Drept', area: d * h },
        { name: 'Blat Superior', area: (w - t * 2) * d },
        { name: 'Fund Inferior', area: (w - t * 2) * d },
        { name: 'Spate HDF', area: w * h * 0.003 / 0.018 * 0.4 }, // HDF cheaper
        { name: 'Poliță Mijloc', area: (w - t * 2) * (d - 0.02) },
    ];

    const materialAreaM2 = panels.reduce((s, p) => s + p.area, 0);
    const materialCost = materialAreaM2 * materialPriceM2 * wastageFactor;

    // Hardware cost (simplified)
    const hingeCount = h > 1.8 ? 3 : 2;
    const hardwareCost = 8 * 8 + hingeCount * 8 + 4 * 2; // minifix + hinges + shelf pins

    // Extras
    const beveledMDFSurcharge = hasBeveledMDF ? materialAreaM2 * 45 : 0;
    const lightingSurcharge = hasLighting ? 180 : 0;

    const subtotal = materialCost + hardwareCost + beveledMDFSurcharge + lightingSurcharge;
    const totalWithLabor = Math.round(subtotal * laborCoefficient);

    // Affiliate
    const COMMISSION_RATE = 0.05; // 5%
    const commissionRON = Math.round(totalWithLabor * COMMISSION_RATE);

    return {
        panels,
        materialAreaM2: Math.round(materialAreaM2 * 100) / 100,
        materialCost: Math.round(materialCost),
        hardwareCost: Math.round(hardwareCost),
        extras: { beveledMDFSurcharge: Math.round(beveledMDFSurcharge), lightingSurcharge },
        subtotal: Math.round(subtotal),
        laborCoefficient,
        totalRON: totalWithLabor,
        priceOldRON: Math.round(totalWithLabor * 1.36), // display original -36% (Tylko style)
        commissionRON,
    };
}

export async function GET(request: NextRequest) {
    const p = request.nextUrl.searchParams;
    const result = calcPrice({
        widthMm: parseInt(p.get('w') || '900'),
        heightMm: parseInt(p.get('h') || '2100'),
        depthMm: parseInt(p.get('d') || '600'),
        materialPriceM2: parseFloat(p.get('ppm2') || '125'),
        laborCoefficient: parseFloat(p.get('labor') || '1.35'),
        hasBeveledMDF: p.get('mdf') === '1',
        hasLighting: p.get('light') === '1',
        refCode: p.get('ref') || undefined,
    });
    return NextResponse.json(result);
}
