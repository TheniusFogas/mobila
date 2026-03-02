import { CollectionConfig } from 'payload/types';

export const Media: CollectionConfig = {
    slug: 'media',
    upload: {
        staticDir: 'public/media',
        mimeTypes: ['image/*', 'model/gltf-binary', 'application/octet-stream'],
    },
    access: {
        read: () => true,
    },
    fields: [
        {
            name: 'alt',
            type: 'text',
            required: true,
        },
    ],
};
