/**
 * ARCH 6: Engineering Audit - Sagulator Logic
 * Calculates shelf deflection based on material, span, and load.
 */

interface SagParams {
    material: 'mdf' | 'pal' | 'plywood';
    thickness: number; // in mm
    width: number; // span in mm
    load: number; // kg
}

export const calculateShelfDeflection = (params: SagParams): { deflection: number; isSafe: boolean } => {
    const { material, thickness, width, load } = params;

    // Simplified E-Modulus (N/mm2)
    const eModulus: Record<string, number> = {
        mdf: 2500,
        pal: 2100,
        plywood: 7000,
    };

    const E = eModulus[material] || 2500;
    const L = width;
    const P = load * 9.81; // Load in Newtons
    const I = (1000 * Math.pow(thickness, 3)) / 12; // Moment of inertia for 1m depth strip

    // Deflection formula: (P * L^3) / (48 * E * I)
    const deflection = (P * Math.pow(L, 3)) / (48 * E * I);

    // Industrial limit: 1/200 of span or max 2mm
    const limit = Math.min(L / 200, 2);

    return {
        deflection: Math.round(deflection * 100) / 100,
        isSafe: deflection <= limit,
    };
};
