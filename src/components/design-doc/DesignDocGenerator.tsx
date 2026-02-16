'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import {
  DESIGN_DOC_FORMATS,
  DesignDocFormat,
  DesignDocSlide,
  BloomLevel,
  VARKModality,
  ZPDLevel,
} from '@/lib/types';
import { cn, generateId, formatRelativeTime, truncate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import DualTrackView from './DualTrackView';
import DesignDocStats from './DesignDocStats';

interface DesignDocGeneratorProps {
  projectId: string;
}

// ── Sample Slide Templates ──

function generateSampleSlides(
  moduleTitle: string,
  lessonTitle: string | null,
  objectives: string[]
): Omit<DesignDocSlide, 'id' | 'slideNumber'>[] {
  const context = lessonTitle || moduleTitle;
  const objList = objectives.length > 0 ? objectives : [
    `Identify key concepts of ${context}`,
    `Apply best practices for ${context}`,
    `Evaluate outcomes related to ${context}`,
  ];

  const slides: Omit<DesignDocSlide, 'id' | 'slideNumber'>[] = [
    // Slide 1: Introduction & Objectives
    {
      title: 'Introduction & Objectives',
      objectiveRef: 'All objectives',
      learnerView: {
        heading: `Welcome to: ${context}`,
        bodyText: `In this section, you will build foundational knowledge and practical skills related to ${context}. By the end, you will be able to demonstrate competency across the listed learning objectives.`,
        bulletPoints: objList.map((o, i) => `Objective ${i + 1}: ${o}`),
        interactionDescription: '',
        visualDescription: 'Title slide with module banner image and list of learning objectives displayed as an animated checklist.',
        audioScript: `Welcome to ${context}. In this module, we will cover ${objList.length} key learning objectives. Let me walk you through what you will be able to do by the end of this session.`,
        accessibilityFeatures: [
          'Alt text for banner image',
          'Objectives list readable by screen reader',
          'High contrast text on background',
        ],
      },
      designNotes: {
        instructionalRationale: 'Setting expectations and activating prior knowledge. Advance organizer following Ausubel\'s theory -- giving learners a framework before detailed content.',
        multimodalStrategy: 'Visual (banner image, animated list) + Auditory (narration) + Read/Write (on-screen text)',
        interactivitySpec: '',
        developmentNotes: 'Use brand template. Animate objectives in sequentially on click or auto-advance.',
        smeReviewFlag: false,
        smeReviewNotes: '',
        accessibilityNotes: 'Ensure animations respect prefers-reduced-motion. Provide text alternative for any visual-only content.',
        branchingLogic: '',
        assessmentScoring: '',
        scaffoldingStrategy: 'This is the advance organizer -- establishes the framework for subsequent scaffolding.',
        assetRequirements: ['Module banner image (1920x1080)', 'Brand slide template'],
        materialRefs: [],
        zpdLevel: 'comfort' as ZPDLevel,
        bloomLevel: 'remember' as BloomLevel,
      },
    },

    // Slide 2: Key Concepts
    {
      title: 'Key Concepts',
      objectiveRef: objList[0] || 'Objective 1',
      learnerView: {
        heading: 'Key Concepts & Terminology',
        bodyText: `Before we dive into practice, let us establish the core concepts you will need. Each term below is foundational to understanding ${context}.`,
        bulletPoints: [
          'Concept A: A fundamental principle that underpins the entire topic area',
          'Concept B: A process or method commonly used by practitioners',
          'Concept C: A critical distinction that differentiates expert from novice understanding',
          'Concept D: A real-world application that connects theory to practice',
        ],
        interactionDescription: 'Matching activity: learners drag each concept to its correct definition. Immediate feedback after each match with explanation of why the pairing is correct.',
        visualDescription: 'Infographic showing the relationship between the four key concepts as a connected diagram. Each concept is a node with connecting lines showing dependencies.',
        audioScript: 'Let us review the key concepts you will need for this module. Pay attention to how these concepts relate to each other -- understanding these connections will help you in the practice activities ahead.',
        accessibilityFeatures: [
          'Alt text for concept relationship diagram',
          'Drag-and-drop has keyboard alternative (dropdown selectors)',
          'Audio descriptions for visual diagram',
        ],
      },
      designNotes: {
        instructionalRationale: 'Building conceptual foundation before procedural application. Following content sequencing best practice: concepts before procedures, simple to complex.',
        multimodalStrategy: 'Visual (infographic diagram) + Read/Write (definitions) + Kinesthetic (matching activity) + Auditory (narration)',
        interactivitySpec: 'Drag-and-drop matching: 4 terms to 4 definitions. On correct match, show green highlight + brief explanation. On incorrect match, show hint and allow retry (max 2 retries before showing answer).',
        developmentNotes: 'Infographic should follow brand guidelines. Ensure matching activity works on mobile (tap-to-select fallback).',
        smeReviewFlag: true,
        smeReviewNotes: 'SME needs to verify that concept definitions are accurate and that the relationship diagram correctly represents dependencies.',
        accessibilityNotes: 'Matching activity must have keyboard-only alternative. ARIA live regions for feedback messages.',
        branchingLogic: '',
        assessmentScoring: 'Formative only -- no score recorded. Track attempts for analytics.',
        scaffoldingStrategy: 'Worked example: first match is demonstrated, remaining 3 are learner-driven. Hints available on demand.',
        assetRequirements: ['Concept relationship infographic', 'Matching activity assets (term cards, definition cards)'],
        materialRefs: [],
        zpdLevel: 'learning' as ZPDLevel,
        bloomLevel: 'understand' as BloomLevel,
      },
    },

    // Slide 3: Guided Practice
    {
      title: 'Guided Practice',
      objectiveRef: objList[Math.min(1, objList.length - 1)] || 'Objective 2',
      learnerView: {
        heading: 'Guided Practice: Real-World Scenario',
        bodyText: 'Read the following scenario carefully. You will need to make decisions based on what you have learned so far.',
        bulletPoints: [
          'You are a team lead who has just discovered a potential issue',
          'Multiple stakeholders have competing priorities',
          'You have limited time and resources to respond',
          'Your decision will affect team outcomes for the next quarter',
        ],
        interactionDescription: 'Branching scenario: Learner reads the situation and selects from 3 response options. Each option leads to a different consequence screen showing realistic outcomes. After seeing the consequence, learner reflects on their choice and can try again.',
        visualDescription: 'Scenario illustration showing a workplace meeting room with visual cues about the situation. Each decision option is presented as a dialog card.',
        audioScript: 'Now it is time to put your knowledge into practice. In this scenario, you will face a realistic workplace situation. There is no single "perfect" answer -- each choice has trade-offs. Think carefully about what you have learned before making your decision.',
        accessibilityFeatures: [
          'Scenario text available as screen-reader friendly narrative',
          'Decision options clearly labeled with keyboard shortcuts (1, 2, 3)',
          'Consequence screens have text descriptions for all visual elements',
        ],
      },
      designNotes: {
        instructionalRationale: 'Gradual Release of Responsibility: "We do" phase. Guided practice with embedded support. Scenario forces application of concepts in a realistic context with real-world ambiguity.',
        multimodalStrategy: 'Visual (scenario illustration) + Read/Write (scenario text) + Kinesthetic (decision-making) + Auditory (narration)',
        interactivitySpec: 'Branching: 3 options per decision point, each leading to a unique consequence. Option A = optimal response, Option B = partially correct (addresses symptom not cause), Option C = common misconception. Each consequence screen includes "What happened" + "Why" + "What would have been better" feedback.',
        developmentNotes: 'Scenario should feel authentic. Use names and situations that reflect the target audience. Avoid obviously wrong answers.',
        smeReviewFlag: true,
        smeReviewNotes: 'SME should verify scenario realism and that Option A truly represents best practice in the field.',
        accessibilityNotes: 'Ensure branching navigation is fully keyboard accessible. Provide text-only version as alternative.',
        branchingLogic: 'Decision 1: A -> Consequence A (positive) -> Continue. B -> Consequence B (mixed) -> Retry or Continue. C -> Consequence C (negative) -> Mandatory retry with hint.',
        assessmentScoring: 'Formative: Track first-attempt choice for analytics. No grade impact.',
        scaffoldingStrategy: 'Guided practice with embedded hints. "Why" explanations in feedback model expert thinking. Option to retry after seeing consequences.',
        assetRequirements: ['Scenario illustration', '3 consequence screen illustrations', 'Decision card UI components'],
        materialRefs: [],
        zpdLevel: 'learning' as ZPDLevel,
        bloomLevel: 'apply' as BloomLevel,
      },
    },

    // Slide 4: Application Activity
    {
      title: 'Application Activity',
      objectiveRef: objList[Math.min(2, objList.length - 1)] || 'Objective 3',
      learnerView: {
        heading: 'Application: Build Your Own Plan',
        bodyText: 'Now it is your turn to apply what you have learned independently. Using the template provided, create a plan that addresses the challenge below.',
        bulletPoints: [
          'Review the challenge brief carefully',
          'Use the provided template to structure your response',
          'Consider at least 3 of the key concepts from this module',
          'Submit your plan for peer or facilitator review',
        ],
        interactionDescription: 'Open-ended activity: Learner completes a structured template (fillable form) that walks them through creating a plan. Template includes guiding prompts for each section. Learner can save progress and return later.',
        visualDescription: 'Split-screen layout: challenge brief on the left, fillable template on the right. Progress bar at the top showing sections completed.',
        audioScript: 'This is your independent practice activity. You will create your own plan using everything you have learned. Do not worry about getting it perfect -- the goal is to apply the concepts and get feedback. Take your time, and remember you can save your progress at any point.',
        accessibilityFeatures: [
          'Form fields have descriptive labels and help text',
          'Progress bar communicates status to screen readers',
          'Template sections use proper heading hierarchy',
        ],
      },
      designNotes: {
        instructionalRationale: 'Gradual Release of Responsibility: "You do" phase. Independent practice that requires synthesis of multiple concepts. Moves beyond recall/application to evaluation of trade-offs.',
        multimodalStrategy: 'Read/Write (template completion) + Kinesthetic (hands-on plan building) + Visual (split-screen layout)',
        interactivitySpec: 'Fillable template with 4-5 sections. Each section has a guiding prompt, a text area, and optional "hint" toggle. Auto-save every 30 seconds. Submit button triggers peer/facilitator review workflow.',
        developmentNotes: 'Template should be downloadable as PDF for offline completion. Consider integrating with LMS assignment submission.',
        smeReviewFlag: false,
        smeReviewNotes: '',
        accessibilityNotes: 'All form fields must have associated labels. Error messages must be programmatically linked to fields. Auto-save must not disrupt screen reader focus.',
        branchingLogic: '',
        assessmentScoring: 'Rubric-based scoring: 4 criteria (Completeness, Accuracy, Application of Concepts, Feasibility) x 4 levels (Exemplary, Proficient, Developing, Beginning). See rubric document.',
        scaffoldingStrategy: 'Scaffolding withdrawn: only optional hints available. Template structure provides minimal framework. This is intentional -- learner should demonstrate independent competence.',
        assetRequirements: ['Fillable template UI component', 'Challenge brief document', 'Rubric document for facilitators'],
        materialRefs: [],
        zpdLevel: 'stretch' as ZPDLevel,
        bloomLevel: 'evaluate' as BloomLevel,
      },
    },

    // Slide 5: Knowledge Check
    {
      title: 'Knowledge Check',
      objectiveRef: 'All objectives',
      learnerView: {
        heading: 'Knowledge Check',
        bodyText: 'Test your understanding with these questions. This is a formative assessment -- use it to identify areas where you may need to review.',
        bulletPoints: [
          'Question 1: Recall a key definition from this module',
          'Question 2: Explain the relationship between two concepts',
          'Question 3: Given a scenario, select the best course of action',
          'Question 4: Evaluate which approach would be most effective and justify your answer',
        ],
        interactionDescription: 'Mixed-format quiz: 1 multiple-choice (recall), 1 short-answer (explain), 1 scenario-based MC (apply), 1 open-ended (evaluate). Immediate feedback with explanations after each question. Summary screen at end with score and review recommendations.',
        visualDescription: 'Clean quiz interface with one question per screen. Progress indicator at top. Color-coded feedback (green for correct, amber for partially correct, red for incorrect).',
        audioScript: 'Let us check your understanding. These four questions cover the key objectives from this module. Take your time, and remember -- getting a question wrong is a learning opportunity. Read the feedback carefully after each answer.',
        accessibilityFeatures: [
          'Quiz questions and options readable by screen reader',
          'Feedback messages use ARIA live regions',
          'Color-coded feedback supplemented with icons and text labels',
          'Sufficient time allowed (no countdown timer)',
        ],
      },
      designNotes: {
        instructionalRationale: 'Formative assessment aligned to all module objectives. Distributed across Bloom\'s levels: Q1 = Remember, Q2 = Understand, Q3 = Apply, Q4 = Evaluate. Provides diagnostic information for both learner and facilitator.',
        multimodalStrategy: 'Read/Write (questions and feedback text) + Visual (feedback indicators) + Kinesthetic (answering questions)',
        interactivitySpec: 'Q1: 4-option MC, 1 correct, 3 distractors based on common misconceptions. Q2: Short answer text field, auto-graded against keyword rubric. Q3: Scenario MC with 4 options including 1 best, 1 acceptable, 2 misconceptions. Q4: Open response, facilitator-graded.',
        developmentNotes: 'Randomize option order for MC questions. Store attempt data for learning analytics. Allow retry for Q1-Q3 (max 2 attempts).',
        smeReviewFlag: true,
        smeReviewNotes: 'SME should verify: (1) correct answers are unambiguously correct, (2) distractors represent real misconceptions, (3) scenario in Q3 is realistic.',
        accessibilityNotes: 'Do not use color alone for correct/incorrect feedback. Ensure all quiz interactions are keyboard navigable. Timer must be adjustable or absent.',
        branchingLogic: 'If score < 50%: recommend reviewing Key Concepts slide. If score 50-80%: recommend reviewing Guided Practice. If score > 80%: proceed to next module.',
        assessmentScoring: 'Q1: 1 point (MC). Q2: 2 points (keyword rubric: 0/1/2). Q3: 2 points (MC with partial credit for acceptable answer). Q4: 5 points (rubric-graded). Total: 10 points. Pass threshold: 7/10.',
        scaffoldingStrategy: 'Hints available on first retry. Full explanation shown after second attempt or correct answer. Builds on graduated release -- this is the "check" phase.',
        assetRequirements: ['Quiz UI component', 'Feedback illustrations (optional)', 'Scoring rubric for Q2 and Q4'],
        materialRefs: [],
        zpdLevel: 'learning' as ZPDLevel,
        bloomLevel: 'analyze' as BloomLevel,
      },
    },
  ];

  return slides;
}

// ── Computed Stats Helpers ──

function computeBloomDistribution(slides: DesignDocSlide[]): Record<BloomLevel, number> {
  const dist: Record<BloomLevel, number> = {
    remember: 0,
    understand: 0,
    apply: 0,
    analyze: 0,
    evaluate: 0,
    create: 0,
  };
  slides.forEach((s) => {
    const level = s.designNotes.bloomLevel;
    if (level && dist[level] !== undefined) {
      dist[level]++;
    }
  });
  return dist;
}

function computeVarkCoverage(slides: DesignDocSlide[]): Record<VARKModality, number> {
  const coverage: Record<VARKModality, number> = {
    visual: 0,
    auditory: 0,
    readWrite: 0,
    kinesthetic: 0,
  };
  slides.forEach((s) => {
    if (s.learnerView.visualDescription.trim()) coverage.visual++;
    if (s.learnerView.audioScript.trim()) coverage.auditory++;
    if (s.learnerView.bodyText.trim() || s.learnerView.bulletPoints.length > 0) coverage.readWrite++;
    if (s.learnerView.interactionDescription.trim()) coverage.kinesthetic++;
  });
  return coverage;
}

function computeInteractivityScore(slides: DesignDocSlide[]): number {
  if (slides.length === 0) return 0;
  let score = 0;
  slides.forEach((s) => {
    if (s.learnerView.interactionDescription.trim()) score += 20;
    if (s.designNotes.interactivitySpec.trim()) score += 15;
    if (s.designNotes.branchingLogic.trim()) score += 15;
    if (s.designNotes.assessmentScoring.trim()) score += 10;
    if (s.designNotes.scaffoldingStrategy.trim()) score += 10;
  });
  return Math.min(100, Math.round(score / slides.length));
}

function computeAccessibilityScore(slides: DesignDocSlide[]): number {
  if (slides.length === 0) return 0;
  let score = 0;
  slides.forEach((s) => {
    if (s.learnerView.accessibilityFeatures.length > 0) score += 30;
    if (s.designNotes.accessibilityNotes.trim()) score += 20;
    if (s.learnerView.audioScript.trim()) score += 15; // has audio transcript
    if (s.learnerView.visualDescription.trim()) score += 15; // visual described
    // bonus for multiple accessibility features
    if (s.learnerView.accessibilityFeatures.length >= 3) score += 20;
  });
  return Math.min(100, Math.round(score / slides.length));
}

// ── Main Component ──

export default function DesignDocGenerator({ projectId }: DesignDocGeneratorProps) {
  const docs = useAppStore((s) => s.getDesignDocs(projectId));
  const activeDocId = useAppStore((s) => s.activeDesignDocId);
  const setActiveDoc = useAppStore((s) => s.setActiveDesignDoc);
  const createDoc = useAppStore((s) => s.createDesignDoc);
  const deleteDoc = useAppStore((s) => s.deleteDesignDoc);
  const getCourseOutline = useAppStore((s) => s.getCourseOutline);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<DesignDocFormat>('elearning');
  const [customTitle, setCustomTitle] = useState('');
  const [generating, setGenerating] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const outline = getCourseOutline(projectId);
  const modules = outline?.modules || [];

  const selectedModule = modules.find((m) => m.id === selectedModuleId);
  const lessons = selectedModule?.lessons || [];
  const selectedLesson = lessons.find((l) => l.id === selectedLessonId);

  const activeDoc = docs.find((d) => d.id === activeDocId);

  const formatLabel = (key: DesignDocFormat) =>
    DESIGN_DOC_FORMATS.find((f) => f.key === key)?.label || key;

  // Auto-generate title
  const autoTitle = useMemo(() => {
    if (customTitle.trim()) return customTitle;
    const parts: string[] = [];
    if (selectedModule) parts.push(selectedModule.title);
    if (selectedLesson) parts.push(selectedLesson.title);
    parts.push(formatLabel(selectedFormat));
    return parts.join(' - ') || 'Untitled Design Document';
  }, [customTitle, selectedModule, selectedLesson, selectedFormat]);

  const handleGenerate = () => {
    setGenerating(true);

    // Gather objectives
    const objectives: string[] = [];
    if (selectedLesson) {
      selectedLesson.objectives.forEach((o) => objectives.push(o.text));
    } else if (selectedModule) {
      selectedModule.objectives.forEach((o) => objectives.push(o.text));
      selectedModule.lessons.forEach((l) =>
        l.objectives.forEach((o) => objectives.push(o.text))
      );
    }

    const sampleSlides = generateSampleSlides(
      selectedModule?.title || 'Module',
      selectedLesson?.title || null,
      objectives.slice(0, 5)
    );

    // Build slides with IDs and numbers
    const slides: DesignDocSlide[] = sampleSlides.map((s, i) => ({
      ...s,
      id: generateId(),
      slideNumber: i + 1,
    }));

    const bloomDist = computeBloomDistribution(slides);
    const varkCov = computeVarkCoverage(slides);
    const interactScore = computeInteractivityScore(slides);
    const accessScore = computeAccessibilityScore(slides);

    const newDoc = createDoc({
      projectId,
      moduleId: selectedModuleId,
      lessonId: selectedLessonId || undefined,
      format: selectedFormat,
      title: autoTitle,
      slides,
      bloomDistribution: bloomDist,
      varkCoverage: varkCov,
      interactivityScore: interactScore,
      accessibilityCompliance: accessScore,
    });

    setActiveDoc(newDoc.id);
    setShowCreateModal(false);
    setSelectedModuleId('');
    setSelectedLessonId('');
    setCustomTitle('');
    setGenerating(false);
  };

  const handleDeleteDoc = (docId: string) => {
    deleteDoc(docId);
    setConfirmDeleteId(null);
    if (activeDocId === docId) {
      setActiveDoc(null);
    }
  };

  const resetCreateForm = () => {
    setSelectedModuleId('');
    setSelectedLessonId('');
    setSelectedFormat('elearning');
    setCustomTitle('');
    setShowCreateModal(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* ── Top Section: Doc List & Create ── */}
      <div className="flex-shrink-0 px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-surface-900">Design Documents</h2>
            <p className="text-xs text-surface-500 mt-0.5">
              Dual-track design documents with learner view and developer notes
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateModal(true)}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            }
          >
            Create New
          </Button>
        </div>

        {/* Existing docs list */}
        {docs.length > 0 ? (
          <div className="space-y-2 mb-4">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all',
                  activeDocId === doc.id
                    ? 'border-brand-300 bg-brand-50 shadow-sm'
                    : 'border-surface-200 bg-white hover:border-surface-300 hover:shadow-sm'
                )}
                onClick={() => setActiveDoc(doc.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    activeDocId === doc.id
                      ? 'bg-brand-100 text-brand-700'
                      : 'bg-surface-100 text-surface-500'
                  )}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <path d="M8 21h8M12 17v4" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-surface-900 truncate">
                      {truncate(doc.title, 60)}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-surface-100 text-surface-600">
                        {formatLabel(doc.format)}
                      </span>
                      <span className="text-xs text-surface-400">
                        {doc.slides.length} slide{doc.slides.length !== 1 ? 's' : ''}
                      </span>
                      <span className="text-xs text-surface-400">
                        v{doc.version}
                      </span>
                      <span className="text-xs text-surface-400">
                        {formatRelativeTime(doc.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {confirmDeleteId === doc.id ? (
                    <>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDoc(doc.id);
                        }}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(doc.id);
                      }}
                      className="p-1.5 rounded text-surface-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      aria-label="Delete document"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 mb-4 bg-surface-50 border border-surface-200 border-dashed rounded-lg">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-2 text-surface-300"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
            <p className="text-sm text-surface-500 font-medium">No design documents yet</p>
            <p className="text-xs text-surface-400 mt-1">
              Create your first design document to start building dual-track slide content.
            </p>
          </div>
        )}

        {/* Stats bar for active doc */}
        {activeDoc && <DesignDocStats doc={activeDoc} />}
      </div>

      {/* ── DualTrackEditor ── */}
      {activeDoc ? (
        <div className="flex-1 min-h-0 border-t border-surface-200">
          <DualTrackView docId={activeDoc.id} />
        </div>
      ) : (
        docs.length > 0 && (
          <div className="flex-1 flex items-center justify-center text-surface-400 border-t border-surface-200">
            <p className="text-sm">Select a design document above to begin editing.</p>
          </div>
        )
      )}

      {/* ── Create Modal ── */}
      <Modal
        open={showCreateModal}
        onClose={resetCreateForm}
        title="Create New Design Document"
        className="max-w-xl"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={resetCreateForm}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleGenerate}
              loading={generating}
              disabled={!selectedModuleId}
            >
              Generate Document
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Module Selection */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">
              Module <span className="text-red-500">*</span>
            </label>
            {modules.length > 0 ? (
              <select
                value={selectedModuleId}
                onChange={(e) => {
                  setSelectedModuleId(e.target.value);
                  setSelectedLessonId('');
                }}
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
              >
                <option value="">Select a module...</option>
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    Module {m.order}: {m.title}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-700">
                  No course outline found. Create a course outline first, or a default module will be used.
                </p>
                <button
                  onClick={() => setSelectedModuleId('__default__')}
                  className="mt-1.5 text-xs text-amber-800 font-medium underline hover:no-underline"
                >
                  Proceed without a module
                </button>
              </div>
            )}
          </div>

          {/* Lesson Selection (optional) */}
          {selectedModuleId && selectedModuleId !== '__default__' && lessons.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                Lesson <span className="text-surface-400 font-normal">(optional)</span>
              </label>
              <select
                value={selectedLessonId}
                onChange={(e) => setSelectedLessonId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
              >
                <option value="">All lessons (entire module)</option>
                {lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    Lesson {l.order}: {l.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">
              Format
            </label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as DesignDocFormat)}
              className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
            >
              {DESIGN_DOC_FORMATS.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Title */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">
              Title <span className="text-surface-400 font-normal">(auto-generated if empty)</span>
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder={autoTitle}
              className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
            <p className="text-xs text-surface-400 mt-1">
              Title: <span className="font-medium text-surface-600">{autoTitle}</span>
            </p>
          </div>

          {/* Preview info */}
          <div className="p-3 bg-brand-50 border border-brand-100 rounded-lg">
            <p className="text-xs text-brand-700">
              <span className="font-semibold">Auto-generated content:</span> 5 sample slides will be
              created with learner view and design notes pre-populated. These include: Introduction &
              Objectives, Key Concepts, Guided Practice, Application Activity, and Knowledge Check.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
