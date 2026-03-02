import { CollectionConfig } from 'payload';

/**
 * ARCH 3: Hardware Configuration
 * All hardware variables (hinge weight limit, drill pattern ID) are admin-editable.
 */
export const Hardware: CollectionConfig = {
    slug: 'hardware',
    admin: {
        useAsTitle: 'name',
        group: 'Producție',
    },
    access: { read: () => true },
    fields: [
        { name: 'name', type: 'text', required: true, label: 'Denumire (ex: Blum Clip Top 110°)' },
        { name: 'code', type: 'text', required: true, label: 'Cod Articol' },
        {
            name: 'type',
            type: 'select',
            label: 'Tip Hardware',
            options: [
                { label: 'Balamale', value: 'hinge' },
                { label: 'Minifix Cam', value: 'minifix_cam' },
                { label: 'Minifix Bolt', value: 'minifix_bolt' },
                { label: 'Diblu', value: 'dowel' },
                { label: 'Glisieră', value: 'drawer_slide' },
                { label: 'Mâner', value: 'handle' },
                { label: 'Confirmat', value: 'confirmat' },
            ],
            required: true,
        },
        { name: 'weightLimitKg', type: 'number', label: 'Limită Greutate / Balamale (kg)', defaultValue: 8 },
        { name: 'drillPatternID', type: 'text', label: 'ID Template Găurire (fișier JSON)' },
        { name: 'drillDiameter', type: 'number', label: 'Diametru Gaură (mm)', defaultValue: 35 },
        { name: 'drillDepth', type: 'number', label: 'Adâncime Gaură (mm)', defaultValue: 12 },
        { name: 'pricePerUnit', type: 'number', label: 'Preț / Bucată (RON)', defaultValue: 8 },
        {
            name: 'recipe', type: 'select', label: 'Rețetă',
            options: [{ label: 'Premium', value: 'premium' }, { label: 'Economy', value: 'economy' }, { label: 'Ambele', value: 'both' }],
            defaultValue: 'both'
        },
        { name: 'providerID', type: 'text', label: 'Furnizor' },
        { name: 'isActive', type: 'checkbox', label: 'Activ', defaultValue: true },
    ],
};
