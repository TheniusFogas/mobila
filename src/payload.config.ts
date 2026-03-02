import { buildConfig } from 'payload';
import path from 'path';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { Materials } from './collections/Materials';
import { Hardware } from './collections/Hardware';
import { Orders } from './collections/Orders';
import { Models } from './collections/Models';
import { Media } from './collections/Media';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
    admin: {
        user: 'users',
        importMap: {
            baseDir: path.resolve(dirname),
        },
    },
    collections: [
        Materials,
        Hardware,
        Orders,
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
    secret: process.env.PAYLOAD_SECRET || '7f5e8a9b2c3d4e5f6g7h8i9j0k1l2m3n',
    typescript: {
        outputFile: path.resolve(dirname, 'payload-types.ts'),
    },
    db: postgresAdapter({
        pool: {
            connectionString: process.env.DATABASE_URI || '',
        },
    }),
});
