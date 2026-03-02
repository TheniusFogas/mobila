import { NextRequest, NextResponse } from 'next/server';

/**
 * ARCH 3: CNC Export Bridge
 * Generates DXF files from cabinet dimensions for CNC machine input.
 */

function generateDXF(width: number, height: number, depth: number, thickness = 18): string {
    const panels = [
        { name: 'SIDE_LEFT', w: depth, h: height },
        { name: 'SIDE_RIGHT', w: depth, h: height },
        { name: 'TOP', w: width - thickness * 2, h: depth },
        { name: 'BOTTOM', w: width - thickness * 2, h: depth },
        { name: 'BACK', w: width - 4, h: height - 4 },
    ];

    let dxf = `0\nSECTION\n2\nHEADER\n9\n$ACADVER\n1\nAC1006\n0\nENDSEC\n`;
    dxf += `0\nSECTION\n2\nENTITIES\n`;

    let xOffset = 0;
    panels.forEach((panel) => {
        // Rectangle for each panel
        dxf += `0\nLINE\n8\n${panel.name}\n10\n${xOffset}\n20\n0\n11\n${xOffset + panel.w}\n21\n0\n`;
        dxf += `0\nLINE\n8\n${panel.name}\n10\n${xOffset + panel.w}\n20\n0\n11\n${xOffset + panel.w}\n21\n${panel.h}\n`;
        dxf += `0\nLINE\n8\n${panel.name}\n10\n${xOffset + panel.w}\n20\n${panel.h}\n11\n${xOffset}\n21\n${panel.h}\n`;
        dxf += `0\nLINE\n8\n${panel.name}\n10\n${xOffset}\n20\n${panel.h}\n11\n${xOffset}\n21\n0\n`;

        // Label
        dxf += `0\nTEXT\n8\nLABELS\n10\n${xOffset + 10}\n20\n${panel.h / 2}\n40\n20\n1\n${panel.name} ${panel.w}x${panel.h}\n`;

        xOffset += panel.w + 50; // 50mm gap between panels
    });

    dxf += `0\nENDSEC\n0\nEOF\n`;
    return dxf;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { width = 600, height = 800, depth = 450, thickness = 18 } = body;

        const dxf = generateDXF(Number(width), Number(height), Number(depth), Number(thickness));

        return new NextResponse(dxf, {
            headers: {
                'Content-Type': 'application/dxf',
                'Content-Disposition': `attachment; filename="PROD_${width}x${height}x${depth}.dxf"`,
            },
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const width = parseInt(searchParams.get('w') || '600');
    const height = parseInt(searchParams.get('h') || '800');
    const depth = parseInt(searchParams.get('d') || '450');

    const dxf = generateDXF(width, height, depth);

    return new NextResponse(dxf, {
        headers: {
            'Content-Type': 'application/dxf',
            'Content-Disposition': `attachment; filename="PROD_${width}x${height}x${depth}.dxf"`,
        },
    });
}
