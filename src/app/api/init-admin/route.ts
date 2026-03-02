import { getPayload } from 'payload';
import config from '@/payload.config';
import { NextResponse } from 'next/server';

export async function GET() {
    const payload = await getPayload({ config });

    try {
        const existingUsers = await payload.find({
            collection: 'users',
            limit: 1,
        });

        if (existingUsers.totalDocs > 0) {
            return NextResponse.json({ message: 'Admin already exists' });
        }

        await payload.create({
            collection: 'users',
            data: {
                email: 'admin@mobila.ro',
                password: 'AdminMobila2026!',
            },
        });

        return NextResponse.json({ message: 'Admin created successfully: admin@mobila.ro / AdminMobila2026!' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
