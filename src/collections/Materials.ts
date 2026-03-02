import { CollectionConfig } from 'payload/types';

export const Materials: CollectionConfig = {
  slug: 'materials',
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
      name: 'thickness',
      type: 'number',
      required: true,
      admin: {
        description: 'Thickness in millimeters (e.g. 18)',
      },
    },
    {
      name: 'density',
      type: 'number',
      admin: {
        description: 'Density in kg/m3 (for weight calculation)',
      },
    },
    {
      name: 'grainDirection',
      type: 'select',
      options: [
        { label: 'Vertical', value: 'vertical' },
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'None (Solid Color)', value: 'none' },
      ],
      defaultValue: 'vertical',
    },
    {
      name: 'basePrice',
      type: 'number',
      required: true,
      admin: {
        description: 'Price per square meter',
      },
    },
    {
      name: 'texture',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'visibleInConfigurator',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
};
