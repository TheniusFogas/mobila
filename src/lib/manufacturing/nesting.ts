/**
 * ARCH 6: Engineering Quirks - Dishwasher Auto-Notch
 * Specialized logic for kitchen base units adjacent to dishwashers.
 */

interface NotchParams {
    plinthHeight: number;
    plinthDepth: number;
    dishwasherWidth: number;
}

export const calculatePlinthNotch = (params: NotchParams) => {
    const { plinthHeight, plinthDepth, dishwasherWidth } = params;

    // Standard rule: Notch is required for door clearance
    // Depth of 65mm is industry standard for 150mm plinths
    const notchDepth = plinthHeight >= 150 ? 65 : 45;

    return {
        required: true,
        width: dishwasherWidth,
        height: plinthHeight,
        depth: notchDepth,
        marker: '_plinth_notch_cnc', // Tag for DXF export
    };
};

/**
 * ARCH 2: Genetic Nesting Engine (Base)
 * Calculates how many parts fit on a standard 2800x2070mm board.
 */

const SHEET_SIZE = { width: 2800, height: 2070 };

export const calculateNestingEfficiency = (panels: any[]) => {
    let sheetArea = SHEET_SIZE.width * SHEET_SIZE.height;
    let panelArea = 0;

    panels.forEach(p => panelArea += p.width * p.height);

    const efficiency = (panelArea / sheetArea) * 100;

    return {
        efficiency: Math.round(efficiency * 100) / 100,
        sheetsRequired: Math.ceil(panelArea / (sheetArea * 0.9)), // 90% yield assumption
    };
};
