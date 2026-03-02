/**
 * ARCH 4.3: Schema.org Product structured data for SEO pages
 * Generates JSON-LD for Google rich results on configurator pages.
 */

interface CabinetSchemaParams {
    category: string;
    width: number;
    height: number;
    depth: number;
    priceRON: number;
    url: string;
}

export function generateProductSchema(params: CabinetSchemaParams) {
    const { category, width, height, depth, priceRON, url } = params;

    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: `Cabinet ${category} ${width}×${height}×${depth}mm`,
        description: `Cabinet ${category} personalizat: ${width}mm lățime, ${height}mm înălțime, ${depth}mm adâncime. Produs cu panel saw industrial, CNC router, și sistem System 32 de prindere. Include fișiere DXF pentru producție.`,
        sku: `KAGU-${category.toUpperCase()}-${width}-${height}-${depth}`,
        brand: {
            '@type': 'Brand',
            name: 'KAGU Industrial',
        },
        offers: {
            '@type': 'Offer',
            priceCurrency: 'RON',
            price: priceRON,
            availability: 'https://schema.org/InStock',
            seller: {
                '@type': 'Organization',
                name: 'KAGU Industrial',
                url: 'https://mobila.ecalc.ro',
            },
        },
        additionalProperty: [
            { '@type': 'PropertyValue', name: 'Lățime', value: `${width}mm` },
            { '@type': 'PropertyValue', name: 'Înălțime', value: `${height}mm` },
            { '@type': 'PropertyValue', name: 'Adâncime', value: `${depth}mm` },
            { '@type': 'PropertyValue', name: 'Material', value: 'PAL 18mm Standard' },
            { '@type': 'PropertyValue', name: 'Sistem Prindere', value: 'Minifix + System 32' },
            { '@type': 'PropertyValue', name: 'Export CNC', value: 'DXF, MPR (Homag)' },
        ],
        url,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    };
}

export function generateBreadcrumbSchema(category: string, dimensions: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Acasă', item: 'https://mobila.ecalc.ro' },
            { '@type': 'ListItem', position: 2, name: 'Configurator', item: 'https://mobila.ecalc.ro/configurator' },
            { '@type': 'ListItem', position: 3, name: category, item: `https://mobila.ecalc.ro/configurator/${category.toLowerCase()}` },
            { '@type': 'ListItem', position: 4, name: dimensions },
        ],
    };
}
