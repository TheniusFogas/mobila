import { MetadataRoute } from 'next';
import { generateFurnitureSlugs } from '@/lib/seo/metadata';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://mobila.vercel.app';
    const slugs = generateFurnitureSlugs();

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...slugs.map(slug => ({
            url: `${baseUrl}${slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        })),
    ];
}
