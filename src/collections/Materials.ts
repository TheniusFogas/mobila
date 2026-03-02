import { CollectionConfig } from 'payload';

/**
 * ARCH 3: Material Registry
 * Every material property editable from admin without code changes.
 */
export const Materials: CollectionConfig = {
  slug: 'materials',
  admin: {
    useAsTitle: 'name',
    group: 'Producție',
  },
  access: { read: () => true },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Denumire Material' },
    { name: 'code', type: 'text', required: true, label: 'Cod SKU (ex: PAL_18_ALB)' },
    { name: 'thickness', type: 'number', required: true, label: 'Grosime (mm)', defaultValue: 18 },
    { name: 'density', type: 'number', required: true, label: 'Densitate (kg/m³)', defaultValue: 750 },
    { name: 'youngModulus', type: 'number', required: true, label: 'Modul Young E (GPa)', defaultValue: 3.0 },
    {
      name: 'grainDirection',
      type: 'select',
      label: 'Direcție Fibra',
      options: [
        { label: 'Orizontal', value: 'horizontal' },
        { label: 'Vertical', value: 'vertical' },
        { label: 'Orice', value: 'any' },
      ],
      defaultValue: 'any',
    },
    { name: 'basePrice', type: 'number', required: true, label: 'Preț de Bază (RON/m²)', defaultValue: 85 },
    {
      name: 'compatibleWith',
      type: 'select',
      label: 'Compatibil Cu',
      hasMany: true,
      options: [
        { label: 'Carcasă', value: 'carcass' },
        { label: 'Fronturi', value: 'fronts' },
        { label: 'Polițe', value: 'shelves' },
        { label: 'Spate', value: 'back' },
      ],
    },
    { name: 'color', type: 'text', label: 'Hex Color (pentru 3D)', defaultValue: '#F5F0EB' },
    { name: 'roughness', type: 'number', label: 'Rugozitate R3F (0-1)', defaultValue: 0.85 },
    { name: 'metalness', type: 'number', label: 'Reflexie R3F (0-1)', defaultValue: 0.0 },
    { name: 'providerID', type: 'text', label: 'Cod Furnizor' },
    { name: 'isActive', type: 'checkbox', label: 'Activ', defaultValue: true },
  ],
};
