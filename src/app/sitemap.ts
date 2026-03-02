import type { MetadataRoute } from 'next';
import { CABINET_CATEGORIES, STANDARD_WIDTHS, STANDARD_HEIGHTS, STANDARD_DEPTHS } from '@/lib/seo/metadata';

const BASE_URL = 'https://mobila.ecalc.ro';

export default function sitemap(): MetadataRoute.Sitemap {
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/configurator`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.9,
        },
    ];

    const dynamicRoutes: MetadataRoute.Sitemap = [];

    for (const cat of CABINET_CATEGORIES) {
        dynamicRoutes.push({
            url: `${BASE_URL}/configurator/${cat.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        });

        for (const w of STANDARD_WIDTHS) {
            for (const h of STANDARD_HEIGHTS) {
                for (const d of STANDARD_DEPTHS) {
                    dynamicRoutes.push({
                        url: `${BASE_URL}/configurator/${cat.slug}/${w}-${h}-${d}`,
                        lastModified: new Date(),
                        changeFrequency: 'monthly' as const,
                        priority: 0.6,
                    });
                }
            }
        }
    }

    return [...staticRoutes, ...dynamicRoutes];
}
