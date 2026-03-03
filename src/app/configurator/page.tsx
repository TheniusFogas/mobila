import type { Metadata } from 'next';
import FurnitureViewer from '@/components/FurnitureViewer';

export const metadata: Metadata = {
    title: 'Configurator Admin Preview',
    description: 'Previzualizare și design parametric mobilier',
};

export default function ConfiguratorAdminPage() {
    return <FurnitureViewer />;
}
