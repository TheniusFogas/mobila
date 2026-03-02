import { Metadata } from 'next';
import { CABINET_CATEGORIES, STANDARD_WIDTHS, STANDARD_HEIGHTS, STANDARD_DEPTHS, generateCabinetMetadata } from '@/lib/seo/metadata';
import { generateProductSchema, generateBreadcrumbSchema } from '@/lib/seo/schema';
import ConfiguratorPageClient from './ConfiguratorPageClient';

interface Props {
    params: Promise<{ category: string; dimensions: string }>;
}

export async function generateStaticParams() {
    const params = [];
    for (const cat of CABINET_CATEGORIES) {
        for (const w of STANDARD_WIDTHS) {
            for (const h of STANDARD_HEIGHTS) {
                for (const d of STANDARD_DEPTHS) {
                    params.push({ category: cat.slug, dimensions: `${w}-${h}-${d}` });
                }
            }
        }
    }
    return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { category, dimensions } = await params;
    const [w, h, d] = dimensions.split('-').map(Number);
    const cat = CABINET_CATEGORIES.find(c => c.slug === category);
    return generateCabinetMetadata({
        width: w || 600, height: h || 800, depth: d || 450,
        category: cat?.label || category,
    });
}

export default async function ConfiguratorPage({ params }: Props) {
    const { category, dimensions } = await params;
    const [w, h, d] = dimensions.split('-').map(Number);
    const cat = CABINET_CATEGORIES.find(c => c.slug === category);
    const catLabel = cat?.label || category;

    const url = `https://mobila.ecalc.ro/configurator/${category}/${dimensions}`;
    const priceEstimate = Math.round((w || 600) / 1000 * (h || 800) / 1000 * (d || 450) / 1000 * 2500 + 140);

    const productSchema = generateProductSchema({ category: catLabel, width: w, height: h, depth: d, priceRON: priceEstimate, url });
    const breadcrumbSchema = generateBreadcrumbSchema(catLabel, dimensions);

    return (
        <main>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <ConfiguratorPageClient
                initialWidth={w || 600}
                initialHeight={h || 800}
                initialDepth={d || 450}
                category={catLabel}
            />
        </main>
    );
}
