/**
 * ARCH 6 / ARCH 1: Advanced Manufacturing Engineering Logic
 * Implements all "chichite" from the triple-agent audit report.
 */

// ===== SAGULATOR (Shelf Deflection Formula) =====
// δ = (5WL³) / (384EI)
// W = distributed load (N/m)
// L = span (m)
// E = Young's Modulus of material (Pa)
// I = Moment of Inertia = (width * thickness³) / 12

interface MaterialProperties {
    youngModulus: number; // Pa
    density: number; // kg/m³
    name: string;
}

const MATERIALS: Record<string, MaterialProperties> = {
    PAL_18: { youngModulus: 3_000_000_000, density: 750, name: 'PAL 18mm' },
    MDF_18: { youngModulus: 3_500_000_000, density: 820, name: 'MDF 18mm' },
    PAL_22: { youngModulus: 3_200_000_000, density: 760, name: 'PAL 22mm' },
    SOLID_OAK: { youngModulus: 11_000_000_000, density: 720, name: 'Stejar Masiv' },
};

export function calcShelfDeflection(
    spanMm: number,
    thicknessMm: number,
    widthMm: number,
    categoryLoadKgM2: number,
    materialKey: keyof typeof MATERIALS = 'PAL_18'
): { deflectionMm: number; isWarning: boolean; warningText: string } {
    const mat = MATERIALS[materialKey] ?? MATERIALS.PAL_18;
    const L = spanMm / 1000;
    const t = thicknessMm / 1000;
    const b = widthMm / 1000;

    const W = categoryLoadKgM2 * 9.81 * L; // N distributed load
    const I = (b * Math.pow(t, 3)) / 12;
    const deflection = (5 * W * Math.pow(L, 3)) / (384 * mat.youngModulus * I);
    const deflectionMm = deflection * 1000;

    const isWarning = deflectionMm > 1.0;
    const warningText = isWarning
        ? `⚠ Săgeată ${deflectionMm.toFixed(1)}mm — adaugă suport central sau mărește grosimea la ${thicknessMm + 4}mm`
        : '';

    return { deflectionMm, isWarning, warningText };
}

// ===== HINGE COUNT (Weight-Based) =====
// ARCH 1 + ARCH 6: Hinge count auto-increments if door weight exceeds limit.
const HINGE_WEIGHT_LIMIT_KG = 8; // Per hinge max capacity

export function calcHingeCount(
    doorWidthMm: number,
    doorHeightMm: number,
    thicknessMm: number,
    materialKey: keyof typeof MATERIALS = 'PAL_18'
): { count: number; totalWeightKg: number } {
    const mat = MATERIALS[materialKey] ?? MATERIALS.PAL_18;
    const areaM2 = (doorWidthMm / 1000) * (doorHeightMm / 1000);
    const volumeM3 = areaM2 * (thicknessMm / 1000);
    const weightKg = volumeM3 * mat.density;
    const count = Math.max(2, Math.ceil(weightKg / HINGE_WEIGHT_LIMIT_KG));
    return { count, totalWeightKg: Math.round(weightKg * 100) / 100 };
}

// ===== EDGE BANDING PRE-MILL (ARCH 6.B) =====
// Adds +2mm RawSize for every panel that will be edge-banded
export function applyEdgeBandingMargin(
    dimensions: { width: number; height: number },
    edgeCount: number
): { rawWidth: number; rawHeight: number; finishedWidth: number; finishedHeight: number } {
    const margin = edgeCount > 0 ? 2 : 0; // +2mm raw for ABS glue path
    return {
        rawWidth: dimensions.width + margin,
        rawHeight: dimensions.height + margin,
        finishedWidth: dimensions.width,
        finishedHeight: dimensions.height,
    };
}

// ===== DISHWASHER PLINTH NOTCH DETECTOR (ARCH 6.A) =====
export interface Appliance {
    type: 'dishwasher' | 'oven' | 'sink' | 'fridge';
    position: 'left' | 'right' | 'center';
}

export function needsPlinthNotch(appliances: Appliance[]): boolean {
    return appliances.some(a => a.type === 'dishwasher');
}

export function getPlinthNotchDimensions() {
    return {
        height: 150, // Standard plinth notch height (mm)
        depth: 65,   // Standard dishwasher door recess (mm)
        cncTag: '_plinth_notch',
    };
}

// ===== SEQUENTIAL GRAIN MATCHING (ARCH 6 - Waterfall Effect) =====
export interface PanelWithGrain {
    id: string;
    name: string;
    width: number;
    height: number;
    grainDirection: 'horizontal' | 'vertical' | 'any';
    unitId: string; // Group panels from same unit together
}

export function applyGrainStackTag(panels: PanelWithGrain[]) {
    const grainStacks = new Map<string, PanelWithGrain[]>();
    panels.forEach(p => {
        if (p.grainDirection !== 'any') {
            const key = p.unitId;
            if (!grainStacks.has(key)) grainStacks.set(key, []);
            grainStacks.get(key)!.push(p);
        }
    });
    return Array.from(grainStacks.entries()).map(([unitId, grainPanels]) => ({
        unitId,
        tag: 'GRAIN_SYNC',
        mustBeAdjacentOnSheet: true,
        panels: grainPanels.map(p => p.id),
    }));
}

export { MATERIALS };
