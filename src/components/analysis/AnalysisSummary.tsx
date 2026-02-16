'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { ANALYSIS_AREAS, AnalysisArea } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AnalysisSummaryProps {
  projectId: string;
}

export default function AnalysisSummary({ projectId }: AnalysisSummaryProps) {
  const wizard = useAppStore((s) => s.getAnalysisWizard(projectId));
  const { currentArea, completedAreas, responses } = wizard;

  const totalAreas = ANALYSIS_AREAS.length;
  const completedCount = completedAreas.length;
  const progressPercent = Math.round((completedCount / totalAreas) * 100);

  // Collect all red flags from responses (detect inline)
  const redFlags = React.useMemo(() => {
    const flags: { severity: 'warning' | 'critical'; area: AnalysisArea; message: string }[] = [];
    for (const resp of responses) {
      const lower = resp.answer.toLowerCase();
      if (lower.includes('asap') || lower.includes('as soon as possible')) {
        flags.push({ severity: 'critical', area: resp.area, message: 'Unrealistic timeline detected' });
      }
      if (lower.includes('no budget') || lower.includes('zero budget')) {
        flags.push({ severity: 'critical', area: resp.area, message: 'No budget allocated' });
      }
      if (lower.includes('everyone') && resp.area === 'audience') {
        flags.push({ severity: 'warning', area: resp.area, message: '"Everyone" is not a valid audience' });
      }
    }
    // Deduplicate by message
    const seen = new Set<string>();
    return flags.filter((f) => {
      if (seen.has(f.message)) return false;
      seen.add(f.message);
      return true;
    });
  }, [responses]);

  function getAreaStatus(areaKey: AnalysisArea): 'completed' | 'current' | 'pending' {
    if (completedAreas.includes(areaKey)) return 'completed';
    if (currentArea === areaKey) return 'current';
    return 'pending';
  }

  function getAreaResponses(areaKey: AnalysisArea) {
    return responses.filter((r) => r.area === areaKey);
  }

  function getAreaSummary(areaKey: AnalysisArea): string | null {
    const areaResponses = getAreaResponses(areaKey);
    if (areaResponses.length === 0) return null;
    const firstAnswer = areaResponses[0].answer;
    return firstAnswer.length > 100 ? firstAnswer.slice(0, 97) + '...' : firstAnswer;
  }

  return (
    <div className="p-5">
      {/* Header */}
      <h2 className="text-sm font-semibold text-surface-900 mb-4">Analysis Progress</h2>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-xs text-surface-500 mb-1.5">
          <span>{completedCount} of {totalAreas} areas completed</span>
          <span className="font-medium">{progressPercent}%</span>
        </div>
        <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Area Checklist */}
      <div className="space-y-1">
        {ANALYSIS_AREAS.map((area) => {
          const status = getAreaStatus(area.key);
          const areaResponses = getAreaResponses(area.key);
          const summary = getAreaSummary(area.key);
          const responseCount = areaResponses.length;

          return (
            <div
              key={area.key}
              className={cn(
                'rounded-lg p-3 transition-colors duration-150',
                status === 'current' && 'bg-brand-50 border border-brand-200',
                status === 'completed' && 'bg-white border border-surface-100',
                status === 'pending' && 'bg-transparent'
              )}
            >
              <div className="flex items-start gap-2.5">
                {/* Status icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {status === 'completed' ? (
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  ) : status === 'current' ? (
                    <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-surface-300" />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        'text-sm font-medium',
                        status === 'completed' && 'text-surface-700',
                        status === 'current' && 'text-brand-700',
                        status === 'pending' && 'text-surface-400'
                      )}
                    >
                      {area.label}
                    </span>
                    {responseCount > 0 && (
                      <span className="text-[10px] font-medium text-surface-400 bg-surface-100 rounded-full px-1.5 py-0.5">
                        {responseCount}
                      </span>
                    )}
                  </div>

                  {/* Summary preview for completed areas */}
                  {status === 'completed' && summary && (
                    <p className="text-xs text-surface-500 mt-1 leading-relaxed line-clamp-2">
                      {summary}
                    </p>
                  )}

                  {/* Current area indicator */}
                  {status === 'current' && (
                    <p className="text-xs text-brand-600 mt-0.5">
                      In progress...
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Red Flags Section */}
      {redFlags.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <h3 className="text-sm font-semibold text-surface-900">
              Red Flags ({redFlags.length})
            </h3>
          </div>
          <div className="space-y-2">
            {redFlags.map((flag, index) => {
              const areaLabel = ANALYSIS_AREAS.find((a) => a.key === flag.area)?.label || flag.area;
              return (
                <div
                  key={index}
                  className={cn(
                    'rounded-lg px-3 py-2 text-xs',
                    flag.severity === 'critical'
                      ? 'bg-red-50 border border-red-200 text-red-800'
                      : 'bg-amber-50 border border-amber-200 text-amber-800'
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className={cn(
                        'font-bold uppercase tracking-wider text-[10px]',
                        flag.severity === 'critical' ? 'text-red-600' : 'text-amber-600'
                      )}
                    >
                      {flag.severity}
                    </span>
                    <span className="text-surface-400">--</span>
                    <span className="font-medium">{areaLabel}</span>
                  </div>
                  <p>{flag.message}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completion hint */}
      {completedCount === totalAreas && (
        <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-green-800 font-medium">
            All areas complete. Generate your report from the chat panel.
          </p>
        </div>
      )}
    </div>
  );
}
