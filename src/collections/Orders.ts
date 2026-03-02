import { CollectionConfig } from 'payload';

/**
 * ARCH 3.2: Order Management Lifecycle (CRM Bridge)
 * Draft → Paid → Tech-Audit → Production → Quality/Shipping
 */
export const Orders: CollectionConfig = {
    slug: 'orders',
    admin: {
        useAsTitle: 'orderCode',
        group: 'CRM',
    },
    access: { read: () => true },
    fields: [
        { name: 'orderCode', type: 'text', required: true, label: 'Cod Comandă (auto)', admin: { readOnly: true } },
        {
            name: 'status',
            type: 'select',
            required: true,
            label: 'Status',
            defaultValue: 'draft',
            options: [
                { label: '📝 Draft (Client)', value: 'draft' },
                { label: '💳 Plătit (Webhook)', value: 'paid' },
                { label: '🔍 Audit Tehnic (Fabrica)', value: 'tech_audit' },
                { label: '⚙️ Producție (Activ)', value: 'production' },
                { label: '✅ Calitate / Expediție', value: 'shipping' },
            ],
        },
        {
            name: 'configSnapshot',
            type: 'json',
            label: 'Configurație 3D (JSON Snapshot)',
        },
        { name: 'width', type: 'number', label: 'Lățime (mm)' },
        { name: 'height', type: 'number', label: 'Înălțime (mm)' },
        { name: 'depth', type: 'number', label: 'Adâncime (mm)' },
        { name: 'material', type: 'text', label: 'Material Carcasă' },
        { name: 'priceRON', type: 'number', label: 'Preț Final (RON)' },

        /* Factory assignment (ARCH 3.3) */
        {
            name: 'assignedFactory',
            type: 'select',
            label: 'Fabrică Asignată',
            options: [
                { label: 'Fabrică A (CNC General)', value: 'factory_a' },
                { label: 'Fabrică B (5-Axis MDF)', value: 'factory_b' },
                { label: 'Fabrică C (Nesting)', value: 'factory_c' },
            ],
        },

        /* Files generated after payment */
        {
            name: 'bomUrl', type: 'text', label: 'URL BOM Generat'
        },
        { name: 'dxfUrl', type: 'text', label: 'URL DXF CNC Generat' },
        { name: 'nestingYield', type: 'number', label: 'Eficiență Nesting (%)' },

        /* QR / Label */
        { name: 'qrCode', type: 'text', label: 'URL QR Etichetă' },

        /* Affiliate */
        { name: 'refCode', type: 'text', label: 'Cod Afiliat (ref cookie)' },
        { name: 'commission', type: 'number', label: 'Comision Afiliat (RON)' },

        /* Metadata */
        { name: 'customerEmail', type: 'email', label: 'Email Client' },
        { name: 'notes', type: 'textarea', label: 'Note Interne' },
    ],
    hooks: {
        beforeChange: [
            async ({ data }) => {
                if (!data.orderCode) {
                    data.orderCode = `KAGU-${Date.now().toString(36).toUpperCase()}`;
                }
                return data;
            },
        ],
    },
};
