'use client';

import React from 'react';
import { ADDIE_PHASES, ADDIEPhase } from '@/lib/types';
import { cn, getPhaseColor } from '@/lib/utils';

interface ADDIEProgressProps {
  phaseProgress: Record<ADDIEPhase, number>;
  currentPhase: ADDIEPhase;
  compact?: boolean;
}

export default function ADDIEProgress({ phaseProgress, currentPhase, compact = false }: ADDIEProgressProps) {
  const phaseBarColors: Record<ADDIEPhase, string> = {
    analysis: 'bg-blue-500',
    design: 'bg-purple-500',
    development: 'bg-amber-500',
    implementation: 'bg-green-500',
    evaluation: 'bg-rose-500',
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {ADDIE_PHASES.map((phase) => (
          <div key={phase.key} className="flex-1 h-1.5 rounded-full bg-surface-200 overflow-hidden" title={`${phase.label}: ${phaseProgress[phase.key]}%`}>
            <div
              className={cn('h-full rounded-full transition-all duration-500', phaseBarColors[phase.key])}
              style={{ width: `${phaseProgress[phase.key]}%` }}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {ADDIE_PHASES.map((phase) => {
        const progress = phaseProgress[phase.key];
        const isCurrent = phase.key === currentPhase;

        return (
          <div key={phase.key} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded-full',
                    isCurrent ? getPhaseColor(phase.key) : 'text-surface-600'
                  )}
                >
                  {phase.label}
                </span>
                {isCurrent && (
                  <span className="text-xs text-brand-600 font-medium">Current</span>
                )}
              </div>
              <span className="text-xs text-surface-500 tabular-nums">{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-surface-100 overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  phaseBarColors[phase.key],
                  progress === 0 && 'invisible'
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
