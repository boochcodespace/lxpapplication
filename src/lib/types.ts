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
