'use client';

import { create } from 'zustand';
import { validateDimensions } from '@/lib/engine/validation';

/**
 * Global Store for the Furniture Configurator
 * Handles real-time state sync between UI and 3D Engine.
 */

interface ConfiguratorState {
    dimensions: {
        width: number;
        height: number;
        depth: number;
    };
    materialId: string;
    setDimensions: (w: number, h: number, d: number) => void;
    updateDimension: (key: 'width' | 'height' | 'depth', value: number) => void;
}

export const useConfiguratorStore = create<ConfiguratorState>((set) => ({
    dimensions: {
        width: 600,
        height: 800,
        depth: 450,
    },
    materialId: 'std-mdf-18',

    setDimensions: (w, h, d) => {
        const validated = validateDimensions(w, h, d);
        set({ dimensions: validated });
    },

    updateDimension: (key, value) => set((state) => {
        const newDims = { ...state.dimensions, [key]: value };
        const validated = validateDimensions(newDims.width, newDims.height, newDims.depth);
        return { dimensions: validated };
    }),
}));
