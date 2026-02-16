'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import {
  AnalysisArea,
  AnalysisRedFlag,
  AnalysisResponse,
  ANALYSIS_AREAS,
  NeedsAnalysisReport,
} from '@/lib/types';
import { cn, generateId } from '@/lib/utils';
import Button from '@/components/ui/Button';

// ──────────────────────────────────────────
// GUIDED QUESTIONS
// ──────────────────────────────────────────

interface GuidedQuestion {
  id: string;
  question: string;
  followUpHint: string;
}

const GUIDED_QUESTIONS: Record<AnalysisArea, GuidedQuestion[]> = {
  'performance-gap': [
    { id: 'pg-1', question: 'What specific tasks or behaviors do your learners currently struggle with?', followUpHint: 'Try to be specific about observable behaviors rather than general knowledge gaps.' },
    { id: 'pg-2', question: 'What does successful performance look like? Describe the desired end state.', followUpHint: 'Think about what a high-performing employee does differently.' },
    { id: 'pg-3', question: 'What evidence exists for this performance gap? (data, observations, complaints, errors)', followUpHint: 'Concrete data strengthens the case for training investment.' },
  ],
  'root-cause': [
    { id: 'rc-1', question: 'Why do you believe training is the right solution for this problem?', followUpHint: 'Sometimes performance issues stem from process, tools, or motivation rather than knowledge.' },
    { id: 'rc-2', question: 'Have you explored non-training solutions? (better tools, clearer processes, job aids)', followUpHint: 'Training is expensive. Consider whether simpler interventions might work.' },
    { id: 'rc-3', question: 'What happens if we don\'t address this gap? What is the cost of inaction?', followUpHint: 'Quantifying impact helps justify the investment.' },
  ],
  'audience': [
    { id: 'au-1', question: 'Describe your typical learner (role, experience level, education background).', followUpHint: 'The more specific you can be, the better we can tailor the experience.' },
    { id: 'au-2', question: 'What do learners already know about this topic? What are their prerequisites?', followUpHint: 'Understanding prior knowledge helps us target the Zone of Proximal Development.' },
    { id: 'au-3', question: 'What motivates your learners? What are their attitudes toward this training?', followUpHint: 'Adult learners need to see relevance to their work and goals.' },
  ],
  'context-constraints': [
    { id: 'cc-1', question: 'What is the timeline for this project? When does training need to be delivered?', followUpHint: 'Be realistic about development time. Quality takes time.' },
    { id: 'cc-2', question: 'What budget is available for development and delivery?', followUpHint: 'Budget affects format, media richness, and interactivity level.' },
    { id: 'cc-3', question: 'What technology and platforms are available for delivery? (LMS, authoring tools, etc.)', followUpHint: 'Technology constraints directly impact what we can build.' },
  ],
  'success-metrics': [
    { id: 'sm-1', question: 'How will you measure if the training worked? What observable changes do you expect?', followUpHint: 'Think about Kirkpatrick levels: reaction, learning, behavior, results.' },
    { id: 'sm-2', question: 'What specific KPIs or metrics will change as a result of this training?', followUpHint: 'Tie training outcomes to business metrics whenever possible.' },
    { id: 'sm-3', question: 'When will you measure impact? What is your evaluation timeline?', followUpHint: 'Behavior change takes time. Plan for both immediate and delayed measurement.' },
  ],
  'business-impact': [
    { id: 'bi-1', question: 'What organizational problem does this training solve?', followUpHint: 'Connect the training need to a broader business objective.' },
    { id: 'bi-2', question: 'What is the cost of the current performance gap? (errors, delays, turnover, compliance risk)', followUpHint: 'Even rough estimates help build the business case.' },
    { id: 'bi-3', question: 'Who are the key stakeholders and what are their expectations?', followUpHint: 'Understanding stakeholder expectations helps manage scope and ensure buy-in.' },
  ],
  'multimodal': [
    { id: 'mm-1', question: 'Where will learners primarily access the training? (office, field, remote, mobile)', followUpHint: 'Environment affects modality choices and technical requirements.' },
    { id: 'mm-2', question: 'Are there any constraints on video or audio content? (bandwidth, quiet spaces, hearing)', followUpHint: 'Always plan for alternatives when using audio/video.' },
    { id: 'mm-3', question: 'Do learners have mobile device access? Should the training be mobile-friendly?', followUpHint: 'Mobile learning requires different design considerations.' },
  ],
  'accessibility': [
    { id: 'ac-1', question: 'What WCAG compliance level is required? (A, AA, or AAA)', followUpHint: 'AA is the standard target for most organizations.' },
    { id: 'ac-2', question: 'Are there learners who use assistive technology? (screen readers, magnification, etc.)', followUpHint: 'Knowing specific assistive tech helps us test effectively.' },
    { id: 'ac-3', question: 'Are there any specific accessibility requirements beyond WCAG? (organizational policies, legal)', followUpHint: 'Some industries have additional requirements beyond WCAG.' },
  ],
};

// ──────────────────────────────────────────
// RED FLAG DETECTION
// ──────────────────────────────────────────

function detectRedFlags(answer: string, area: AnalysisArea): AnalysisRedFlag[] {
  const flags: AnalysisRedFlag[] = [];
  const lower = answer.toLowerCase();

  if (lower.includes('asap') || lower.includes('as soon as possible') || lower.includes('yesterday')) {
    flags.push({
      id: generateId(),
      severity: 'critical',
      area,
      message: 'Unrealistic timeline detected. Rushing training development leads to poor quality and ineffective learning.',
      recommendation: 'Discuss a realistic timeline. Even a minimal viable course needs adequate development time. Consider phased delivery.',
    });
  }

  if (lower.includes('no budget') || lower.includes('zero budget') || lower.includes('no funding')) {
    flags.push({
      id: generateId(),
      severity: 'critical',
      area,
      message: 'No budget allocated. Quality training requires investment in design, development, and delivery.',
      recommendation: 'Present a cost-benefit analysis. Even low-budget solutions need dedicated resources. Consider the cost of not training.',
    });
  }

  if (lower.includes('everyone') && (area === 'audience' || lower.includes('audience') || lower.includes('learner'))) {
    flags.push({
      id: generateId(),
      severity: 'warning',
      area,
      message: '"Everyone" is not a target audience. Training designed for everyone serves no one well.',
      recommendation: 'Identify specific roles, departments, or experience levels. Segment the audience and prioritize. Different groups may need different training.',
    });
  }

  if (lower.includes('don\'t know') || lower.includes('not sure') || lower.includes('no idea')) {
    flags.push({
      id: generateId(),
      severity: 'warning',
      area,
      message: 'Key information is missing. Designing without this data increases project risk.',
      recommendation: 'Identify who can provide this information. Schedule stakeholder interviews before proceeding with design.',
    });
  }

  if (lower.includes('no data') || lower.includes('no evidence') || lower.includes('anecdotal')) {
    flags.push({
      id: generateId(),
      severity: 'warning',
      area,
      message: 'No data or evidence to support the need. Anecdotal evidence alone may not justify investment.',
      recommendation: 'Gather baseline data before training. Without it, you cannot measure improvement.',
    });
  }

  return flags;
}

// ──────────────────────────────────────────
// FOLLOW-UP GENERATION
// ──────────────────────────────────────────

function generateFollowUp(question: GuidedQuestion, answer: string): string {
  const lower = answer.toLowerCase();
  if (lower.length < 20) {
    return `Could you elaborate on that? ${question.followUpHint}`;
  }
  return `Thank you for that detail. ${question.followUpHint} Let me note that down and continue.`;
}

// ──────────────────────────────────────────
// SAMPLE REPORT GENERATION
// ──────────────────────────────────────────

function generateSampleReport(
  projectId: string,
  responses: AnalysisResponse[],
  allRedFlags: AnalysisRedFlag[]
): NeedsAnalysisReport {
  const getFirstAnswer = (area: AnalysisArea): string => {
    const resp = responses.find((r) => r.area === area);
    return resp?.answer || 'Not provided';
  };

  const hasTrainingRationale = responses.some(
    (r) => r.area === 'root-cause' && r.answer.length > 10
  );

  return {
    id: generateId(),
    projectId,
    executiveSummary:
      'This needs analysis assessed 8 critical areas to determine training requirements, audience characteristics, and delivery constraints. The analysis identified specific performance gaps, evaluated root causes, and produced actionable recommendations for course development.',
    performanceGap: {
      currentState: getFirstAnswer('performance-gap'),
      desiredState:
        responses.find((r) => r.area === 'performance-gap' && r.questionId.endsWith('-2'))?.answer ||
        'Learners perform target tasks accurately and confidently.',
      evidence: responses
        .filter((r) => r.area === 'performance-gap')
        .map((r) => r.answer)
        .filter((a) => a.length > 0),
    },
    learnerProfile: {
      demographics: getFirstAnswer('audience'),
      priorKnowledge:
        responses.find((r) => r.area === 'audience' && r.questionId.endsWith('-2'))?.answer ||
        'Varies across target population.',
      motivation:
        responses.find((r) => r.area === 'audience' && r.questionId.endsWith('-3'))?.answer ||
        'To be determined during pilot.',
      zpdAssessment:
        'Based on audience analysis, learners are expected to have foundational knowledge. Training should target the Apply and Analyze levels of Bloom\'s Taxonomy within their Zone of Proximal Development.',
      prerequisites: ['Basic role competency', 'Familiarity with organizational processes'],
    },
    rootCauseAnalysis: {
      isTrainingAppropriate: hasTrainingRationale && allRedFlags.filter((f) => f.severity === 'critical').length < 2,
      reasoning: getFirstAnswer('root-cause'),
      alternativeSolutions: [
        'Job aids and performance support tools',
        'Process improvement and workflow optimization',
        'Mentoring and coaching programs',
      ],
    },
    constraints: {
      timeline: getFirstAnswer('context-constraints'),
      budget:
        responses.find((r) => r.area === 'context-constraints' && r.questionId.endsWith('-2'))
          ?.answer || 'To be determined.',
      technology:
        responses.find((r) => r.area === 'context-constraints' && r.questionId.endsWith('-3'))
          ?.answer || 'Standard LMS and web browser.',
      environment: 'Standard organizational learning environment.',
      stakeholders: ['Project sponsor', 'Subject matter experts', 'Learning team', 'Target learners'],
    },
    multimodalRecommendations: {
      primaryModality: 'Read/Write with Visual support',
      secondaryModalities: ['Kinesthetic (hands-on practice)', 'Auditory (narrated walkthroughs)'],
      rationale: getFirstAnswer('multimodal') || 'Based on audience analysis and delivery constraints, a multi-modal approach combining text, visuals, and hands-on practice is recommended.',
    },
    accessibilityRequirements: {
      wcagLevel: getFirstAnswer('accessibility').includes('AAA') ? 'AAA' : 'AA',
      assistiveTech: ['Screen readers', 'Keyboard navigation', 'Screen magnification'],
      considerations: [
        'All images require descriptive alt text',
        'Videos require captions and transcripts',
        'Color contrast minimum 4.5:1 for body text',
        'All interactions must be keyboard accessible',
      ],
    },
    successMetrics: [
      {
        metric: 'Learner satisfaction',
        measurement: 'Post-course survey (Kirkpatrick Level 1)',
        target: '4.0 / 5.0 average rating',
      },
      {
        metric: 'Knowledge acquisition',
        measurement: 'Pre/post assessment scores (Kirkpatrick Level 2)',
        target: '80% minimum passing score',
      },
      {
        metric: 'On-the-job application',
        measurement: 'Manager observation at 30/60/90 days (Kirkpatrick Level 3)',
        target: '75% of learners demonstrating target behaviors',
      },
    ],
    businessImpact: {
      problem: getFirstAnswer('business-impact'),
      costOfInaction:
        responses.find((r) => r.area === 'business-impact' && r.questionId.endsWith('-2'))
          ?.answer || 'Not quantified. Recommend conducting a cost-benefit analysis.',
      expectedROI: 'To be calculated after establishing baseline metrics and delivery costs.',
    },
    recommendation: {
      format: 'blended',
      duration: '4-6 weeks of blended learning',
      deliveryMethod: 'Self-paced e-learning modules with instructor-led practice sessions',
      rationale:
        'A blended approach balances scalability with the hands-on practice needed for skill development. Self-paced modules cover foundational knowledge while live sessions provide guided practice within the Zone of Proximal Development.',
    },
    materialReferences: [],
    materialGaps: [
      'Scenario-based case studies needed',
      'Visual aids and infographics for key concepts',
      'Practice exercises with realistic data',
      'Job aids for post-training reference',
    ],
    redFlags: allRedFlags,
    createdAt: new Date().toISOString(),
  };
}

// ──────────────────────────────────────────
// MESSAGE TYPES
// ──────────────────────────────────────────

interface ChatMsg {
  id: string;
  role: 'agent' | 'user' | 'system';
  content: string;
  redFlags?: AnalysisRedFlag[];
}

// ──────────────────────────────────────────
// COMPONENT
// ──────────────────────────────────────────

interface AnalysisChatProps {
  projectId: string;
}

export default function AnalysisChat({ projectId }: AnalysisChatProps) {
  const wizard = useAppStore((s) => s.getAnalysisWizard(projectId));
  const addResponse = useAppStore((s) => s.addAnalysisResponse);
  const completeArea = useAppStore((s) => s.completeAnalysisArea);
  const setArea = useAppStore((s) => s.setAnalysisArea);
  const setReport = useAppStore((s) => s.setAnalysisReport);
  const completeWizard = useAppStore((s) => s.completeAnalysisWizard);

  const { currentArea, completedAreas, responses } = wizard;

  // Local state
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [allRedFlags, setAllRedFlags] = useState<AnalysisRedFlag[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const allAreasComplete = completedAreas.length === ANALYSIS_AREAS.length;

  const currentAreaInfo = ANALYSIS_AREAS.find((a) => a.key === currentArea);
  const currentQuestions = GUIDED_QUESTIONS[currentArea] || [];

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with first question when area changes
  useEffect(() => {
    if (completedAreas.includes(currentArea)) return;

    const areaInfo = ANALYSIS_AREAS.find((a) => a.key === currentArea);
    const questions = GUIDED_QUESTIONS[currentArea];

    if (questions && questions.length > 0) {
      const introMsg: ChatMsg = {
        id: generateId(),
        role: 'system',
        content: `Now exploring: ${areaInfo?.label} -- ${areaInfo?.description}`,
      };
      const questionMsg: ChatMsg = {
        id: generateId(),
        role: 'agent',
        content: questions[0].question,
      };
      setMessages((prev) => [...prev, introMsg, questionMsg]);
      setCurrentQuestionIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentArea]);

  // Focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, [currentArea, currentQuestionIndex]);

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const question = currentQuestions[currentQuestionIndex];
    if (!question) return;

    // Add user message
    const userMsg: ChatMsg = { id: generateId(), role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Save response to store
    addResponse(projectId, {
      questionId: question.id,
      area: currentArea,
      question: question.question,
      answer: trimmed,
    });

    // Detect red flags
    const flags = detectRedFlags(trimmed, currentArea);
    if (flags.length > 0) {
      setAllRedFlags((prev) => [...prev, ...flags]);
      const flagMsg: ChatMsg = {
        id: generateId(),
        role: 'agent',
        content: flags
          .map(
            (f) =>
              `${f.severity === 'critical' ? '[!] CRITICAL' : '[*] WARNING'}: ${f.message}\n\nRecommendation: ${f.recommendation}`
          )
          .join('\n\n'),
        redFlags: flags,
      };
      setMessages((prev) => [...prev, flagMsg]);
    }

    // Generate follow-up or next question
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < currentQuestions.length) {
      const followUp = generateFollowUp(question, trimmed);
      const followUpMsg: ChatMsg = { id: generateId(), role: 'agent', content: followUp };
      const nextQuestion: ChatMsg = {
        id: generateId(),
        role: 'agent',
        content: currentQuestions[nextIndex].question,
      };
      setTimeout(() => {
        setMessages((prev) => [...prev, followUpMsg, nextQuestion]);
        setCurrentQuestionIndex(nextIndex);
      }, 400);
    } else {
      // All questions in this area asked
      const doneMsg: ChatMsg = {
        id: generateId(),
        role: 'agent',
        content: `Great, I have what I need for the ${currentAreaInfo?.label} section. You can mark this area as complete when you are ready, or type additional details if you want to add more context.`,
      };
      setTimeout(() => {
        setMessages((prev) => [...prev, doneMsg]);
      }, 400);
    }
  }, [input, currentQuestionIndex, currentQuestions, currentArea, currentAreaInfo, addResponse, projectId]);

  const handleMarkComplete = useCallback(() => {
    completeArea(projectId, currentArea);

    // Move to next incomplete area
    const nextArea = ANALYSIS_AREAS.find(
      (a) => a.key !== currentArea && !completedAreas.includes(a.key)
    );
    if (nextArea) {
      const transitionMsg: ChatMsg = {
        id: generateId(),
        role: 'system',
        content: `${currentAreaInfo?.label} marked complete. Moving to next area...`,
      };
      setMessages((prev) => [...prev, transitionMsg]);
      setCurrentQuestionIndex(0);
      setTimeout(() => {
        setArea(projectId, nextArea.key);
      }, 300);
    } else {
      const allDoneMsg: ChatMsg = {
        id: generateId(),
        role: 'system',
        content: 'All 8 analysis areas are complete. You can now generate the Needs Analysis Report.',
      };
      setMessages((prev) => [...prev, allDoneMsg]);
    }
  }, [completeArea, projectId, currentArea, completedAreas, currentAreaInfo, setArea]);

  const handleGenerateReport = useCallback(() => {
    setIsGenerating(true);
    const generatingMsg: ChatMsg = {
      id: generateId(),
      role: 'system',
      content: 'Generating your Needs Analysis Report...',
    };
    setMessages((prev) => [...prev, generatingMsg]);

    // Simulate generation delay
    setTimeout(() => {
      const report = generateSampleReport(projectId, responses, allRedFlags);
      setReport(projectId, report);
      completeWizard(projectId);
      setIsGenerating(false);
    }, 1500);
  }, [projectId, responses, allRedFlags, setReport, completeWizard]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isCurrentAreaComplete = completedAreas.includes(currentArea);

  return (
    <div className="flex flex-col h-full">
      {/* Area badge header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-surface-200 bg-white">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-100 text-brand-700">
            {currentAreaInfo?.label || currentArea}
          </span>
          <span className="text-xs text-surface-500">
            {completedAreas.length} of {ANALYSIS_AREAS.length} areas completed
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!isCurrentAreaComplete && !allAreasComplete && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleMarkComplete}
            >
              Mark Area Complete
            </Button>
          )}
          {allAreasComplete && (
            <Button
              variant="primary"
              size="sm"
              loading={isGenerating}
              onClick={handleGenerateReport}
            >
              Generate Report
            </Button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex',
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {msg.role === 'agent' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center mr-2">
                <span className="text-xs font-bold text-brand-700">AI</span>
              </div>
            )}
            <div
              className={cn(
                'max-w-[75%] px-4 py-3 text-sm leading-relaxed',
                msg.role === 'user' &&
                  'bg-brand-600 text-white rounded-2xl rounded-br-md',
                msg.role === 'agent' && !msg.redFlags &&
                  'bg-white border border-surface-200 text-surface-900 rounded-2xl rounded-bl-md',
                msg.role === 'agent' && msg.redFlags &&
                  'bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl rounded-bl-md',
                msg.role === 'system' &&
                  'bg-surface-100 text-surface-600 rounded-xl text-xs font-medium mx-auto text-center max-w-full'
              )}
            >
              {msg.redFlags && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Red Flag Detected</span>
                </div>
              )}
              {msg.content.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < msg.content.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
            {msg.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-200 flex items-center justify-center ml-2">
                <span className="text-xs font-medium text-surface-600">You</span>
              </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-surface-200 bg-white px-5 py-3">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                allAreasComplete
                  ? 'All areas complete. Click "Generate Report" above.'
                  : isCurrentAreaComplete
                    ? 'This area is complete. It will advance to the next area.'
                    : 'Type your answer... (Enter to send, Shift+Enter for new line)'
              }
              disabled={allAreasComplete}
              rows={2}
              className={cn(
                'w-full resize-none rounded-xl border border-surface-300 bg-white px-4 py-2.5 text-sm text-surface-900 placeholder:text-surface-400',
                'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            />
          </div>
          <Button
            variant="primary"
            size="md"
            disabled={!input.trim() || allAreasComplete}
            onClick={handleSubmit}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
