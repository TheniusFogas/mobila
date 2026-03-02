import { CollectionConfig } from 'payload/types';

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
                { label: 'Hinge', value: 'hinge' },
                { label: 'Drawer Slide', value: 'slide' },
                { label: 'Handle', value: 'handle' },
                { label: 'Connector', value: 'connector' },
            ],
            required: true,
        },
        {
            name: 'provider',
            type: 'text', // e.g. Blum, Hettich
        },
        {
            name: 'weightLimit',
            type: 'number',
            admin: {
                description: 'Maximum weight supported (kg)',
            },
        },
        {
            name: 'drillPattern',
            type: 'json',
            admin: {
                description: 'JSON object defining hole coordinates relative to system edges',
            },
        },
        {
            name: 'basePrice',
            type: 'number',
            required: true,
        },
    ],
};
