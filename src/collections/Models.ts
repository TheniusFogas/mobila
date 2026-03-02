import type { CollectionConfig } from 'payload';

export const Models: CollectionConfig = {
    slug: 'models',
    admin: {
        useAsTitle: 'name',
        group: 'Products',
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
        },
        {
            name: 'category',
            type: 'select',
            options: [
                { label: 'Bucătărie', value: 'kitchen' },
                { label: 'Living', value: 'living' },
                { label: 'Dormitor', value: 'bedroom' },
                { label: 'Baie', value: 'bathroom' },
            ],
        },
        {
            name: 'widthMin',
            type: 'number',
            defaultValue: 300,
        },
        {
            name: 'widthMax',
            type: 'number',
            defaultValue: 1200,
        },
        {
            name: 'heightMin',
            type: 'number',
            defaultValue: 300,
        },
        {
            name: 'heightMax',
            type: 'number',
            defaultValue: 2400,
        },
        {
            name: 'depthMin',
            type: 'number',
            defaultValue: 300,
        },
        {
            name: 'depthMax',
            type: 'number',
            defaultValue: 600,
        },
        {
            name: 'basePrice',
            type: 'number',
        },
    ],
};
