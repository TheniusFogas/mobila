import React from 'react';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';

/**
 * ARCH 4: Interactive CAD Measurement Overlay
 * Shows precise dimensions directly on the 3D model.
 */
export const MeasurementOverlay = () => {
    const { dimensions } = useConfiguratorStore();

    return (
        <div className="absolute inset-0 pointer-events-none select-none">
            {/* Visual Lines and Labels for Width */}
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="h-[1px] bg-blue-500/50 w-64 relative">
                    <div className="absolute inset-y-[-4px] left-0 w-[1px] bg-blue-500"></div>
                    <div className="absolute inset-y-[-4px] right-0 w-[1px] bg-blue-500"></div>
                </div>
                <span className="text-[10px] font-mono text-blue-400 mt-1 bg-black/80 px-1">
                    {dimensions.width} mm
                </span>
            </div>

            {/* Height Indicator */}
            <div className="absolute left-[15%] top-1/2 -translate-y-1/2 flex items-center">
                <div className="w-[1px] bg-blue-500/50 h-64 relative">
                    <div className="absolute inset-x-[-4px] top-0 h-[1px] bg-blue-500"></div>
                    <div className="absolute inset-x-[-4px] bottom-0 h-[1px] bg-blue-500"></div>
                </div>
                <span className="text-[10px] font-mono text-blue-400 ml-2 bg-black/80 px-1 rotate-90">
                    {dimensions.height} mm
                </span>
            </div>
        </div>
    );
};
