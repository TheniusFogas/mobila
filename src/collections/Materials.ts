import type { CollectionConfig } from 'payload';

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
      name: 'type',
      type: 'select',
      options: [
        { label: 'PAL Melaminat', value: 'pal' },
        { label: 'MDF', value: 'mdf' },
        { label: 'Placaj', value: 'plywood' },
        { label: 'HDF (Spate)', value: 'hdf' },
      ],
    },
    {
      name: 'thickness',
      type: 'number',
      defaultValue: 18,
    },
    {
      name: 'pricePerM2',
      type: 'number',
    },
    {
      name: 'color',
      type: 'text',
    },
    {
      name: 'texture',
      type: 'text',
    },
    {
      name: 'sheetWidth',
      type: 'number',
      defaultValue: 2800,
    },
    {
      name: 'sheetHeight',
      type: 'number',
      defaultValue: 2070,
    },
  ],
};
