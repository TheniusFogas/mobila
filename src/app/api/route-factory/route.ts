import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * ARCH 3.3: Multi-Factory Routing Algorithm
 * Routes orders to the correct factory based on required capabilities.
 */

interface Factory {
    id: string;
    name: string;
    capabilities: string[];
    currentLoad: number;
    maxLoad: number;
}

const FACTORIES: Factory[] = [
    { id: 'factory_a', name: 'Fabrică A – CNC General', capabilities: ['nesting-cnc', 'panel-saw'], currentLoad: 65, maxLoad: 100 },
    { id: 'factory_b', name: 'Fabrică B – 5-Axis MDF', capabilities: ['5-axis-router', 'mdf-painting', 'panel-saw'], currentLoad: 40, maxLoad: 100 },
    { id: 'factory_c', name: 'Fabrică C – Nesting Only', capabilities: ['nesting-cnc'], currentLoad: 80, maxLoad: 100 },
];

function routeOrder(requirements: string[]): Factory | null {
    // Filter factories that have ALL required capabilities
    const eligible = FACTORIES.filter(f =>
        requirements.every(req => f.capabilities.includes(req))
    );
    if (eligible.length === 0) return null;
    // Pick the one with lowest current load
    return eligible.reduce((best, f) => f.currentLoad < best.currentLoad ? f : best);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { material, hasBeveledMDF, hasNesting, needs5Axis } = body;

        const requirements: string[] = [];
        if (hasBeveledMDF) requirements.push('mdf-painting');
        if (hasNesting) requirements.push('nesting-cnc');
        if (needs5Axis) requirements.push('5-axis-router');
        if (!hasBeveledMDF && !needs5Axis) requirements.push('panel-saw');

        const factory = routeOrder(requirements);

        if (!factory) {
            return NextResponse.json({
                ok: false,
                error: 'Nicio fabrică disponibilă pentru aceste cerințe',
                requirements,
            }, { status: 422 });
        }

        return NextResponse.json({
            ok: true,
            factory: { id: factory.id, name: factory.name },
            requirements,
            message: `Comandă rutată la ${factory.name} (${factory.currentLoad}% ocupat)`,
        });
    } catch {
        return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
    }
}

export async function GET() {
    return NextResponse.json({ factories: FACTORIES.map(f => ({ ...f, available: f.currentLoad < f.maxLoad })) });
}
