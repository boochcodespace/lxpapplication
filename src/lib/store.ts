'use client';

import { create } from 'zustand';
import {
  Project,
  ChatMessage,
  Material,
  MaterialCollection,
  Tag,
  ADDIEPhase,
  CourseType,
  AnalysisArea,
  AnalysisResponse,
  AnalysisWizardState,
  AnalysisWizardStatus,
  NeedsAnalysisReport,
  AnalysisRedFlag,
  CourseOutline,
  CourseModule,
  LessonPlan,
  LearningObjective,
  BloomLevel,
  VARKModality,
  ZPDLevel,
  DesignDocument,
  DesignDocFormat,
  DesignDocSlide,
} from './types';
import { generateId } from './utils';

// ── Sample Data ──

const sampleProject: Project = {
  id: 'project-1',
  title: 'Cybersecurity Fundamentals for Healthcare',
  description: 'A blended learning program to train healthcare staff on cybersecurity best practices, HIPAA compliance, and incident response.',
  courseType: 'blended',
  targetAudience: 'Healthcare administrative staff and clinical personnel with limited IT background',
  industry: 'Healthcare',
  status: 'active',
  currentPhase: 'design',
  phaseProgress: {
    analysis: 100,
    design: 45,
    development: 0,
    implementation: 0,
    evaluation: 0,
  },
  tags: ['healthcare', 'cybersecurity', 'compliance', 'blended'],
  createdAt: '2026-02-01T10:00:00Z',
  updatedAt: '2026-02-15T14:30:00Z',
  materialIds: ['mat-1', 'mat-2'],
};

const sampleProject2: Project = {
  id: 'project-2',
  title: 'New Manager Leadership Bootcamp',
  description: 'An intensive 3-day bootcamp for newly promoted managers covering communication, delegation, conflict resolution, and team building.',
  courseType: 'bootcamp',
  targetAudience: 'Individual contributors recently promoted to management roles',
  industry: 'Corporate / General',
  status: 'active',
  currentPhase: 'analysis',
  phaseProgress: {
    analysis: 60,
    design: 0,
    development: 0,
    implementation: 0,
    evaluation: 0,
  },
  tags: ['leadership', 'management', 'soft-skills', 'bootcamp'],
  createdAt: '2026-02-10T09:00:00Z',
  updatedAt: '2026-02-14T11:00:00Z',
  materialIds: [],
};

const sampleMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    projectId: 'project-1',
    role: 'assistant',
    content: `Welcome to the **Cybersecurity Fundamentals for Healthcare** project! I'm your AI course development agent.

I've reviewed the analysis phase and you've made great progress. Here's where we are:

**Analysis Phase** - Complete ✓
- Target audience: Healthcare administrative and clinical staff
- Key need: HIPAA-compliant cybersecurity awareness
- Delivery: Blended (self-paced e-learning + instructor-led workshops)
- Duration: 4-week program

**Design Phase** - In Progress (45%)
- Course outline drafted
- Learning objectives for Module 1 complete
- Still needed: Objectives for Modules 2-4, assessment strategy

What would you like to work on next? I'd suggest we continue with the learning objectives for Module 2: **Recognizing Threats & Social Engineering**.`,
    timestamp: '2026-02-15T14:30:00Z',
  },
];

const sampleMaterial: Material = {
  id: 'mat-1',
  name: 'HIPAA Security Rule Overview',
  originalName: 'hipaa-security-rule-2025.pdf',
  type: 'pdf',
  category: 'reference',
  size: 2457600,
  mimeType: 'application/pdf',
  tags: ['hipaa', 'compliance', 'security'],
  notes: 'Official HHS guidance on HIPAA security requirements. Key sections: Technical Safeguards (pp. 12-28), Administrative Safeguards (pp. 29-45).',
  projectIds: ['project-1'],
  collectionIds: ['col-1'],
  analysis: {
    keyConcepts: ['access control', 'audit controls', 'integrity', 'transmission security', 'risk assessment'],
    suggestedObjectives: [
      'Identify the four categories of HIPAA security safeguards',
      'Explain the difference between required and addressable implementation specifications',
      'Apply risk assessment procedures to evaluate organizational vulnerabilities',
    ],
    bloomLevels: ['remember', 'understand', 'apply'],
    detectedStructure: ['Chapter 1: Introduction', 'Chapter 2: Administrative Safeguards', 'Chapter 3: Physical Safeguards', 'Chapter 4: Technical Safeguards'],
    readabilityLevel: 'College level (Flesch-Kincaid Grade 14)',
    contentGaps: ['No practical examples or scenarios', 'Missing visual aids', 'No self-assessment opportunities'],
    glossaryTerms: [
      { term: 'ePHI', definition: 'Electronic Protected Health Information' },
      { term: 'BAA', definition: 'Business Associate Agreement' },
      { term: 'Addressable', definition: 'Implementation specification that allows flexibility based on risk assessment' },
    ],
    accessibilityIssues: ['PDF not tagged for screen readers', 'Some tables lack header associations'],
    summary: 'Comprehensive regulatory document covering HIPAA security requirements. Strong on policy content but lacks instructional scaffolding. Recommend transforming into scenario-based learning with practical examples.',
  },
  snippets: [],
  version: 1,
  uploadedAt: '2026-02-05T10:00:00Z',
  updatedAt: '2026-02-05T10:00:00Z',
  filePath: '/uploads/hipaa-security-rule-2025.pdf',
};

const sampleMaterial2: Material = {
  id: 'mat-2',
  name: 'Phishing Examples Slide Deck',
  originalName: 'phishing-examples-2025.pptx',
  type: 'pptx',
  category: 'sme-content',
  size: 8912000,
  mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  tags: ['phishing', 'social-engineering', 'examples'],
  notes: 'SME-provided examples of real phishing attempts in healthcare settings. 24 slides with screenshots and analysis.',
  projectIds: ['project-1'],
  collectionIds: ['col-1'],
  snippets: [],
  version: 1,
  uploadedAt: '2026-02-06T14:00:00Z',
  updatedAt: '2026-02-06T14:00:00Z',
  filePath: '/uploads/phishing-examples-2025.pptx',
};

const sampleCollection: MaterialCollection = {
  id: 'col-1',
  name: 'Cybersecurity Course - Source Materials',
  description: 'All source materials for the Healthcare Cybersecurity Fundamentals course',
  materialIds: ['mat-1', 'mat-2'],
  createdAt: '2026-02-05T10:00:00Z',
};

// ── Store Types ──

interface AppState {
  // Navigation
  sidebarOpen: boolean;
  activeView: 'dashboard' | 'chat' | 'materials' | 'settings' | 'analysis' | 'outline' | 'design-doc';
  setSidebarOpen: (open: boolean) => void;
  setActiveView: (view: AppState['activeView']) => void;

  // Projects
  projects: Project[];
  activeProjectId: string | null;
  setActiveProject: (id: string | null) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'phaseProgress' | 'status' | 'materialIds'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Chat
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => ChatMessage;
  getProjectMessages: (projectId: string) => ChatMessage[];

  // Materials
  materials: Material[];
  collections: MaterialCollection[];
  selectedMaterialId: string | null;
  materialViewerOpen: boolean;
  setSelectedMaterial: (id: string | null) => void;
  setMaterialViewerOpen: (open: boolean) => void;
  addMaterial: (material: Omit<Material, 'id' | 'uploadedAt' | 'updatedAt' | 'snippets' | 'version'>) => Material;
  updateMaterial: (id: string, updates: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  addSnippet: (materialId: string, content: string, page?: number, note?: string) => void;
  addCollection: (name: string, description: string, materialIds: string[]) => MaterialCollection;

  // Tags
  tags: Tag[];
  addTag: (tag: Omit<Tag, 'id'>) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: {
    projects: Project[];
    materials: Material[];
  };
  performSearch: (query: string) => void;

  // ── Needs Analysis Wizard ──
  analysisWizards: Record<string, AnalysisWizardState>; // keyed by projectId
  getAnalysisWizard: (projectId: string) => AnalysisWizardState;
  startAnalysisWizard: (projectId: string) => void;
  setAnalysisArea: (projectId: string, area: AnalysisArea) => void;
  addAnalysisResponse: (projectId: string, response: Omit<AnalysisResponse, 'timestamp'>) => void;
  completeAnalysisArea: (projectId: string, area: AnalysisArea) => void;
  setAnalysisReport: (projectId: string, report: NeedsAnalysisReport) => void;
  completeAnalysisWizard: (projectId: string) => void;

  // ── Course Outline Builder ──
  courseOutlines: Record<string, CourseOutline>; // keyed by projectId
  getCourseOutline: (projectId: string) => CourseOutline | null;
  createCourseOutline: (projectId: string, courseGoal: string) => CourseOutline;
  updateCourseOutline: (projectId: string, updates: Partial<CourseOutline>) => void;
  addModule: (projectId: string, module: Omit<CourseModule, 'id' | 'order' | 'lessons'>) => CourseModule;
  updateModule: (projectId: string, moduleId: string, updates: Partial<CourseModule>) => void;
  removeModule: (projectId: string, moduleId: string) => void;
  reorderModules: (projectId: string, moduleIds: string[]) => void;
  addLesson: (projectId: string, moduleId: string, lesson: Omit<LessonPlan, 'id' | 'order'>) => LessonPlan;
  updateLesson: (projectId: string, moduleId: string, lessonId: string, updates: Partial<LessonPlan>) => void;
  removeLesson: (projectId: string, moduleId: string, lessonId: string) => void;
  toggleModuleCollapse: (projectId: string, moduleId: string) => void;

  // ── Design Document Generator ──
  designDocuments: DesignDocument[];
  activeDesignDocId: string | null;
  getDesignDocs: (projectId: string) => DesignDocument[];
  setActiveDesignDoc: (id: string | null) => void;
  createDesignDoc: (doc: Omit<DesignDocument, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => DesignDocument;
  updateDesignDoc: (id: string, updates: Partial<DesignDocument>) => void;
  addDesignDocSlide: (docId: string, slide: Omit<DesignDocSlide, 'id' | 'slideNumber'>) => DesignDocSlide;
  updateDesignDocSlide: (docId: string, slideId: string, updates: Partial<DesignDocSlide>) => void;
  removeDesignDocSlide: (docId: string, slideId: string) => void;
  deleteDesignDoc: (id: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // ── Navigation ──
  sidebarOpen: true,
  activeView: 'dashboard',
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveView: (view) => set({ activeView: view }),

  // ── Projects ──
  projects: [sampleProject, sampleProject2],
  activeProjectId: null,
  setActiveProject: (id) => set({ activeProjectId: id, activeView: id ? 'chat' : 'dashboard' }),
  addProject: (project) => {
    const newProject: Project = {
      ...project,
      id: generateId(),
      status: 'active',
      phaseProgress: { analysis: 0, design: 0, development: 0, implementation: 0, evaluation: 0 },
      materialIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ projects: [newProject, ...state.projects] }));

    // Add welcome message
    const welcomeMsg: ChatMessage = {
      id: generateId(),
      projectId: newProject.id,
      role: 'assistant',
      content: `Welcome to **${newProject.title}**! I'm your AI course development agent and I'll guide you through the entire instructional design lifecycle.\n\nLet's start with the **Analysis Phase**. I need to understand:\n\n1. **Who** are your learners? (roles, experience level, prior knowledge)\n2. **What** do they need to learn? (performance gaps, business goals)\n3. **Why** is this training needed now? (trigger event, compliance, growth)\n4. **Where/How** will they learn? (environment, technology, constraints)\n5. **When** does this need to be ready? (timeline, milestones)\n\nTell me more about your learners and I'll help build a comprehensive learner persona.`,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({ messages: [...state.messages, welcomeMsg] }));

    return newProject;
  },
  updateProject: (id, updates) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      ),
    }));
  },
  deleteProject: (id) => {
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      messages: state.messages.filter((m) => m.projectId !== id),
      activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
    }));
  },

  // ── Chat ──
  messages: sampleMessages,
  addMessage: (message) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateId(),
      timestamp: new Date().toISOString(),
    };
    set((state) => ({ messages: [...state.messages, newMessage] }));
    return newMessage;
  },
  getProjectMessages: (projectId) => {
    return get().messages.filter((m) => m.projectId === projectId);
  },

  // ── Materials ──
  materials: [sampleMaterial, sampleMaterial2],
  collections: [sampleCollection],
  selectedMaterialId: null,
  materialViewerOpen: false,
  setSelectedMaterial: (id) => set({ selectedMaterialId: id }),
  setMaterialViewerOpen: (open) => set({ materialViewerOpen: open }),
  addMaterial: (material) => {
    const newMaterial: Material = {
      ...material,
      id: generateId(),
      snippets: [],
      version: 1,
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ materials: [newMaterial, ...state.materials] }));
    return newMaterial;
  },
  updateMaterial: (id, updates) => {
    set((state) => ({
      materials: state.materials.map((m) =>
        m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
      ),
    }));
  },
  deleteMaterial: (id) => {
    set((state) => ({
      materials: state.materials.filter((m) => m.id !== id),
    }));
  },
  addSnippet: (materialId, content, page, note) => {
    const snippet = {
      id: generateId(),
      materialId,
      content,
      page,
      note,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      materials: state.materials.map((m) =>
        m.id === materialId
          ? { ...m, snippets: [...m.snippets, snippet], updatedAt: new Date().toISOString() }
          : m
      ),
    }));
  },
  addCollection: (name, description, materialIds) => {
    const collection: MaterialCollection = {
      id: generateId(),
      name,
      description,
      materialIds,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ collections: [...state.collections, collection] }));
    return collection;
  },

  // ── Tags ──
  tags: [
    { id: '1', name: 'healthcare', color: '#4c6ef5', category: 'topic' },
    { id: '2', name: 'cybersecurity', color: '#f03e3e', category: 'topic' },
    { id: '3', name: 'compliance', color: '#fab005', category: 'topic' },
    { id: '4', name: 'leadership', color: '#40c057', category: 'topic' },
    { id: '5', name: 'blended', color: '#7950f2', category: 'format' },
    { id: '6', name: 'bootcamp', color: '#fd7e14', category: 'format' },
  ],
  addTag: (tag) => {
    set((state) => ({ tags: [...state.tags, { ...tag, id: generateId() }] }));
  },

  // ── Search ──
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  searchResults: { projects: [], materials: [] },
  performSearch: (query) => {
    const state = get();
    const q = query.toLowerCase();
    if (!q) {
      set({ searchResults: { projects: [], materials: [] }, searchQuery: '' });
      return;
    }
    const projects = state.projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.industry.toLowerCase().includes(q)
    );
    const materials = state.materials.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.originalName.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q)) ||
        m.notes.toLowerCase().includes(q) ||
        (m.extractedText && m.extractedText.toLowerCase().includes(q))
    );
    set({ searchResults: { projects, materials }, searchQuery: query });
  },

  // ══════════════════════════════════════════════
  // NEEDS ANALYSIS WIZARD
  // ══════════════════════════════════════════════
  analysisWizards: {},

  getAnalysisWizard: (projectId) => {
    const wizard = get().analysisWizards[projectId];
    if (wizard) return wizard;
    return {
      status: 'not-started' as AnalysisWizardStatus,
      currentArea: 'performance-gap' as AnalysisArea,
      completedAreas: [],
      responses: [],
    };
  },

  startAnalysisWizard: (projectId) => {
    set((state) => ({
      analysisWizards: {
        ...state.analysisWizards,
        [projectId]: {
          status: 'in-progress',
          currentArea: 'performance-gap' as AnalysisArea,
          completedAreas: [],
          responses: [],
        },
      },
    }));
  },

  setAnalysisArea: (projectId, area) => {
    set((state) => ({
      analysisWizards: {
        ...state.analysisWizards,
        [projectId]: {
          ...state.analysisWizards[projectId],
          currentArea: area,
        },
      },
    }));
  },

  addAnalysisResponse: (projectId, response) => {
    const newResponse: AnalysisResponse = {
      ...response,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({
      analysisWizards: {
        ...state.analysisWizards,
        [projectId]: {
          ...state.analysisWizards[projectId],
          responses: [...(state.analysisWizards[projectId]?.responses || []), newResponse],
        },
      },
    }));
  },

  completeAnalysisArea: (projectId, area) => {
    set((state) => {
      const wizard = state.analysisWizards[projectId];
      if (!wizard) return state;
      return {
        analysisWizards: {
          ...state.analysisWizards,
          [projectId]: {
            ...wizard,
            completedAreas: [...wizard.completedAreas, area],
          },
        },
      };
    });
  },

  setAnalysisReport: (projectId, report) => {
    set((state) => ({
      analysisWizards: {
        ...state.analysisWizards,
        [projectId]: {
          ...state.analysisWizards[projectId],
          report,
        },
      },
    }));
  },

  completeAnalysisWizard: (projectId) => {
    set((state) => ({
      analysisWizards: {
        ...state.analysisWizards,
        [projectId]: {
          ...state.analysisWizards[projectId],
          status: 'completed',
        },
      },
    }));
    // Update project phase progress
    get().updateProject(projectId, {
      phaseProgress: {
        ...get().projects.find((p) => p.id === projectId)!.phaseProgress,
        analysis: 100,
      },
    });
  },

  // ══════════════════════════════════════════════
  // COURSE OUTLINE BUILDER
  // ══════════════════════════════════════════════
  courseOutlines: {},

  getCourseOutline: (projectId) => {
    return get().courseOutlines[projectId] || null;
  },

  createCourseOutline: (projectId, courseGoal) => {
    const outline: CourseOutline = {
      id: generateId(),
      projectId,
      courseGoal,
      totalDuration: 0,
      modules: [],
      bloomDistribution: { remember: 0, understand: 0, apply: 0, analyze: 0, evaluate: 0, create: 0 },
      varkCoverage: { visual: 0, auditory: 0, readWrite: 0, kinesthetic: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };
    set((state) => ({
      courseOutlines: { ...state.courseOutlines, [projectId]: outline },
    }));
    return outline;
  },

  updateCourseOutline: (projectId, updates) => {
    set((state) => {
      const outline = state.courseOutlines[projectId];
      if (!outline) return state;
      return {
        courseOutlines: {
          ...state.courseOutlines,
          [projectId]: { ...outline, ...updates, updatedAt: new Date().toISOString() },
        },
      };
    });
  },

  addModule: (projectId, moduleData) => {
    const newModule: CourseModule = {
      ...moduleData,
      id: generateId(),
      lessons: [],
      order: (get().courseOutlines[projectId]?.modules.length || 0) + 1,
    };
    set((state) => {
      const outline = state.courseOutlines[projectId];
      if (!outline) return state;
      const updated = {
        ...outline,
        modules: [...outline.modules, newModule],
        totalDuration: outline.totalDuration + newModule.duration,
        updatedAt: new Date().toISOString(),
      };
      return { courseOutlines: { ...state.courseOutlines, [projectId]: updated } };
    });
    return newModule;
  },

  updateModule: (projectId, moduleId, updates) => {
    set((state) => {
      const outline = state.courseOutlines[projectId];
      if (!outline) return state;
      const modules = outline.modules.map((m) => (m.id === moduleId ? { ...m, ...updates } : m));
      const totalDuration = modules.reduce((sum, m) => sum + m.duration, 0);
      return {
        courseOutlines: {
          ...state.courseOutlines,
          [projectId]: { ...outline, modules, totalDuration, updatedAt: new Date().toISOString() },
        },
      };
    });
  },

  removeModule: (projectId, moduleId) => {
    set((state) => {
      const outline = state.courseOutlines[projectId];
      if (!outline) return state;
      const modules = outline.modules
        .filter((m) => m.id !== moduleId)
        .map((m, i) => ({ ...m, order: i + 1 }));
      const totalDuration = modules.reduce((sum, m) => sum + m.duration, 0);
      return {
        courseOutlines: {
          ...state.courseOutlines,
          [projectId]: { ...outline, modules, totalDuration, updatedAt: new Date().toISOString() },
        },
      };
    });
  },

  reorderModules: (projectId, moduleIds) => {
    set((state) => {
      const outline = state.courseOutlines[projectId];
      if (!outline) return state;
      const reordered = moduleIds
        .map((id, i) => {
          const mod = outline.modules.find((m) => m.id === id);
          return mod ? { ...mod, order: i + 1 } : null;
        })
        .filter(Boolean) as CourseModule[];
      return {
        courseOutlines: {
          ...state.courseOutlines,
          [projectId]: { ...outline, modules: reordered, updatedAt: new Date().toISOString() },
        },
      };
    });
  },

  addLesson: (projectId, moduleId, lessonData) => {
    const outline = get().courseOutlines[projectId];
    const mod = outline?.modules.find((m) => m.id === moduleId);
    const newLesson: LessonPlan = {
      ...lessonData,
      id: generateId(),
      order: (mod?.lessons.length || 0) + 1,
    };
    set((state) => {
      const outline = state.courseOutlines[projectId];
      if (!outline) return state;
      const modules = outline.modules.map((m) =>
        m.id === moduleId
          ? { ...m, lessons: [...m.lessons, newLesson], duration: m.duration + newLesson.duration }
          : m
      );
      const totalDuration = modules.reduce((sum, m) => sum + m.duration, 0);
      return {
        courseOutlines: {
          ...state.courseOutlines,
          [projectId]: { ...outline, modules, totalDuration, updatedAt: new Date().toISOString() },
        },
      };
    });
    return newLesson;
  },

  updateLesson: (projectId, moduleId, lessonId, updates) => {
    set((state) => {
      const outline = state.courseOutlines[projectId];
      if (!outline) return state;
      const modules = outline.modules.map((m) => {
        if (m.id !== moduleId) return m;
        const lessons = m.lessons.map((l) => (l.id === lessonId ? { ...l, ...updates } : l));
        const duration = lessons.reduce((sum, l) => sum + l.duration, 0);
        return { ...m, lessons, duration };
      });
      const totalDuration = modules.reduce((sum, m) => sum + m.duration, 0);
      return {
        courseOutlines: {
          ...state.courseOutlines,
          [projectId]: { ...outline, modules, totalDuration, updatedAt: new Date().toISOString() },
        },
      };
    });
  },

  removeLesson: (projectId, moduleId, lessonId) => {
    set((state) => {
      const outline = state.courseOutlines[projectId];
      if (!outline) return state;
      const modules = outline.modules.map((m) => {
        if (m.id !== moduleId) return m;
        const lessons = m.lessons.filter((l) => l.id !== lessonId).map((l, i) => ({ ...l, order: i + 1 }));
        const duration = lessons.reduce((sum, l) => sum + l.duration, 0);
        return { ...m, lessons, duration };
      });
      const totalDuration = modules.reduce((sum, m) => sum + m.duration, 0);
      return {
        courseOutlines: {
          ...state.courseOutlines,
          [projectId]: { ...outline, modules, totalDuration, updatedAt: new Date().toISOString() },
        },
      };
    });
  },

  toggleModuleCollapse: (projectId, moduleId) => {
    set((state) => {
      const outline = state.courseOutlines[projectId];
      if (!outline) return state;
      const modules = outline.modules.map((m) =>
        m.id === moduleId ? { ...m, collapsed: !m.collapsed } : m
      );
      return { courseOutlines: { ...state.courseOutlines, [projectId]: { ...outline, modules } } };
    });
  },

  // ══════════════════════════════════════════════
  // DESIGN DOCUMENT GENERATOR
  // ══════════════════════════════════════════════
  designDocuments: [],
  activeDesignDocId: null,

  getDesignDocs: (projectId) => {
    return get().designDocuments.filter((d) => d.projectId === projectId);
  },

  setActiveDesignDoc: (id) => set({ activeDesignDocId: id }),

  createDesignDoc: (doc) => {
    const newDoc: DesignDocument = {
      ...doc,
      id: generateId(),
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ designDocuments: [...state.designDocuments, newDoc] }));
    return newDoc;
  },

  updateDesignDoc: (id, updates) => {
    set((state) => ({
      designDocuments: state.designDocuments.map((d) =>
        d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
      ),
    }));
  },

  addDesignDocSlide: (docId, slideData) => {
    const doc = get().designDocuments.find((d) => d.id === docId);
    const newSlide: DesignDocSlide = {
      ...slideData,
      id: generateId(),
      slideNumber: (doc?.slides.length || 0) + 1,
    };
    set((state) => ({
      designDocuments: state.designDocuments.map((d) =>
        d.id === docId
          ? { ...d, slides: [...d.slides, newSlide], updatedAt: new Date().toISOString() }
          : d
      ),
    }));
    return newSlide;
  },

  updateDesignDocSlide: (docId, slideId, updates) => {
    set((state) => ({
      designDocuments: state.designDocuments.map((d) =>
        d.id === docId
          ? {
              ...d,
              slides: d.slides.map((s) => (s.id === slideId ? { ...s, ...updates } : s)),
              updatedAt: new Date().toISOString(),
            }
          : d
      ),
    }));
  },

  removeDesignDocSlide: (docId, slideId) => {
    set((state) => ({
      designDocuments: state.designDocuments.map((d) =>
        d.id === docId
          ? {
              ...d,
              slides: d.slides
                .filter((s) => s.id !== slideId)
                .map((s, i) => ({ ...s, slideNumber: i + 1 })),
              updatedAt: new Date().toISOString(),
            }
          : d
      ),
    }));
  },

  deleteDesignDoc: (id) => {
    set((state) => ({
      designDocuments: state.designDocuments.filter((d) => d.id !== id),
      activeDesignDocId: state.activeDesignDocId === id ? null : state.activeDesignDocId,
    }));
  },
}));
