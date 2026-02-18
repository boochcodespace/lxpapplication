'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { DEV_TOOLS, DevToolType, ADDIEPhase } from '@/lib/types';
import { cn, getPhaseColor, formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import AssessmentGenerator from './AssessmentGenerator';
import PersonaGenerator from './PersonaGenerator';
import RubricBuilder from './RubricBuilder';
import QuickGenerate from './QuickGenerate';

interface DevelopmentHubProps {
  projectId: string;
}

// ── Inline SVG icons ──

function ToolIcon({ icon, className }: { icon: string; className?: string }) {
  const cls = cn('w-6 h-6', className);
  switch (icon) {
    case 'clipboard':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      );
    case 'map':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
        </svg>
      );
    case 'users':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      );
    case 'grid':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      );
    case 'book':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      );
    case 'zap':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      );
    default:
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      );
  }
}

// Color map for tool icons
const toolIconBg: Record<string, string> = {
  'assessment-gen': 'bg-amber-100 text-amber-700',
  'blueprint':      'bg-purple-100 text-purple-700',
  'persona-gen':    'bg-blue-100 text-blue-700',
  'rubric-builder': 'bg-emerald-100 text-emerald-700',
  'facilitator-guide': 'bg-rose-100 text-rose-700',
  'quick-generate': 'bg-yellow-100 text-yellow-700',
};

// Phase badge colors
const phaseBadgeColor: Record<string, string> = {
  analysis:       'bg-blue-100 text-blue-700',
  design:         'bg-purple-100 text-purple-700',
  development:    'bg-amber-100 text-amber-700',
  implementation: 'bg-green-100 text-green-700',
  evaluation:     'bg-rose-100 text-rose-700',
};

// ── Placeholder for Assessment Blueprint ──
function AssessmentBlueprintPlaceholder({ projectId }: { projectId: string }) {
  const setActiveDevTool = useAppStore((s) => s.setActiveDevTool);
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-surface-900 mb-2">Assessment Blueprint</h2>
      <p className="text-surface-500 mb-6 max-w-sm">Full implementation coming in next update.</p>
      <Button variant="secondary" onClick={() => setActiveDevTool(null)}>Back</Button>
    </div>
  );
}

// ── Placeholder for Facilitator Guide ──
function FacilitatorGuideGenPlaceholder({ projectId }: { projectId: string }) {
  const setActiveDevTool = useAppStore((s) => s.setActiveDevTool);
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-surface-900 mb-2">Facilitator Guide</h2>
      <p className="text-surface-500 mb-6 max-w-sm">Full implementation coming in next update.</p>
      <Button variant="secondary" onClick={() => setActiveDevTool(null)}>Back</Button>
    </div>
  );
}

// ── Stat Card ──
function StatCard({ label, count, icon }: { label: string; count: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-surface-200 p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-surface-900">{count}</p>
        <p className="text-xs text-surface-500">{label}</p>
      </div>
    </div>
  );
}

// ── Main Component ──
export default function DevelopmentHub({ projectId }: DevelopmentHubProps) {
  const activeDevTool = useAppStore((s) => s.activeDevTool);
  const setActiveDevTool = useAppStore((s) => s.setActiveDevTool);
  const getDevToolData = useAppStore((s) => s.getDevToolData);
  const projects = useAppStore((s) => s.projects);

  const project = projects.find((p) => p.id === projectId);
  const devData = getDevToolData(projectId);

  const activeTool = DEV_TOOLS.find((t) => t.key === activeDevTool);

  // ── Tool item counts ──
  const toolCounts: Record<DevToolType, number> = {
    'assessment-gen':    devData.questions.length,
    'blueprint':         devData.blueprints.length,
    'persona-gen':       devData.personas.length,
    'rubric-builder':    devData.rubrics.length,
    'facilitator-guide': devData.guides.length,
    'quick-generate':    devData.quickResults.length,
  };

  // ── Render active tool ──
  if (activeDevTool) {
    return (
      <div className="h-full flex flex-col">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 px-6 py-4 border-b border-surface-200 bg-white shrink-0">
          <button
            onClick={() => setActiveDevTool(null)}
            className="flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Development Support
          </button>
          <svg className="w-4 h-4 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-sm font-medium text-surface-800">{activeTool?.label ?? activeDevTool}</span>
        </div>

        {/* Active tool content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeDevTool === 'assessment-gen' && <AssessmentGenerator projectId={projectId} />}
          {activeDevTool === 'persona-gen' && <PersonaGenerator projectId={projectId} />}
          {activeDevTool === 'rubric-builder' && <RubricBuilder projectId={projectId} />}
          {activeDevTool === 'quick-generate' && <QuickGenerate projectId={projectId} />}
          {activeDevTool === 'blueprint' && <AssessmentBlueprintPlaceholder projectId={projectId} />}
          {activeDevTool === 'facilitator-guide' && <FacilitatorGuideGenPlaceholder projectId={projectId} />}
        </div>
      </div>
    );
  }

  // ── Hub view ──
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Development Support</h1>
            <p className="text-surface-500 mt-1">Create learning materials, assessments, and resources for your course</p>
          </div>
          {project && (
            <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize', phaseBadgeColor[project.currentPhase] ?? 'bg-surface-100 text-surface-700')}>
              {project.currentPhase} phase
            </span>
          )}
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            label="Questions Generated"
            count={devData.questions.length}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            }
          />
          <StatCard
            label="Personas Created"
            count={devData.personas.length}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            }
          />
          <StatCard
            label="Rubrics Built"
            count={devData.rubrics.length}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            }
          />
          <StatCard
            label="Quick Generates"
            count={devData.quickResults.length}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            }
          />
        </div>

        {/* Tools grid */}
        <div>
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Development Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEV_TOOLS.map((tool) => {
              const count = toolCounts[tool.key];
              return (
                <div
                  key={tool.key}
                  onClick={() => setActiveDevTool(tool.key)}
                  className="bg-white rounded-xl border border-surface-200 hover:shadow-md hover:border-surface-300 transition-all duration-150 p-5 cursor-pointer group flex flex-col gap-3"
                >
                  {/* Phase badge */}
                  <div className="flex items-center justify-between">
                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize', phaseBadgeColor[tool.phase] ?? 'bg-surface-100 text-surface-700')}>
                      {tool.phase}
                    </span>
                    {count > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700">
                        {count} item{count !== 1 ? 's' : ''} created
                      </span>
                    )}
                  </div>

                  {/* Icon */}
                  <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', toolIconBg[tool.key] ?? 'bg-surface-100 text-surface-600')}>
                    <ToolIcon icon={tool.icon} className="w-6 h-6" />
                  </div>

                  {/* Name + description */}
                  <div>
                    <p className="font-semibold text-surface-900 text-base">{tool.label}</p>
                    <p className="text-sm text-surface-500 mt-0.5">{tool.description}</p>
                  </div>

                  {/* Open tool link */}
                  <p className="text-sm font-medium text-brand-600 group-hover:text-brand-700 mt-auto">
                    Open Tool &rarr;
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Integration callout */}
        <div className="rounded-xl bg-brand-50 border border-brand-200 p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600 shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.018a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.25 8.81" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-brand-900 text-sm">Workflow Integration</p>
            <p className="text-sm text-brand-700 mt-1">
              Your generated content integrates automatically. Personas feed into Needs Analysis. Assessment questions align to your course objectives. Rubrics attach to assessments in Design Docs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
