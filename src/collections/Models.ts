import type { CollectionConfig } from 'payload';

/**
 * Products/Models collection — drives every product page and configurator.
 * Admin uploads photos, GLB model, writes description, sets dimension presets.
 * All fields appear in /admin and are fetched by the Next.js pages.
 */
export const Models: CollectionConfig = {
    slug: 'models',
    admin: {
        useAsTitle: 'name',
        group: 'Produse',
        description: 'Adaugă produse, poze, modele 3D și dimensiuni configurabile.',
    },
    access: { read: () => true },
    fields: [
        // ── Basics ─────────────────────────────────
        {
            name: 'name',
            type: 'text',
            required: true,
            label: 'Nume produs (ex: Dulap Edge 90)',
        },
        {
            name: 'slug',
            type: 'text',
            required: true,
            unique: true,
            label: 'URL Slug (ex: dulap-edge-90)',
            admin: { description: 'Folosit în URL: /dulapuri/dulap-edge-90' },
        },
        {
            name: 'category',
            type: 'relationship',
            relationTo: 'categories',
            label: 'Categorie',
            required: true,
        },
        {
            name: 'subtitle',
            type: 'text',
            label: 'Subtitlu scurt (ex: Linii verticale, formă ritmică)',
        },
        {
            name: 'description',
            type: 'richText',
            label: 'Descriere produs (editabilă din admin)',
        },
        {
            name: 'isPublished',
            type: 'checkbox',
            label: 'Publicat pe site',
            defaultValue: false,
        },

        // ── Media ───────────────────────────────────
        {
            name: 'heroImages',
            type: 'array',
            label: 'Galerie foto (hero)',
            admin: { description: 'Prima imagine = thumbnail în listing.' },
            fields: [
                {
                    name: 'image',
                    type: 'upload',
                    relationTo: 'media',
                    required: true,
                },
                { name: 'altText', type: 'text', label: 'Alt text SEO' },
            ],
        },
        {
            name: 'glbModel',
            type: 'upload',
            relationTo: 'media',
            label: 'Model 3D (.glb) — pentru configurator',
            admin: { description: 'Uploadează fișierul .glb. Trebuie să respecte naming-ul din 3D_ASSET_SPEC.' },
        },

        // ── Dimensions ─────────────────────────────
        {
            name: 'widthPresets',
            type: 'array',
            label: 'Preset-uri lățime (mm)',
            defaultValue: [{ value: 900 }, { value: 1200 }, { value: 1500 }],
            fields: [{ name: 'value', type: 'number', required: true, label: 'mm' }],
        },
        {
            name: 'heightPresets',
            type: 'array',
            label: 'Preset-uri înălțime (mm)',
            defaultValue: [{ value: 2100 }, { value: 2400 }],
            fields: [{ name: 'value', type: 'number', required: true, label: 'mm' }],
        },
        {
            name: 'depthPresets',
            type: 'array',
            label: 'Preset-uri adâncime (mm)',
            defaultValue: [{ value: 550 }, { value: 600 }],
            fields: [{ name: 'value', type: 'number', required: true, label: 'mm' }],
        },

        // ── Materials (color swatches) ───────────────
        {
            name: 'availableMaterials',
            type: 'array',
            label: 'Materiale disponibile (swatches)',
            fields: [
                { name: 'name', type: 'text', required: true, label: 'Denumire (ex: Alb Artic)' },
                { name: 'hexColor', type: 'text', required: true, label: 'Culoare HEX (ex: #F5F0EB)' },
                { name: 'roughness', type: 'number', defaultValue: 0.85, label: 'Rugozitate R3F (0-1)' },
                { name: 'metalness', type: 'number', defaultValue: 0, label: 'Metalic R3F (0-1)' },
                { name: 'image', type: 'upload', relationTo: 'media', label: 'Imagine mostră' },
            ],
        },

        // ── Pricing ─────────────────────────────────
        {
            name: 'priceFrom',
            type: 'number',
            label: 'Preț de la (RON) — afișat în listing',
        },
        {
            name: 'pricePerM2',
            type: 'number',
            label: 'Preț/m² material (RON) — pentru calculul automat',
            defaultValue: 125,
        },
        {
            name: 'laborCoefficient',
            type: 'number',
            label: 'Coeficient manoperă',
            defaultValue: 1.35,
        },

        // ── SEO ─────────────────────────────────────
        {
            name: 'seoTitle',
            type: 'text',
            label: 'SEO Title (opțional)',
            admin: { description: 'Default: name + " | Kagu Industrial"' },
        },
        {
            name: 'seoDescription',
            type: 'textarea',
            label: 'SEO Meta Description',
        },
    ],
};
