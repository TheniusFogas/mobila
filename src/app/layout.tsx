import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  weight: ['300', '400', '500', '600', '700', '800'],
});

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className={inter.variable}>
      <body style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
