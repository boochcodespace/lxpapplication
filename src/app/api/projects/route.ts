import { NextRequest, NextResponse } from 'next/server';

// In-memory store for demo — in production, this would use a database
const projects: Record<string, unknown>[] = [];

export async function GET() {
  return NextResponse.json({ projects });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, courseType, targetAudience, industry, tags } = body;

    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    const project = {
      id: `project-${Date.now()}`,
      title,
      description: description || '',
      courseType: courseType || 'self-paced',
      targetAudience: targetAudience || '',
      industry: industry || '',
      status: 'active',
      currentPhase: 'analysis',
      phaseProgress: {
        analysis: 0,
        design: 0,
        development: 0,
        implementation: 0,
        evaluation: 0,
      },
      tags: tags || [],
      materialIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    projects.push(project);
    return NextResponse.json(project, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
