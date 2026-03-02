/**
 * ARCH 1: Core Parametric Engine - Snapping Logic
 */

export const CONFIG_DEFAULTS = {
    STEP_SIZE: 15, // mm
    MIN_WIDTH: 300,
    MAX_WIDTH: 1200,
    MIN_HEIGHT: 150,
    MAX_HEIGHT: 2400,
    MIN_DEPTH: 300,
    MAX_DEPTH: 600,
};

export const snapValue = (value: number, step: number = CONFIG_DEFAULTS.STEP_SIZE): number => {
    return Math.round(value / step) * step;
};

export const clampValue = (value: number, min: number, max: number): number => {
    return Math.max(min, Math.min(max, value));
};

export const validateDimensions = (w: number, h: number, d: number) => {
    return {
        width: snapValue(clampValue(w, CONFIG_DEFAULTS.MIN_WIDTH, CONFIG_DEFAULTS.MAX_WIDTH)),
        height: snapValue(clampValue(h, CONFIG_DEFAULTS.MIN_HEIGHT, CONFIG_DEFAULTS.MAX_HEIGHT)),
        depth: snapValue(clampValue(d, CONFIG_DEFAULTS.MIN_DEPTH, CONFIG_DEFAULTS.MAX_DEPTH)),
    };
};
