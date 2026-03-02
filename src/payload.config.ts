import { buildConfig } from 'payload/config';
import path from 'path';
import { mongooseAdapter } from '@payloadcms/db-mongodb'; // Note: Spec says Postgres but Payload v3 uses Postgres natively. Adjusting for v3 beta patterns if needed.
// For v3, focusing on the Next.js integration.
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { Materials } from './collections/Materials';
import { Hardware } from './collections/Hardware';
import { Models } from './collections/Models';
import { Media } from './collections/Media';

export default buildConfig({
    admin: {
        user: 'users',
    },
    collections: [
        Materials,
        Hardware,
        Models,
        Media,
        {
            slug: 'users',
            auth: true,
            admin: {
                useAsTitle: 'email',
            },
            fields: [],
        },
    ],
    editor: lexicalEditor({}),
    secret: process.env.PAYLOAD_SECRET || 'fallback-secret-for-dev',
    typescript: {
        outputFile: path.resolve(__dirname, 'payload-types.ts'),
    },
    db: postgresAdapter({
        pool: {
            connectionString: process.env.DATABASE_URI || '',
        },
    }),
});
