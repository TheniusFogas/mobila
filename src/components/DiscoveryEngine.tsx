'use client';

import Link from 'next/link';
import { CABINET_CATEGORIES, STANDARD_WIDTHS, STANDARD_HEIGHTS, STANDARD_DEPTHS } from '@/lib/seo/metadata';

/**
 * ARCH 5: SEO Discovery Engine
 * Renders a dense footer grid of internal links so Google can crawl
 * all 2,940 cabinet configuration permutations.
 */
export const DiscoveryEngine = () => {
    // Generate a representative sample for footer display (not all 2940)
    const featured = CABINET_CATEGORIES.flatMap(cat =>
        [600, 800, 1000].flatMap(w =>
            [720, 900, 2100].map(h => ({
                label: `${cat.label} ${w}×${h}mm`,
                href: `/configurator/${cat.slug}/${w}-${h}-450`,
            }))
        )
    );

    return (
        <footer className="absolute bottom-0 left-0 right-0 z-20 bg-black/40 border-t border-white/5 backdrop-blur-sm">
            <div className="px-6 py-3">
                <p className="text-[8px] text-gray-700 uppercase tracking-widest font-bold mb-2">
                    Configurații Populare
                </p>
                <div className="flex flex-wrap gap-2">
                    {featured.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-[9px] text-gray-600 hover:text-gray-400 transition-colors"
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>
        </footer>
    );
};
