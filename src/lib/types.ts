// ── ADDIE Phases ──
export type ADDIEPhase = 'analysis' | 'design' | 'development' | 'implementation' | 'evaluation';

export const ADDIE_PHASES: { key: ADDIEPhase; label: string; description: string }[] = [
  { key: 'analysis', label: 'Analysis', description: 'Learner needs, gaps, and constraints' },
  { key: 'design', label: 'Design', description: 'Objectives, structure, and strategy' },
  { key: 'development', label: 'Development', description: 'Content, activities, and assessments' },
  { key: 'implementation', label: 'Implementation', description: 'Delivery and facilitation' },
  { key: 'evaluation', label: 'Evaluation', description: 'Effectiveness and iteration' },
];

// ── Bloom's Taxonomy ──
export type BloomLevel = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';

export const BLOOM_LEVELS: { key: BloomLevel; label: string; verbs: string[] }[] = [
  { key: 'remember', label: 'Remember', verbs: ['define', 'list', 'recall', 'identify', 'name'] },
  { key: 'understand', label: 'Understand', verbs: ['explain', 'summarize', 'paraphrase', 'classify'] },
  { key: 'apply', label: 'Apply', verbs: ['execute', 'implement', 'solve', 'demonstrate'] },
  { key: 'analyze', label: 'Analyze', verbs: ['differentiate', 'organize', 'compare', 'deconstruct'] },
  { key: 'evaluate', label: 'Evaluate', verbs: ['critique', 'judge', 'justify', 'assess'] },
  { key: 'create', label: 'Create', verbs: ['design', 'construct', 'produce', 'plan'] },
];

// ── Course Types ──
export type CourseType =
  | 'ilt'
  | 'self-paced'
  | 'blended'
  | 'micro-learning'
  | 'bootcamp'
  | 'certification'
  | 'performance-support'
  | 'job-aid';

export const COURSE_TYPES: { key: CourseType; label: string }[] = [
  { key: 'ilt', label: 'Instructor-Led Training' },
  { key: 'self-paced', label: 'Self-Paced E-Learning' },
  { key: 'blended', label: 'Blended Learning' },
  { key: 'micro-learning', label: 'Micro-Learning' },
  { key: 'bootcamp', label: 'Bootcamp / Workshop' },
  { key: 'certification', label: 'Certification Program' },
  { key: 'performance-support', label: 'Performance Support' },
  { key: 'job-aid', label: 'Job Aid / Reference' },
];

// ── Project ──
export interface Project {
  id: string;
  title: string;
  description: string;
  courseType: CourseType;
  targetAudience: string;
  industry: string;
  status: 'active' | 'completed' | 'archived';
  currentPhase: ADDIEPhase;
  phaseProgress: Record<ADDIEPhase, number>; // 0-100
  tags: string[];
  createdAt: string;
  updatedAt: string;
  materialIds: string[];
}

// ── Chat ──
export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  projectId: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  attachments?: string[]; // material IDs referenced
}

// ── Source Materials ──
export type MaterialType =
  | 'pdf'
  | 'docx'
  | 'pptx'
  | 'xlsx'
  | 'txt'
  | 'md'
  | 'rtf'
  | 'video'
  | 'audio'
  | 'url'
  | 'scorm'
  | 'image'
  | 'other';

export type MaterialCategory =
  | 'sme-content'
  | 'existing-course'
  | 'reference'
  | 'media-asset'
  | 'template'
  | 'other';

export interface MaterialAnalysis {
  keyConcepts: string[];
  suggestedObjectives: string[];
  bloomLevels: BloomLevel[];
  detectedStructure: string[];
  readabilityLevel: string;
  contentGaps: string[];
  glossaryTerms: { term: string; definition: string }[];
  accessibilityIssues: string[];
  summary: string;
}

export interface MaterialSnippet {
  id: string;
  materialId: string;
  content: string;
  page?: number;
  note?: string;
  createdAt: string;
}

export interface Material {
  id: string;
  name: string;
  originalName: string;
  type: MaterialType;
  category: MaterialCategory;
  size: number;
  mimeType: string;
  tags: string[];
  notes: string;
  projectIds: string[];
  collectionIds: string[];
  analysis?: MaterialAnalysis;
  snippets: MaterialSnippet[];
  version: number;
  uploadedAt: string;
  updatedAt: string;
  url?: string; // for URL-type materials
  filePath?: string;
  extractedText?: string;
}

export interface MaterialCollection {
  id: string;
  name: string;
  description: string;
  materialIds: string[];
  createdAt: string;
}

// ── Tags ──
export interface Tag {
  id: string;
  name: string;
  color: string;
  category: 'client' | 'topic' | 'format' | 'status' | 'custom';
}

// ── Quick Actions ──
export interface QuickAction {
  id: string;
  label: string;
  description: string;
  prompt: string;
  icon: string;
  phase?: ADDIEPhase;
}

export const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'new-project',
    label: 'New Project',
    description: 'Start a new course development project',
    prompt: 'I want to start a new course development project. Help me through the analysis phase.',
    icon: 'plus',
  },
  {
    id: 'write-objectives',
    label: 'Write Objectives',
    description: 'Generate learning objectives for a topic',
    prompt: 'Help me write learning objectives using Bloom\'s Taxonomy for my current project.',
    icon: 'target',
    phase: 'design',
  },
  {
    id: 'create-assessment',
    label: 'Create Assessment',
    description: 'Build assessments aligned to objectives',
    prompt: 'Help me create assessments aligned to my learning objectives.',
    icon: 'clipboard',
    phase: 'development',
  },
  {
    id: 'design-activity',
    label: 'Design Activity',
    description: 'Create an interactive learning activity',
    prompt: 'Help me design a meaningful interactive learning activity for my current module.',
    icon: 'puzzle',
    phase: 'development',
  },
  {
    id: 'analyze-materials',
    label: 'Analyze Materials',
    description: 'Analyze uploaded source materials',
    prompt: 'Analyze my uploaded source materials and suggest how to use them in the course.',
    icon: 'search',
    phase: 'analysis',
  },
  {
    id: 'accessibility-review',
    label: 'Accessibility Review',
    description: 'Review content for WCAG 2.0 AA compliance',
    prompt: 'Review my current content for WCAG 2.0 AA accessibility compliance.',
    icon: 'eye',
    phase: 'evaluation',
  },
  {
    id: 'course-outline',
    label: 'Course Outline',
    description: 'Generate a structured course outline',
    prompt: 'Help me create a detailed course outline with modules and lessons.',
    icon: 'list',
    phase: 'design',
  },
  {
    id: 'facilitator-guide',
    label: 'Facilitator Guide',
    description: 'Create an instructor facilitator guide',
    prompt: 'Help me create a facilitator guide for my course.',
    icon: 'book',
    phase: 'implementation',
  },
];

// ══════════════════════════════════════════════════════
// FEATURE 1: NEEDS ANALYSIS WIZARD
// ══════════════════════════════════════════════════════

export type AnalysisArea =
  | 'performance-gap'
  | 'root-cause'
  | 'audience'
  | 'context-constraints'
  | 'success-metrics'
  | 'business-impact'
  | 'multimodal'
  | 'accessibility';

export const ANALYSIS_AREAS: { key: AnalysisArea; label: string; description: string; icon: string }[] = [
  { key: 'performance-gap', label: 'Performance Gap', description: 'Current vs desired state', icon: 'gap' },
  { key: 'root-cause', label: 'Root Cause', description: 'Is this really a training problem?', icon: 'search' },
  { key: 'audience', label: 'Audience Analysis', description: 'Learner characteristics, prerequisites, ZPD', icon: 'users' },
  { key: 'context-constraints', label: 'Context & Constraints', description: 'Environment, timeline, budget', icon: 'settings' },
  { key: 'success-metrics', label: 'Success Metrics', description: 'Measuring effectiveness', icon: 'chart' },
  { key: 'business-impact', label: 'Business Impact', description: 'Organizational problem being solved', icon: 'building' },
  { key: 'multimodal', label: 'Multimodal Requirements', description: 'Delivery constraints, learner preferences', icon: 'layers' },
  { key: 'accessibility', label: 'Accessibility', description: 'WCAG level, assistive technology', icon: 'accessibility' },
];

export interface AnalysisQuestion {
  id: string;
  area: AnalysisArea;
  question: string;
  followUpHint?: string;
  required: boolean;
}

export interface AnalysisResponse {
  questionId: string;
  area: AnalysisArea;
  question: string;
  answer: string;
  timestamp: string;
}

export interface AnalysisRedFlag {
  id: string;
  severity: 'warning' | 'critical';
  area: AnalysisArea;
  message: string;
  recommendation: string;
}

export interface NeedsAnalysisReport {
  id: string;
  projectId: string;
  executiveSummary: string;
  performanceGap: { currentState: string; desiredState: string; evidence: string[] };
  learnerProfile: {
    demographics: string;
    priorKnowledge: string;
    motivation: string;
    zpdAssessment: string;
    prerequisites: string[];
  };
  rootCauseAnalysis: { isTrainingAppropriate: boolean; reasoning: string; alternativeSolutions: string[] };
  constraints: { timeline: string; budget: string; technology: string; environment: string; stakeholders: string[] };
  multimodalRecommendations: { primaryModality: string; secondaryModalities: string[]; rationale: string };
  accessibilityRequirements: { wcagLevel: string; assistiveTech: string[]; considerations: string[] };
  successMetrics: { metric: string; measurement: string; target: string }[];
  businessImpact: { problem: string; costOfInaction: string; expectedROI: string };
  recommendation: {
    format: CourseType;
    duration: string;
    deliveryMethod: string;
    rationale: string;
  };
  materialReferences: string[];
  materialGaps: string[];
  redFlags: AnalysisRedFlag[];
  createdAt: string;
}

export type AnalysisWizardStatus = 'not-started' | 'in-progress' | 'completed';

export interface AnalysisWizardState {
  status: AnalysisWizardStatus;
  currentArea: AnalysisArea;
  completedAreas: AnalysisArea[];
  responses: AnalysisResponse[];
  report?: NeedsAnalysisReport;
}

// ══════════════════════════════════════════════════════
// FEATURE 2: COURSE OUTLINE BUILDER
// ══════════════════════════════════════════════════════

export type VARKModality = 'visual' | 'auditory' | 'readWrite' | 'kinesthetic';

export const VARK_MODALITIES: { key: VARKModality; label: string; short: string; color: string }[] = [
  { key: 'visual', label: 'Visual', short: 'V', color: 'bg-blue-100 text-blue-800' },
  { key: 'auditory', label: 'Auditory', short: 'A', color: 'bg-purple-100 text-purple-800' },
  { key: 'readWrite', label: 'Read/Write', short: 'R', color: 'bg-green-100 text-green-800' },
  { key: 'kinesthetic', label: 'Kinesthetic', short: 'K', color: 'bg-orange-100 text-orange-800' },
];

export type ZPDLevel = 'comfort' | 'learning' | 'stretch';

export interface LearningObjective {
  id: string;
  text: string;
  bloomLevel: BloomLevel;
  assessmentAligned: boolean;
  materialRefs: string[];
}

export interface LessonPlan {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  objectives: LearningObjective[];
  modalities: VARKModality[];
  zpdLevel: ZPDLevel;
  activities: string[];
  assessmentType?: string;
  materialRefs: string[];
  accessibilityNotes: string[];
  order: number;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  lessons: LessonPlan[];
  objectives: LearningObjective[];
  assessmentStrategy: string;
  modalities: VARKModality[];
  materialRefs: string[];
  order: number;
  collapsed?: boolean;
}

export interface CourseOutline {
  id: string;
  projectId: string;
  courseGoal: string;
  totalDuration: number;
  modules: CourseModule[];
  bloomDistribution: Record<BloomLevel, number>;
  varkCoverage: Record<VARKModality, number>;
  createdAt: string;
  updatedAt: string;
  version: number;
}

// ══════════════════════════════════════════════════════
// FEATURE 3: DESIGN DOCUMENT GENERATOR
// ══════════════════════════════════════════════════════

export type DesignDocFormat = 'ilt-slides' | 'elearning' | 'video-script' | 'job-aid' | 'facilitator-guide';

export const DESIGN_DOC_FORMATS: { key: DesignDocFormat; label: string }[] = [
  { key: 'ilt-slides', label: 'ILT Slides' },
  { key: 'elearning', label: 'E-Learning Module' },
  { key: 'video-script', label: 'Video Script' },
  { key: 'job-aid', label: 'Job Aid' },
  { key: 'facilitator-guide', label: 'Facilitator Guide' },
];

export interface LearnerViewContent {
  heading: string;
  bodyText: string;
  bulletPoints: string[];
  interactionDescription: string;
  visualDescription: string;
  audioScript: string;
  accessibilityFeatures: string[];
}

export interface DesignNotesContent {
  instructionalRationale: string;
  multimodalStrategy: string;
  interactivitySpec: string;
  developmentNotes: string;
  smeReviewFlag: boolean;
  smeReviewNotes: string;
  accessibilityNotes: string;
  branchingLogic: string;
  assessmentScoring: string;
  scaffoldingStrategy: string;
  assetRequirements: string[];
  materialRefs: string[];
  zpdLevel: ZPDLevel;
  bloomLevel: BloomLevel;
}

export interface DesignDocSlide {
  id: string;
  slideNumber: number;
  title: string;
  objectiveRef: string;
  learnerView: LearnerViewContent;
  designNotes: DesignNotesContent;
}

export interface DesignDocument {
  id: string;
  projectId: string;
  moduleId: string;
  lessonId?: string;
  format: DesignDocFormat;
  title: string;
  slides: DesignDocSlide[];
  bloomDistribution: Record<BloomLevel, number>;
  varkCoverage: Record<VARKModality, number>;
  interactivityScore: number; // 0-100
  accessibilityCompliance: number; // 0-100
  version: number;
  createdAt: string;
  updatedAt: string;
}

// ══════════════════════════════════════════════════════
// FEATURE 4: QUALITY ASSURANCE TOOLS
// ══════════════════════════════════════════════════════

export type QAToolType =
  | 'alignment'
  | 'blooms'
  | 'multimodal'
  | 'zpd'
  | 'interactivity'
  | 'accessibility'
  | 'style-guide'
  | 'gap-analysis'
  | 'source-material';

export const QA_TOOLS: { key: QAToolType; label: string; description: string; icon: string }[] = [
  { key: 'alignment', label: 'Alignment Checker', description: 'Verify assessments match learning objectives', icon: 'link' },
  { key: 'blooms', label: "Bloom's Analyzer", description: 'Ensure appropriate cognitive levels throughout', icon: 'layers' },
  { key: 'multimodal', label: 'Multimodal Coverage', description: 'Check VARK distribution across course', icon: 'grid' },
  { key: 'zpd', label: 'ZPD Validator', description: 'Assess if content targets learner ZPD', icon: 'target' },
  { key: 'interactivity', label: 'Interactivity Checker', description: 'Detect fake interactivity and score meaningfulness', icon: 'zap' },
  { key: 'accessibility', label: 'Accessibility Validator', description: 'WCAG 2.0 Level AA compliance check', icon: 'eye' },
  { key: 'style-guide', label: 'Style Guide Enforcer', description: 'Check content against writing standards', icon: 'type' },
  { key: 'gap-analysis', label: 'Gap Analysis', description: 'Identify missing components and weak areas', icon: 'search' },
  { key: 'source-material', label: 'Source Material Audit', description: 'Track material usage and coverage', icon: 'folder' },
];

export type QASeverity = 'critical' | 'warning' | 'info' | 'pass';

export interface QAFinding {
  id: string;
  tool: QAToolType;
  severity: QASeverity;
  title: string;
  description: string;
  location: string;
  suggestion: string;
  resolved: boolean;
}

export interface QAReport {
  id: string;
  projectId: string;
  tool: QAToolType;
  score: number; // 0-100
  findings: QAFinding[];
  summary: string;
  runAt: string;
}

export type StyleGuideType = 'pdf-upload' | 'microsoft' | 'custom';

export interface StyleRule {
  id: string;
  category: 'voice' | 'terminology' | 'formatting' | 'structure' | 'tone';
  rule: string;
  example?: string;
  severity: 'error' | 'warning' | 'info';
}

export interface StyleGuide {
  id: string;
  projectId: string;
  name: string;
  type: StyleGuideType;
  rules: StyleRule[];
  uploadedAt: string;
  pdfFileName?: string;
  pdfContent?: string;
}

export const MICROSOFT_STYLE_RULES: StyleRule[] = [
  { id: 'ms-1', category: 'voice', rule: 'Use active voice instead of passive voice', example: '"The manager approves the request" not "The request is approved by the manager"', severity: 'warning' },
  { id: 'ms-2', category: 'voice', rule: 'Use second person (you/your) to address the reader directly', example: '"You can configure settings" not "Users can configure settings"', severity: 'info' },
  { id: 'ms-3', category: 'tone', rule: 'Write in a conversational but professional tone', example: 'Avoid overly formal or stiff language', severity: 'info' },
  { id: 'ms-4', category: 'terminology', rule: 'Use consistent terminology throughout — pick one term for a concept and stick with it', severity: 'warning' },
  { id: 'ms-5', category: 'terminology', rule: 'Define jargon and technical terms on first use', severity: 'warning' },
  { id: 'ms-6', category: 'terminology', rule: 'Avoid Latin abbreviations (e.g., i.e., etc.) — use plain English equivalents', example: '"for example" instead of "e.g.", "that is" instead of "i.e."', severity: 'info' },
  { id: 'ms-7', category: 'formatting', rule: 'Use sentence-style capitalization for headings', example: '"Set up your account" not "Set Up Your Account"', severity: 'info' },
  { id: 'ms-8', category: 'formatting', rule: 'Use numbered lists for sequential steps, bulleted lists for non-sequential items', severity: 'info' },
  { id: 'ms-9', category: 'structure', rule: 'Keep sentences short — aim for 25 words or fewer', severity: 'warning' },
  { id: 'ms-10', category: 'structure', rule: 'Keep paragraphs to 3-5 sentences maximum', severity: 'info' },
  { id: 'ms-11', category: 'structure', rule: 'Lead with the most important information first', severity: 'info' },
  { id: 'ms-12', category: 'structure', rule: 'Use proper heading hierarchy (H1 > H2 > H3) — never skip levels', severity: 'error' },
  { id: 'ms-13', category: 'tone', rule: 'Avoid gendered pronouns — use "they/them" or rewrite the sentence', severity: 'warning' },
  { id: 'ms-14', category: 'tone', rule: 'Avoid culturally specific idioms that may not translate', severity: 'info' },
  { id: 'ms-15', category: 'formatting', rule: 'Use bold for UI elements and user input, not quotes or italics', severity: 'info' },
  { id: 'ms-16', category: 'voice', rule: 'Avoid double negatives', example: '"You can" instead of "You cannot not"', severity: 'warning' },
  { id: 'ms-17', category: 'structure', rule: 'One idea per paragraph — do not bundle multiple concepts together', severity: 'info' },
  { id: 'ms-18', category: 'terminology', rule: 'Use contractions for a friendly tone (do not → don\'t, cannot → can\'t)', severity: 'info' },
];

// ══════════════════════════════════════════════════════
// FEATURE 5: DEVELOPMENT SUPPORT TOOLS
// ══════════════════════════════════════════════════════

// ── Assessment Generator ──

export type AssessmentQuestionType =
  | 'multiple-choice'
  | 'true-false'
  | 'matching'
  | 'short-answer'
  | 'essay'
  | 'scenario-based'
  | 'ordering';

export const ASSESSMENT_QUESTION_TYPES: { key: AssessmentQuestionType; label: string; bloomLevels: BloomLevel[] }[] = [
  { key: 'multiple-choice', label: 'Multiple Choice', bloomLevels: ['remember', 'understand'] },
  { key: 'true-false', label: 'True / False', bloomLevels: ['remember', 'understand'] },
  { key: 'matching', label: 'Matching', bloomLevels: ['remember', 'understand'] },
  { key: 'short-answer', label: 'Short Answer', bloomLevels: ['remember', 'understand', 'apply'] },
  { key: 'essay', label: 'Essay / Open Response', bloomLevels: ['evaluate', 'create'] },
  { key: 'scenario-based', label: 'Scenario-Based', bloomLevels: ['apply', 'analyze', 'evaluate'] },
  { key: 'ordering', label: 'Ordering / Sequencing', bloomLevels: ['understand', 'apply'] },
];

export type QuestionDifficulty = 'foundational' | 'intermediate' | 'advanced';

export interface AnswerChoice {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface MatchingPair {
  id: string;
  prompt: string;
  match: string;
}

export interface AssessmentQuestion {
  id: string;
  type: AssessmentQuestionType;
  topic: string;
  bloomLevel: BloomLevel;
  difficulty: QuestionDifficulty;
  stem: string;
  scenario?: string;
  choices?: AnswerChoice[];
  matchingPairs?: MatchingPair[];
  orderItems?: string[];
  correctAnswer?: string;
  rubricPoints?: string[];
  objectiveRef?: string;
  explanation: string;
  estimatedTime: number; // minutes
  tags: string[];
}

export interface BlueprintModule {
  moduleId: string;
  moduleTitle: string;
  questionCount: number;
  bloomTargets: BloomLevel[];
}

export interface AssessmentBlueprint {
  id: string;
  projectId: string;
  title: string;
  totalQuestions: number;
  modules: BlueprintModule[];
  questionTypeDistribution: Partial<Record<AssessmentQuestionType, number>>;
  bloomDistribution: Partial<Record<BloomLevel, number>>;
  estimatedDuration: number;
  questions: AssessmentQuestion[];
  createdAt: string;
}

// ── Rubric Builder ──

export interface RubricLevel {
  id: string;
  label: string;
  points: number;
  descriptor: string;
}

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  weight: number; // percentage (all criteria weights sum to 100)
  levels: RubricLevel[];
}

export interface GeneratedRubric {
  id: string;
  projectId: string;
  title: string;
  assessmentType: string;
  bloomLevel: BloomLevel;
  totalPoints: number;
  criteria: RubricCriterion[];
  objectiveRef?: string;
  createdAt: string;
}

// ── Learner Persona Generator ──

export type ExperienceLevel = 'novice' | 'intermediate' | 'expert';
export type TechComfortLevel = 'low' | 'medium' | 'high';

export interface LearnerPersona {
  id: string;
  projectId: string;
  name: string;
  role: string;
  ageRange: string;
  experienceLevel: ExperienceLevel;
  background: string;
  goals: string[];
  challenges: string[];
  learningPreferences: VARKModality[];
  techComfort: TechComfortLevel;
  motivation: string;
  priorKnowledge: string;
  workContext: string;
  accessibilityNeeds: string;
  quote: string;
  zpdAssessment: string;
  createdAt: string;
}

// ── Facilitator Guide Generator ──

export interface FacilitatorGuideSection {
  id: string;
  title: string;
  duration: number;
  objectives: string[];
  facilitatorNotes: string;
  activities: string[];
  discussionPrompts: string[];
  materials: string[];
  transitionNote: string;
  timingTips: string;
}

export interface FacilitatorGuide {
  id: string;
  projectId: string;
  courseTitle: string;
  audience: string;
  prerequisites: string;
  roomSetup: string;
  techRequirements: string;
  totalDuration: number;
  sections: FacilitatorGuideSection[];
  createdAt: string;
}

// ── Quick Generate ──

export type QuickGenerateType =
  | 'objectives'
  | 'questions'
  | 'discussion-prompts'
  | 'reflection-questions'
  | 'case-study'
  | 'job-aid'
  | 'activity-instructions';

export interface QuickGenerateResult {
  id: string;
  projectId: string;
  type: QuickGenerateType;
  topic: string;
  bloomLevel?: BloomLevel;
  content: string; // markdown-formatted output
  createdAt: string;
}

// ── Active Dev Tool ──

export type DevToolType =
  | 'assessment-gen'
  | 'blueprint'
  | 'persona-gen'
  | 'rubric-builder'
  | 'facilitator-guide'
  | 'quick-generate';

export const DEV_TOOLS: { key: DevToolType; label: string; description: string; icon: string; phase: ADDIEPhase }[] = [
  { key: 'assessment-gen', label: 'Assessment Generator', description: 'Generate all question types: MC, T/F, scenario-based, essay', icon: 'clipboard', phase: 'development' },
  { key: 'blueprint', label: 'Assessment Blueprint', description: 'Build a complete assessment plan across modules', icon: 'map', phase: 'design' },
  { key: 'persona-gen', label: 'Learner Personas', description: 'Create rich learner personas for your target audience', icon: 'users', phase: 'analysis' },
  { key: 'rubric-builder', label: 'Rubric Builder', description: 'Create scoring rubrics for subjective assessments', icon: 'grid', phase: 'development' },
  { key: 'facilitator-guide', label: 'Facilitator Guide', description: 'Draft instructor guides with timing and activities', icon: 'book', phase: 'implementation' },
  { key: 'quick-generate', label: 'Quick Generate', description: 'Fast tools: objectives, discussion prompts, job aids', icon: 'zap', phase: 'development' },
];
