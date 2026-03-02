import type { Metadata } from 'next';
import { ClientOnly } from '@/components/ClientOnly';
import FurnitureViewer from '@/components/FurnitureViewer';
import { DiscoveryEngine } from '@/components/DiscoveryEngine';

export const metadata: Metadata = {
  title: 'KAGU Industrial – Configurator Mobilă Parametric',
  description: 'Proiectează și comandă mobilă cu precizie industrială. Configurator 3D, generare automată fișiere CNC, BOM complet și prețuri în timp real pentru producători de mobilă.',
  openGraph: {
    title: 'KAGU Industrial – Configurator Mobilă',
    description: 'Configurator 3D parametric pentru mobilă industrială. Export CNC, BOM automat, prețuri în timp real.',
    url: 'https://mobila.ecalc.ro',
    siteName: 'KAGU Industrial',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

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
