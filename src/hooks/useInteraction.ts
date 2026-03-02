import React, { useState } from 'react';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';

/**
 * ARCH 6: Advanced Engineering - Physics & Interaction
 * Handles the logic for opening doors and drawers.
 */
export const useInteraction = () => {
    const [doorOpen, setDoorOpen] = useState(0); // 0 to 1 (closed to open)
    const [drawerOpen, setDrawerOpen] = useState(0);

    const toggleDoor = () => setDoorOpen(prev => prev === 0 ? 1 : 0);
    const toggleDrawer = () => setDrawerOpen(prev => prev === 0 ? 1 : 0);

    return { doorOpen, drawerOpen, toggleDoor, toggleDrawer };
};
