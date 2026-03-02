import { Metadata } from 'next';

const BASE_URL = 'https://mobila.ecalc.ro';

interface CabinetSEOParams {
    width: number;
    height: number;
    depth: number;
    category: string;
}

export function generateCabinetMetadata({ width, height, depth, category }: CabinetSEOParams): Metadata {
    const title = `Cabinet ${category} ${width}x${height}x${depth}mm | KAGU Industrial`;
    const description = `Configurați și comandați un cabinet ${category} de ${width}mm lățime, ${height}mm înălțime, ${depth}mm adâncime. Generare automată fișiere CNC, BOM complet, prețuri în timp real.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `${BASE_URL}/configurator/${category}/${width}-${height}-${depth}`,
            siteName: 'KAGU Industrial',
            type: 'website',
        },
        alternates: {
            canonical: `${BASE_URL}/configurator/${category}/${width}-${height}-${depth}`,
        },
    };
}

export const CABINET_CATEGORIES = [
    { slug: 'bucatarie', label: 'Bucătărie' },
    { slug: 'living', label: 'Living' },
    { slug: 'dormitor', label: 'Dormitor' },
    { slug: 'baie', label: 'Baie' },
    { slug: 'birou', label: 'Birou' },
    { slug: 'hol', label: 'Hol' },
];

export const STANDARD_WIDTHS = [300, 400, 450, 500, 600, 700, 800, 900, 1000, 1200];
export const STANDARD_HEIGHTS = [600, 720, 900, 1200, 1800, 2100, 2400];
export const STANDARD_DEPTHS = [300, 350, 400, 450, 500, 550, 600];

export function generateCabinetSlug(category: string, width: number, height: number, depth: number) {
    return `/configurator/${category}/${width}-${height}-${depth}`;
}

export function generateAllPermutations() {
    const urls: string[] = [];
    for (const cat of CABINET_CATEGORIES) {
        for (const w of STANDARD_WIDTHS) {
            for (const h of STANDARD_HEIGHTS) {
                for (const d of STANDARD_DEPTHS) {
                    urls.push(generateCabinetSlug(cat.slug, w, h, d));
                }
            }
        }
    }
    return urls;
}
// Total: 6 * 10 * 7 * 7 = 2,940 indexable pages
