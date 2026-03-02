import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'KAGU Industrial – Configurator Mobilă Parametric',
  description: 'Proiectează și comandă mobilă cu precizie industrială. Configurator 3D, generare automată fișiere CNC, BOM complet și prețuri în timp real.',
  openGraph: {
    title: 'KAGU Industrial – Configurator Mobilă',
    description: 'Configurator 3D parametric pentru mobilă industrială.',
    url: 'https://mobila.ecalc.ro',
    siteName: 'KAGU Industrial',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function Home() {
  return (
    <main style={{ minHeight: '100vh' }}>
      <HomeClient />
    </main>
  );
}
