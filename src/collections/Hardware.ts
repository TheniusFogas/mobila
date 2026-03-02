import type { CollectionConfig } from 'payload';

export const Hardware: CollectionConfig = {
    slug: 'hardware',
    admin: {
        useAsTitle: 'name',
        group: 'Inventory',
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
        },
        {
            name: 'type',
            type: 'select',
            options: [
                { label: 'Minifix', value: 'minifix' },
                { label: 'Hinge', value: 'hinge' },
                { label: 'Drawer Slide', value: 'drawer-slide' },
                { label: 'Handle', value: 'handle' },
                { label: 'Connector', value: 'connector' },
            ],
        },
        {
            name: 'brand',
            type: 'text',
        },
        {
            name: 'sku',
            type: 'text',
        },
        {
            name: 'pricePerUnit',
            type: 'number',
        },
        {
            name: 'stockUnits',
            type: 'number',
        },
    ],
};
