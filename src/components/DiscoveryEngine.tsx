'use client';

import React from 'react';
import Link from 'next/link';

/**
 * SEO Internal Linking Component
 * Generates discovery paths for Google to find permutations.
 */
export const DiscoveryEngine = () => {
    const categories = [
        { title: 'Bucătărie', items: ['Dulap Superior', 'Corp Bază', 'Turn Electrocasnice'] },
        { title: 'Living', items: ['Comodă TV', 'Raft Cărți', 'Corp Suspendat'] },
        { title: 'Dormitor', items: ['Noptieră Custom', 'Dressing Parametric'] },
    ];

    return (
        <footer className="w-full bg-[#050505] border-t border-white/5 p-12 mt-24">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                {categories.map((cat) => (
                    <div key={cat.title}>
                        <h3 className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-6">{cat.title}</h3>
                        <ul className="space-y-3">
                            {cat.items.map(item => (
                                <li key={item}>
                                    <Link href={`/configurator?type=${item.toLowerCase().replace(' ', '-')}`} className="text-sm text-gray-400 hover:text-white transition-colors">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <div className="mt-24 pt-8 border-t border-white/5 flex justify-between items-center">
                <p className="text-[10px] text-gray-600">© 2026 KAGU INDUSTRIAL. Toate drepturile rezervate.</p>
                <div className="flex gap-8">
                    <span className="text-[10px] text-gray-600 uppercase tracking-tighter">CNC Ready</span>
                    <span className="text-[10px] text-gray-600 uppercase tracking-tighter">Precision Engineering</span>
                </div>
            </div>
        </footer>
    );
};
