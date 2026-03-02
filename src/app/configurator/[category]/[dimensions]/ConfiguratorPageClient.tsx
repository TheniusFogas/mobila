'use client';

import { useEffect } from 'react';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import FurnitureViewer from '@/components/FurnitureViewer';

interface Props {
    initialWidth: number;
    initialHeight: number;
    initialDepth: number;
    category: string;
}

export default function ConfiguratorPageClient({ initialWidth, initialHeight, initialDepth, category }: Props) {
    const { setDimensions } = useConfiguratorStore();

    useEffect(() => {
        setDimensions(initialWidth, initialHeight, initialDepth);
    }, [initialWidth, initialHeight, initialDepth, setDimensions]);

    return <FurnitureViewer />;
}
