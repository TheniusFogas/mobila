import type { CollectionConfig } from 'payload';

/**
 * Categories collection — groups products (Dulapuri, Paturi, Bucătărie, etc.)
 * Each category has a hero image, description, and appears on the homepage grid.
 */
export const Categories: CollectionConfig = {
    slug: 'categories',
    admin: {
        useAsTitle: 'name',
        group: 'Produse',
        description: 'Categorii vizibile pe homepage și în navigație.',
    },
    access: { read: () => true },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
            label: 'Nume categorie (ex: Dulapuri)',
        },
        {
            name: 'slug',
            type: 'text',
            required: true,
            unique: true,
            label: 'Slug URL (ex: dulapuri)',
        },
        {
            name: 'description',
            type: 'textarea',
            label: 'Descriere scurtă',
        },
        {
            name: 'heroImage',
            type: 'upload',
            relationTo: 'media',
            label: 'Imagine hero categorie',
        },
        {
            name: 'icon',
            type: 'text',
            label: 'Emoji / icon (opțional)',
        },
        {
            name: 'order',
            type: 'number',
            label: 'Ordine pe homepage (1 = primul)',
            defaultValue: 99,
        },
        {
            name: 'isVisible',
            type: 'checkbox',
            label: 'Vizibil pe site',
            defaultValue: true,
        },
    ],
};
