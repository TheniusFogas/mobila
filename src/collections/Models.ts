import { CollectionConfig } from 'payload/types';

export const Models: CollectionConfig = {
    slug: 'models',
    admin: {
        useAsTitle: 'name',
        group: 'Engineering',
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
        },
        {
            name: 'roomCategory',
            type: 'select',
            options: [
                { label: 'Kitchen', value: 'kitchen' },
                { label: 'Living Room', value: 'living' },
                { label: 'Bedroom', value: 'bedroom' },
            ],
            required: true,
        },
        {
            name: 'asset',
            type: 'upload',
            relationTo: 'media',
            required: true,
            admin: {
                description: '3D Mesh file (.glb) following 3D_ASSET_SPEC',
            },
        },
        {
            name: 'constraints',
            type: 'group',
            fields: [
                {
                    name: 'minWidth',
                    type: 'number',
                    defaultValue: 300,
                },
                {
                    name: 'maxWidth',
                    type: 'number',
                    defaultValue: 1200,
                },
                {
                    name: 'stepX',
                    type: 'number',
                    defaultValue: 15,
                    admin: {
                        description: 'Tylko snapping increment in millimeters',
                    },
                },
                {
                    name: 'lockZ',
                    type: 'checkbox',
                    defaultValue: true,
                    admin: {
                        description: 'Lock depth axis (standard)',
                    },
                },
            ],
        },
        {
            name: 'compatibleMaterials',
            type: 'relationship',
            relationTo: 'materials',
            hasMany: true,
        },
        {
            name: 'compatibleHardware',
            type: 'relationship',
            relationTo: 'hardware',
            hasMany: true,
        },
    ],
};
