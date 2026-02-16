import { NextRequest, NextResponse } from 'next/server';

// In-memory store for demo
const materials: Record<string, unknown>[] = [];

export async function GET() {
  return NextResponse.json({ materials });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, category, size, mimeType, projectIds } = body;

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const material = {
      id: `mat-${Date.now()}`,
      name,
      originalName: body.originalName || name,
      type: type || 'other',
      category: category || 'other',
      size: size || 0,
      mimeType: mimeType || 'application/octet-stream',
      tags: body.tags || [],
      notes: body.notes || '',
      projectIds: projectIds || [],
      collectionIds: body.collectionIds || [],
      snippets: [],
      version: 1,
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    materials.push(material);
    return NextResponse.json(material, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
