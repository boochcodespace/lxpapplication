'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface WorkflowStep {
  key: string;
  label: string;
  view: 'analysis' | 'outline' | 'design-doc' | 'development' | 'quality-assurance';
  shortLabel: string;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  { key: 'needs-analysis', label: 'Needs Analysis', shortLabel: 'Analysis', view: 'analysis' },
  { key: 'course-outline', label: 'Course Outline', shortLabel: 'Outline', view: 'outline' },
  { key: 'design-doc', label: 'Design Document', shortLabel: 'Design', view: 'design-doc' },
  { key: 'assessment', label: 'Assessment Dev', shortLabel: 'Assessment', view: 'development' },
  { key: 'review', label: 'Review & Refine', shortLabel: 'Review', view: 'quality-assurance' },
];

interface WorkflowProgressProps {
  projectId: string;
  variant?: 'horizontal' | 'compact';
}

export default function WorkflowProgress({ projectId, variant = 'horizontal' }: WorkflowProgressProps) {
  const setActiveView = useAppStore((s) => s.setActiveView);
  const activeView = useAppStore((s) => s.activeView);
  const analysisWizards = useAppStore((s) => s.analysisWizards);
  const courseOutlines = useAppStore((s) => s.courseOutlines);
  const designDocuments = useAppStore((s) => s.designDocuments);
  const assessmentBlueprints = useAppStore((s) => s.assessmentBlueprints);
  const qaReports = useAppStore((s) => s.qaReports);

  const getStepStatus = (step: WorkflowStep): 'complete' | 'current' | 'pending' => {
    const isCurrent = activeView === step.view;
    let isComplete = false;

    switch (step.key) {
      case 'needs-analysis':
        isComplete = analysisWizards[projectId]?.status === 'completed';
        break;
      case 'course-outline':
        isComplete = (courseOutlines[projectId]?.modules?.length ?? 0) > 0;
        break;
      case 'design-doc':
        isComplete = designDocuments.some((d) => d.projectId === projectId);
        break;
      case 'assessment':
        isComplete = (assessmentBlueprints[projectId]?.length ?? 0) > 0;
        break;
      case 'review':
        isComplete = (qaReports[projectId]?.length ?? 0) > 0;
        break;
    }

    if (isComplete) return 'complete';
    if (isCurrent) return 'current';
    return 'pending';
  };

  const completedCount = WORKFLOW_STEPS.filter((s) => getStepStatus(s) === 'complete').length;
  const progressPct = Math.round((completedCount / WORKFLOW_STEPS.length) * 100);

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1.5 px-3 py-2">
        {WORKFLOW_STEPS.map((step) => {
          const status = getStepStatus(step);
          return (
            <button
              key={step.key}
              onClick={() => setActiveView(step.view)}
              title={step.label}
              className={cn(
                'flex-1 h-1.5 rounded-full transition-colors',
                status === 'complete' ? 'bg-green-400' : status === 'current' ? 'bg-brand-400' : 'bg-surface-200 dark:bg-surface-700'
              )}
            />
          );
        })}
        <span className="text-xs text-surface-400 dark:text-surface-500 ml-1 tabular-nums whitespace-nowrap">
          {completedCount}/{WORKFLOW_STEPS.length}
        </span>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 border-b border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
          Workflow Progress
        </span>
        <span className="text-xs font-medium text-surface-500 dark:text-surface-400">
          {progressPct}% complete
        </span>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-0">
        {WORKFLOW_STEPS.map((step, idx) => {
          const status = getStepStatus(step);
          return (
            <React.Fragment key={step.key}>
              <button
                onClick={() => setActiveView(step.view)}
                className="flex flex-col items-center gap-1 group"
              >
                {/* Circle */}
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all',
                    status === 'complete'
                      ? 'bg-green-500 border-green-500 text-white'
                      : status === 'current'
                      ? 'bg-brand-600 border-brand-600 text-white ring-2 ring-brand-200 dark:ring-brand-800'
                      : 'bg-white dark:bg-surface-800 border-surface-300 dark:border-surface-600 text-surface-400'
                  )}
                >
                  {status === 'complete' ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-xs font-bold">{idx + 1}</span>
                  )}
                </div>
                {/* Label */}
                <span
                  className={cn(
                    'text-xs font-medium transition-colors whitespace-nowrap',
                    status === 'complete'
                      ? 'text-green-600 dark:text-green-400'
                      : status === 'current'
                      ? 'text-brand-700 dark:text-brand-300'
                      : 'text-surface-400 dark:text-surface-500 group-hover:text-surface-600 dark:group-hover:text-surface-300'
                  )}
                >
                  {step.shortLabel}
                </span>
              </button>

              {/* Connector line */}
              {idx < WORKFLOW_STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mb-4 mx-0.5 transition-colors',
                    getStepStatus(WORKFLOW_STEPS[idx + 1]) === 'complete' || status === 'complete'
                      ? 'bg-green-300 dark:bg-green-700'
                      : 'bg-surface-200 dark:bg-surface-700'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
