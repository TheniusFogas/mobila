import { MetadataRoute } from 'next';
import { generateFurnitureSlugs } from '@/lib/seo/metadata';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://mobila.vercel.app'; // Replace with final domain
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
            changeFrequency: 'weekly',
            priority: 0.8,
        })),
    ];
}
