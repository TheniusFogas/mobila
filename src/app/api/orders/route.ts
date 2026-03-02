import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/orders
 * Called by the customer frontend when they click "Plasează Comanda".
 * Saves the configuration snapshot. Admin then processes it.
 */

let orderStore: {
    id: string;
    code: string;
    status: string;
    config: unknown;
    createdAt: string;
    customerEmail?: string;
}[] = [];

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { width, height, depth, exteriorColor, interiorColor, lighting, moduleCount, customerEmail } = body;

        if (!width || !height || !depth) {
            return NextResponse.json({ ok: false, error: 'Dimensiunile sunt obligatorii' }, { status: 400 });
        }

        // Fetch automated price
        const priceRes = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/pricing?w=${width}&h=${height}&d=${depth}&light=${lighting === 'internal' ? 1 : 0}`);
        const priceData = await priceRes.json().catch(() => ({ totalRON: 0 }));

        const id = crypto.randomUUID();
        const code = `KAGU-${Date.now().toString(36).toUpperCase()}`;

        const order = {
            id,
            code,
            status: 'draft',
            config: { width, height, depth, exteriorColor, interiorColor, lighting, moduleCount },
            priceRON: priceData.totalRON || 0,
            customerEmail: customerEmail || null,
            createdAt: new Date().toISOString(),
        };

        orderStore.push(order);

        return NextResponse.json({ ok: true, orderId: id, orderCode: code, priceRON: order.priceRON }, { status: 201 });
    } catch {
        return NextResponse.json({ ok: false, error: 'Eroare server' }, { status: 500 });
    }
}

export async function GET() {
    // Admin-only: list all orders
    return NextResponse.json({ orders: orderStore });
}
