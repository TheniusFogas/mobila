import { ClientOnly } from '@/components/ClientOnly';
import FurnitureViewer from '@/components/FurnitureViewer';
import { DiscoveryEngine } from '@/components/DiscoveryEngine';

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <ClientOnly>
        <FurnitureViewer />
        <DiscoveryEngine />
      </ClientOnly>
    </main>
  );
}
