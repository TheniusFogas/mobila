import 'server-only';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const { getPayload } = await import('payload');
        const { default: config } = await import('@/payload.config');
        const payload = await getPayload({ config });

        const existingUsers = await payload.find({ collection: 'users', limit: 1 });
        if (existingUsers.totalDocs > 0) {
            return NextResponse.json({ message: 'Admin already exists' });
        }

        await payload.create({
            collection: 'users',
            data: { email: 'admin@mobila.ro', password: 'AdminMobila2026!' },
        });

        return NextResponse.json({ message: 'Admin created: admin@mobila.ro' });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
