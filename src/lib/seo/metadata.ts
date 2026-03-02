/**
 * ARCH 4: SEO & Content Scaling - Sitemap Generator
 * Creates a dynamic list of furniture permutations for Google crawling.
 */

export const generateFurnitureSlugs = () => {
    const rooms = ['bucatarie', 'living', 'dormitor'];
    const styles = ['minimal', 'industrial', 'classic'];

    const slugs: string[] = [];

    rooms.forEach(room => {
        styles.forEach(style => {
            slugs.push(`/${room}/${style}`);
        });
    });

    return slugs;
};

/**
 * JSON-LD Structured Data for Furniture
 */
export const getFurnitureSchema = (name: string, price: number, image: string) => {
    return {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": `Dulap Parametric - ${name}`,
        "image": [image],
        "description": "Configurator de mobilier 3D customizabil cu generare automată de fișiere CNC.",
        "brand": {
            "@type": "Brand",
            "name": "KAGU"
        },
        "offers": {
            "@type": "Offer",
            "priceCurrency": "RON",
            "price": price,
            "availability": "https://schema.org/InStock"
        }
    };
};
