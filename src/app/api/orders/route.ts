import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/orders
 * Saves order snapshot. Then attempts to send a confirmation email via Resend API.
 * 
 * Env vars:
 *   RESEND_API_KEY  — get from https://resend.com (free tier: 3k/mo)
 *   ADMIN_EMAIL     — email address to notify on new orders
 *   NEXT_PUBLIC_URL — base URL (used for internal pricing fetch)
 */

let orderStore: {
    id: string;
    code: string;
    status: string;
    config: unknown;
    priceRON: number;
    createdAt: string;
    customerEmail?: string | null;
}[] = [];

async function sendEmailNotification(orderCode: string, config: {
    width: number; height: number; depth: number;
    exteriorColor: string; interiorColor: string;
    columns?: number; priceRON: number;
    customerEmail?: string | null;
}) {
    const resendKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@kagu.ro';

    if (!resendKey) {
        console.log(`[Orders] No RESEND_API_KEY — skipping email for ${orderCode}`);
        return;
    }

    const html = `
        <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
            <div style="background: #1A1A1A; padding: 24px 32px;">
                <h1 style="color: #E8472C; margin: 0; font-size: 24px; letter-spacing: -0.5px;">KAGU</h1>
                <p style="color: #888; margin: 4px 0 0; font-size: 13px;">Comandă nouă plasată</p>
            </div>
            <div style="padding: 32px;">
                <div style="background: #F7F5F2; border-radius: 10px; padding: 20px 24px; margin-bottom: 24px;">
                    <p style="margin: 0 0 4px; font-size: 20px; font-weight: 700; color: #1A1A1A;">Cod: ${orderCode}</p>
                    <p style="margin: 0; font-size: 28px; font-weight: 800; color: #E8472C;">${config.priceRON.toLocaleString('ro-RO')} RON</p>
                </div>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr><td style="padding: 8px 0; color: #888; border-bottom: 1px solid #F0EDE8;">Dimensiuni</td>
                        <td style="padding: 8px 0; font-weight: 600; border-bottom: 1px solid #F0EDE8; text-align: right;">${config.width / 10} × ${config.height / 10} × ${config.depth / 10} cm</td></tr>
                    <tr><td style="padding: 8px 0; color: #888; border-bottom: 1px solid #F0EDE8;">Coloane</td>
                        <td style="padding: 8px 0; font-weight: 600; border-bottom: 1px solid #F0EDE8; text-align: right;">${config.columns ?? 1}</td></tr>
                    <tr><td style="padding: 8px 0; color: #888; border-bottom: 1px solid #F0EDE8;">Culoare exterior</td>
                        <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #F0EDE8;"><span style="display: inline-block; width: 14px; height: 14px; border-radius: 50%; background: ${config.exteriorColor}; border: 1px solid rgba(0,0,0,0.1); vertical-align: middle; margin-right: 6px;"></span><strong>${config.exteriorColor}</strong></td></tr>
                    ${config.customerEmail ? `<tr><td style="padding: 8px 0; color: #888;">Email client</td>
                        <td style="padding: 8px 0; font-weight: 600; text-align: right;">${config.customerEmail}</td></tr>` : ''}
                </table>
                <div style="margin-top: 24px; padding: 16px; background: #FFF4F2; border: 1px solid #FFD0C8; border-radius: 8px;">
                    <p style="margin: 0; font-size: 13px; color: #E8472C; font-weight: 600;">Acțiune necesară:</p>
                    <p style="margin: 4px 0 0; font-size: 13px; color: #666;">Intră în admin → Comenzi → ${orderCode} → Generează BOM + DXF</p>
                </div>
            </div>
            <div style="padding: 16px 32px; border-top: 1px solid #F0EDE8; text-align: center;">
                <p style="color: #bbb; font-size: 11px; margin: 0;">KAGU Industrial — Configurator CNC</p>
            </div>
        </div>
    `;

    try {
        const r = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'KAGU <noreply@kagu.ro>',
                to: [adminEmail],
                ...(config.customerEmail ? { cc: [config.customerEmail] } : {}),
                subject: `[KAGU] Comandă nouă: ${orderCode} — ${config.priceRON.toLocaleString('ro-RO')} RON`,
                html,
            }),
        });
        if (!r.ok) {
            const err = await r.text();
            console.error('[Orders] Resend error:', err);
        } else {
            console.log(`[Orders] Email sent for ${orderCode}`);
        }
    } catch (err) {
        console.error('[Orders] Email send failed:', err);
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { width, height, depth, exteriorColor, interiorColor, columns, lighting, customerEmail } = body;

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
            config: { width, height, depth, exteriorColor, interiorColor, columns },
            priceRON: priceData.totalRON || 0,
            customerEmail: customerEmail || null,
            createdAt: new Date().toISOString(),
        };

        orderStore.push(order);

        // Send email notification (non-blocking — don't wait for it)
        sendEmailNotification(code, {
            width, height, depth,
            exteriorColor, interiorColor,
            columns: columns ?? 1,
            priceRON: order.priceRON,
            customerEmail: customerEmail || null,
        }).catch(console.error);

        return NextResponse.json({ ok: true, orderId: id, orderCode: code, priceRON: order.priceRON }, { status: 201 });
    } catch {
        return NextResponse.json({ ok: false, error: 'Eroare server' }, { status: 500 });
    }
}

export async function GET() {
    // Admin-only: list all orders
    return NextResponse.json({ orders: orderStore, total: orderStore.length });
}
