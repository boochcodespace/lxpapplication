'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { COURSE_TYPES, BLOOM_LEVELS } from '@/lib/types';

type SettingsTab = 'preferences' | 'knowledge-base' | 'templates' | 'shortcuts';

const CATEGORY_COLORS: Record<string, string> = {
  analysis: 'bg-blue-100 text-blue-700',
  outline: 'bg-green-100 text-green-700',
  design: 'bg-purple-100 text-purple-700',
  assessment: 'bg-orange-100 text-orange-700',
  general: 'bg-surface-100 text-surface-700',
};

const DEFAULT_CLAUDE_MD_RESET = `# AI Course Development Agent — Knowledge Base

This file is the persistent knowledge base for the AI-powered course development agent.

## ADDIE Methodology
Every course follows Analysis → Design → Development → Implementation → Evaluation.
Never skip Analysis. Designing without understanding the audience produces ineffective content.

## Bloom's Taxonomy (Revised)
Remember → Understand → Apply → Analyze → Evaluate → Create
Target Apply or above for professional training.

## Adult Learning Principles (Andragogy)
1. Self-directed — Adults want control over their learning path
2. Experience-based — Build on prior knowledge
3. Relevance-oriented — Connect every concept to real-world application
4. Problem-centered — Use case studies and scenarios
5. Internally motivated — Mastery, autonomy, purpose
6. Respectful — Honor the learner's time and intelligence

## Multimodal Learning (VARK)
Visual, Auditory, Read/Write, Kinesthetic.
Include 2-3 modalities per module. Lead with the modality that best fits the content type.

## Zone of Proximal Development (ZPD)
Target the Learning Zone — achievable with scaffolding.
Use: worked examples, partial completion, hints, checklists, chunking.
Follow "I do → We do → You do" (Gradual Release of Responsibility).

## Meaningful Interactivity
Every interaction must: have decisions with real consequences, provide explanatory feedback,
include scenario branching, and reflect real-world ambiguity.
Avoid fake interactivity: clicking Next, cosmetic drag-and-drop, hidden accordions.

## Accessibility (WCAG 2.0 AA)
POUR: Perceivable, Operable, Understandable, Robust.
Alt text, captions, 4.5:1 contrast, keyboard accessible, semantic HTML.

## Assessment Principles
Formative throughout. Summative at milestones.
MC best practices: clear stem, plausible distractors, 4 options.
Answer keys must explain why each answer is correct or incorrect.
`;

export default function SettingsPanel() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('preferences');
  const userSettings = useAppStore((s) => s.userSettings);
  const updateUserSettings = useAppStore((s) => s.updateUserSettings);
  const promptShortcuts = useAppStore((s) => s.promptShortcuts);
  const addPromptShortcut = useAppStore((s) => s.addPromptShortcut);
  const deletePromptShortcut = useAppStore((s) => s.deletePromptShortcut);
  const contentTemplates = useAppStore((s) => s.contentTemplates);
  const addContentTemplate = useAppStore((s) => s.addContentTemplate);
  const deleteContentTemplate = useAppStore((s) => s.deleteContentTemplate);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);

  const [claudeMdDraft, setClaudeMdDraft] = useState(userSettings.claudeMdContent);
  const [claudeMdSaved, setClaudeMdSaved] = useState(false);
  const [newShortcut, setNewShortcut] = useState({ label: '', prompt: '', category: 'general' as const, icon: '⚡' });
  const [showNewShortcut, setShowNewShortcut] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', description: '', category: 'module' as const, courseType: 'self-paced' as const, template: '', variables: '' });
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const tabs: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
    {
      key: 'preferences',
      label: 'Preferences',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.39.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      key: 'knowledge-base',
      label: 'Knowledge Base',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      ),
    },
    {
      key: 'templates',
      label: 'Templates',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c0 .621.504 1.125 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5" />
        </svg>
      ),
    },
    {
      key: 'shortcuts',
      label: 'Prompt Shortcuts',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
    },
  ];

  const handleSaveClaudeMd = () => {
    updateUserSettings({ claudeMdContent: claudeMdDraft });
    setClaudeMdSaved(true);
    setTimeout(() => setClaudeMdSaved(false), 2000);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Settings</h1>
        <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">
          Customize your course development workspace
        </p>
      </div>

      <div className="flex gap-6">
        {/* Tab sidebar */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                  activeTab === tab.key
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                    : 'text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="flex-1 min-w-0">
          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
                <h2 className="text-base font-semibold text-surface-900 dark:text-surface-50 mb-4">Appearance</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-surface-900 dark:text-surface-100">Dark Mode</p>
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                      Switch between light and dark interface
                    </p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      theme === 'dark' ? 'bg-brand-600' : 'bg-surface-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
                <h2 className="text-base font-semibold text-surface-900 dark:text-surface-50 mb-4">Profile</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={userSettings.displayName}
                      onChange={(e) => updateUserSettings({ displayName: e.target.value })}
                      placeholder="Your name"
                      className="w-full px-3 py-2 text-sm border border-surface-200 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
                <h2 className="text-base font-semibold text-surface-900 dark:text-surface-50 mb-4">Defaults</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                      Default Course Type
                    </label>
                    <select
                      value={userSettings.defaultCourseType}
                      onChange={(e) => updateUserSettings({ defaultCourseType: e.target.value as any })}
                      className="w-full px-3 py-2 text-sm border border-surface-200 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {COURSE_TYPES.map((ct) => (
                        <option key={ct.key} value={ct.key}>{ct.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                      Default Bloom&apos;s Target Level
                    </label>
                    <select
                      value={userSettings.defaultBloomTarget}
                      onChange={(e) => updateUserSettings({ defaultBloomTarget: e.target.value as any })}
                      className="w-full px-3 py-2 text-sm border border-surface-200 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {BLOOM_LEVELS.map((bl) => (
                        <option key={bl.key} value={bl.key}>{bl.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
                <h2 className="text-base font-semibold text-surface-900 dark:text-surface-50 mb-4">Display Options</h2>
                <div className="space-y-3">
                  {[
                    { key: 'autoSave', label: 'Auto-save changes', description: 'Automatically save your work as you type' },
                    { key: 'showWordCount', label: 'Show word count', description: 'Display word count in content editors' },
                    { key: 'showBloomsDistribution', label: "Show Bloom's distribution", description: "Display Bloom's level chart in outline and design doc views" },
                  ].map(({ key, label, description }) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-surface-900 dark:text-surface-100">{label}</p>
                        <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{description}</p>
                      </div>
                      <button
                        onClick={() => updateUserSettings({ [key]: !userSettings[key as keyof typeof userSettings] } as any)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          userSettings[key as keyof typeof userSettings] ? 'bg-brand-600' : 'bg-surface-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            userSettings[key as keyof typeof userSettings] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Knowledge Base Tab */}
          {activeTab === 'knowledge-base' && (
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Knowledge Base Editor</p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                      Changes to the Knowledge Base affect how the AI agent generates content and provides guidance. Edit carefully.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-base font-semibold text-surface-900 dark:text-surface-50">CLAUDE.md Content</h2>
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                      {claudeMdDraft.length.toLocaleString()} characters
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (confirm('Reset to default Knowledge Base content? Your changes will be lost.')) {
                          setClaudeMdDraft(DEFAULT_CLAUDE_MD_RESET);
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-surface-600 dark:text-surface-400 bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 rounded-lg transition-colors"
                    >
                      Reset to Default
                    </button>
                    <button
                      onClick={handleSaveClaudeMd}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
                    >
                      {claudeMdSaved ? '✓ Saved' : 'Save Changes'}
                    </button>
                  </div>
                </div>
                <textarea
                  value={claudeMdDraft}
                  onChange={(e) => setClaudeMdDraft(e.target.value)}
                  className="w-full h-96 px-3 py-2.5 text-sm font-mono border border-surface-200 dark:border-surface-600 rounded-lg bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  spellCheck={false}
                />
              </div>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-surface-600 dark:text-surface-400">
                  {contentTemplates.length} templates ({contentTemplates.filter((t) => t.isBuiltIn).length} built-in)
                </p>
                <button
                  onClick={() => setShowNewTemplate(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  New Template
                </button>
              </div>

              {showNewTemplate && (
                <div className="bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-200 dark:border-brand-800 p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-50">Create Template</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-surface-600 dark:text-surface-400 mb-1">Name</label>
                      <input
                        type="text"
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-sm border border-surface-200 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="Template name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-surface-600 dark:text-surface-400 mb-1">Category</label>
                      <select
                        value={newTemplate.category}
                        onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value as any })}
                        className="w-full px-2.5 py-1.5 text-sm border border-surface-200 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="module">Module</option>
                        <option value="lesson">Lesson</option>
                        <option value="assessment">Assessment</option>
                        <option value="activity">Activity</option>
                        <option value="objective">Objective</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-surface-600 dark:text-surface-400 mb-1">Description</label>
                    <input
                      type="text"
                      value={newTemplate.description}
                      onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-sm border border-surface-200 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="Brief description"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-surface-600 dark:text-surface-400 mb-1">
                      Template Content (use {'{{VARIABLE}}'} for placeholders)
                    </label>
                    <textarea
                      value={newTemplate.template}
                      onChange={(e) => setNewTemplate({ ...newTemplate, template: e.target.value })}
                      className="w-full h-32 px-2.5 py-1.5 text-sm font-mono border border-surface-200 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                      placeholder="# {{TITLE}}&#10;&#10;Content here..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (newTemplate.name && newTemplate.template) {
                          const vars = Array.from(newTemplate.template.matchAll(/\{\{(\w+)\}\}/g)).map((m) => m[1]);
                          addContentTemplate({ ...newTemplate, variables: [...new Set(vars)], tags: [], courseType: newTemplate.courseType });
                          setNewTemplate({ name: '', description: '', category: 'module', courseType: 'self-paced', template: '', variables: '' });
                          setShowNewTemplate(false);
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
                    >
                      Create Template
                    </button>
                    <button
                      onClick={() => setShowNewTemplate(false)}
                      className="px-3 py-1.5 text-xs font-medium text-surface-600 dark:text-surface-400 bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {contentTemplates.map((template) => (
                  <div key={template.id} className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-50">{template.name}</h3>
                          {template.isBuiltIn && (
                            <span className="px-1.5 py-0.5 text-xs bg-surface-100 dark:bg-surface-700 text-surface-500 dark:text-surface-400 rounded">Built-in</span>
                          )}
                          <span className="px-1.5 py-0.5 text-xs bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded capitalize">{template.category}</span>
                        </div>
                        <p className="text-xs text-surface-500 dark:text-surface-400">{template.description}</p>
                        {template.variables.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {template.variables.map((v) => (
                              <span key={v} className="px-1.5 py-0.5 text-xs font-mono bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 rounded">
                                {`{{${v}}}`}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleCopy(template.template, template.id)}
                          className="p-1.5 text-surface-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30 rounded transition-colors"
                          title="Copy template"
                        >
                          {copiedId === template.id ? (
                            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                        {!template.isBuiltIn && (
                          <button
                            onClick={() => deleteContentTemplate(template.id)}
                            className="p-1.5 text-surface-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                            title="Delete template"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prompt Shortcuts Tab */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-surface-600 dark:text-surface-400">
                  {promptShortcuts.length} shortcuts ({promptShortcuts.filter((s) => s.isBuiltIn).length} built-in)
                </p>
                <button
                  onClick={() => setShowNewShortcut(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  New Shortcut
                </button>
              </div>

              {showNewShortcut && (
                <div className="bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-200 dark:border-brand-800 p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-50">Create Shortcut</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-surface-600 dark:text-surface-400 mb-1">Label</label>
                      <input
                        type="text"
                        value={newShortcut.label}
                        onChange={(e) => setNewShortcut({ ...newShortcut, label: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-sm border border-surface-200 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="Shortcut name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-surface-600 dark:text-surface-400 mb-1">Category</label>
                      <select
                        value={newShortcut.category}
                        onChange={(e) => setNewShortcut({ ...newShortcut, category: e.target.value as any })}
                        className="w-full px-2.5 py-1.5 text-sm border border-surface-200 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="general">General</option>
                        <option value="analysis">Analysis</option>
                        <option value="outline">Outline</option>
                        <option value="design">Design</option>
                        <option value="assessment">Assessment</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-surface-600 dark:text-surface-400 mb-1">Icon (emoji)</label>
                    <div className="flex gap-1.5 flex-wrap mb-1.5">
                      {['⚡', '🎯', '📝', '🔍', '💡', '🎨', '📋', '🔗', '✅', '⭐'].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => setNewShortcut({ ...newShortcut, icon: emoji })}
                          className={`w-8 h-8 text-base rounded-lg border transition-colors ${
                            newShortcut.icon === emoji
                              ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/30'
                              : 'border-surface-200 dark:border-surface-600 hover:bg-surface-100 dark:hover:bg-surface-700'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-surface-600 dark:text-surface-400 mb-1">Prompt</label>
                    <textarea
                      value={newShortcut.prompt}
                      onChange={(e) => setNewShortcut({ ...newShortcut, prompt: e.target.value })}
                      className="w-full h-24 px-2.5 py-1.5 text-sm border border-surface-200 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                      placeholder="Enter the prompt text..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (newShortcut.label && newShortcut.prompt) {
                          addPromptShortcut(newShortcut);
                          setNewShortcut({ label: '', prompt: '', category: 'general', icon: '⚡' });
                          setShowNewShortcut(false);
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
                    >
                      Create Shortcut
                    </button>
                    <button
                      onClick={() => setShowNewShortcut(false)}
                      className="px-3 py-1.5 text-xs font-medium text-surface-600 dark:text-surface-400 bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {promptShortcuts.map((shortcut) => (
                  <div key={shortcut.id} className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-700 flex items-center justify-center text-base flex-shrink-0">
                        {shortcut.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-50">{shortcut.label}</h3>
                          {shortcut.isBuiltIn && (
                            <span className="px-1.5 py-0.5 text-xs bg-surface-100 dark:bg-surface-700 text-surface-500 dark:text-surface-400 rounded">Built-in</span>
                          )}
                          <span className={`px-1.5 py-0.5 text-xs rounded capitalize ${CATEGORY_COLORS[shortcut.category] || CATEGORY_COLORS.general}`}>
                            {shortcut.category}
                          </span>
                        </div>
                        <p className="text-xs text-surface-500 dark:text-surface-400 line-clamp-2">{shortcut.prompt}</p>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleCopy(shortcut.prompt, shortcut.id)}
                          className="p-1.5 text-surface-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30 rounded transition-colors"
                          title="Copy prompt"
                        >
                          {copiedId === shortcut.id ? (
                            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                        {!shortcut.isBuiltIn && (
                          <button
                            onClick={() => deletePromptShortcut(shortcut.id)}
                            className="p-1.5 text-surface-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                            title="Delete shortcut"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
