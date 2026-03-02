const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function setup() {
    console.log('--- Initializing Supabase Storage ---');

    // 1. Create 'media' bucket
    const { data: bucket, error: bucketError } = await supabase.storage.createBucket('media', {
        public: true,
        allowedMimeTypes: ['image/*', 'model/gltf-binary', 'application/octet-stream'],
        fileSizeLimit: 52428800 // 50MB
    });

    if (bucketError) {
        if (bucketError.message.includes('already exists')) {
            console.log('✔ Bucket "media" already exists.');
        } else {
            console.error('❌ Error creating bucket:', bucketError.message);
            process.exit(1);
        }
    } else {
        console.log('✔ Bucket "media" created successfully.');
    }

    console.log('--- Supabase Setup Complete ---');
}

setup();
