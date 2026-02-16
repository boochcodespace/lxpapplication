import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, projectId, phase } = body;

    if (!message || !projectId) {
      return NextResponse.json(
        { error: 'message and projectId are required' },
        { status: 400 }
      );
    }

    // Placeholder response — in production, this would call an AI API
    const response = {
      id: `msg-${Date.now()}`,
      projectId,
      role: 'assistant' as const,
      content: generatePlaceholderResponse(message, phase),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generatePlaceholderResponse(message: string, phase?: string): string {
  const phaseGuidance: Record<string, string> = {
    analysis: `I'm helping you with the **Analysis Phase**. Let's ensure we understand your learners, their needs, and the constraints before moving forward.\n\nKey questions to address:\n- Who are the target learners?\n- What performance gaps exist?\n- What are the environmental constraints?`,
    design: `We're in the **Design Phase**. I'll help you architect the learning experience with clear objectives and aligned assessments.\n\nLet's work on:\n- Writing SMART learning objectives using Bloom's Taxonomy\n- Structuring modules and lessons\n- Planning assessment strategy`,
    development: `We're in the **Development Phase**. Time to build the actual content, activities, and assessments.\n\nI can help with:\n- Writing lesson content\n- Creating meaningful interactive activities\n- Building assessments with answer keys and rubrics`,
    implementation: `We're in the **Implementation Phase**. Let's prepare for delivery.\n\nKey tasks:\n- Creating facilitator guides\n- Configuring LMS requirements\n- Planning the pilot test`,
    evaluation: `We're in the **Evaluation Phase**. Let's measure effectiveness and plan improvements.\n\nWe should address:\n- Kirkpatrick evaluation levels 1-4\n- Learner analytics review\n- Revision planning`,
  };

  if (phase && phaseGuidance[phase]) {
    return phaseGuidance[phase];
  }

  return `I received your message. In a full implementation, this would connect to an AI backend that provides intelligent instructional design guidance.\n\nYour message: "${message.slice(0, 100)}${message.length > 100 ? '...' : ''}"`;
}
