'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { VARK_MODALITIES, BLOOM_LEVELS } from '@/lib/types';
import type { VARKModality, BloomLevel, ZPDLevel } from '@/lib/types';

interface OutlineTreeProps {
  projectId: string;
  selectedModuleId: string | null;
  selectedLessonId: string | null;
  onSelectModule: (id: string) => void;
  onSelectLesson: (moduleId: string, lessonId: string) => void;
}

const ZPD_COLORS: Record<ZPDLevel, string> = {
  comfort: 'bg-green-500',
  learning: 'bg-blue-500',
  stretch: 'bg-orange-500',
};

const ZPD_LABELS: Record<ZPDLevel, string> = {
  comfort: 'Comfort',
  learning: 'Learning',
  stretch: 'Stretch',
};

function VARKBadge({ modality }: { modality: VARKModality }) {
  const config = VARK_MODALITIES.find((m) => m.key === modality);
  if (!config) return null;
  return (
    <span className={cn('inline-flex items-center justify-center text-[10px] font-bold rounded px-1 py-0.5 leading-none', config.color)}>
      {config.short}
    </span>
  );
}

function BloomBadge({ level }: { level: BloomLevel }) {
  const config = BLOOM_LEVELS.find((b) => b.key === level);
  if (!config) return null;
  return (
    <span className="inline-flex items-center text-[10px] font-medium rounded px-1.5 py-0.5 leading-none bg-surface-100 text-surface-600">
      {config.label}
    </span>
  );
}

export default function OutlineTree({
  projectId,
  selectedModuleId,
  selectedLessonId,
  onSelectModule,
  onSelectLesson,
}: OutlineTreeProps) {
  const getCourseOutline = useAppStore((s) => s.getCourseOutline);
  const toggleModuleCollapse = useAppStore((s) => s.toggleModuleCollapse);

  const outline = getCourseOutline(projectId);

  if (!outline || outline.modules.length === 0) {
    return (
      <div className="p-5">
        <p className="text-xs text-surface-400 text-center">
          No modules yet. Click &quot;Add Module&quot; to get started.
        </p>
      </div>
    );
  }

  const sortedModules = [...outline.modules].sort((a, b) => a.order - b.order);

  return (
    <div className="py-2">
      <div className="px-4 py-2 mb-1">
        <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Outline</h3>
      </div>

      <div className="space-y-0.5">
        {sortedModules.map((mod) => {
          const isModuleSelected = selectedModuleId === mod.id && !selectedLessonId;
          const isModuleActive = selectedModuleId === mod.id;
          const isExpanded = !mod.collapsed;
          const lessonCount = mod.lessons.length;
          const hours = Math.floor(mod.duration / 60);
          const mins = mod.duration % 60;
          const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

          return (
            <div key={mod.id}>
              {/* Module row */}
              <div
                className={cn(
                  'group flex items-start gap-1.5 px-3 py-2 mx-1 rounded-lg cursor-pointer transition-colors',
                  isModuleSelected
                    ? 'bg-brand-50 border border-brand-200'
                    : isModuleActive
                      ? 'bg-brand-50/50'
                      : 'hover:bg-surface-50'
                )}
              >
                {/* Collapse toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleModuleCollapse(projectId, mod.id);
                  }}
                  className="mt-0.5 p-0.5 rounded hover:bg-surface-200 transition-colors shrink-0"
                  aria-label={isExpanded ? 'Collapse module' : 'Expand module'}
                >
                  <svg
                    className={cn(
                      'w-3.5 h-3.5 text-surface-400 transition-transform duration-150',
                      isExpanded && 'rotate-90'
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>

                {/* Module content */}
                <div
                  className="flex-1 min-w-0"
                  onClick={() => onSelectModule(mod.id)}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-surface-400 shrink-0">M{mod.order}</span>
                    <span className={cn(
                      'text-sm font-medium truncate',
                      isModuleSelected ? 'text-brand-900' : 'text-surface-800'
                    )}>
                      {mod.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-surface-400">{durationStr}</span>
                    <span className="text-[10px] text-surface-300">|</span>
                    <span className="text-[10px] text-surface-400">
                      {lessonCount} lesson{lessonCount !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* VARK badges */}
                  {mod.modalities.length > 0 && (
                    <div className="flex items-center gap-1 mt-1.5">
                      {mod.modalities.map((m) => (
                        <VARKBadge key={m} modality={m} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Lessons (collapsible) */}
              {isExpanded && mod.lessons.length > 0 && (
                <div className="ml-6 mt-0.5 space-y-0.5">
                  {[...mod.lessons].sort((a, b) => a.order - b.order).map((lesson) => {
                    const isLessonSelected = selectedModuleId === mod.id && selectedLessonId === lesson.id;
                    const lMins = lesson.duration;
                    const lDuration = lMins >= 60 ? `${Math.floor(lMins / 60)}h ${lMins % 60}m` : `${lMins}m`;

                    return (
                      <div
                        key={lesson.id}
                        className={cn(
                          'flex items-start gap-2 px-3 py-1.5 mx-1 rounded-md cursor-pointer transition-colors',
                          isLessonSelected
                            ? 'bg-brand-50 border border-brand-200'
                            : 'hover:bg-surface-50'
                        )}
                        onClick={() => onSelectLesson(mod.id, lesson.id)}
                      >
                        {/* ZPD dot */}
                        <span
                          className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', ZPD_COLORS[lesson.zpdLevel])}
                          title={`ZPD: ${ZPD_LABELS[lesson.zpdLevel]}`}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-surface-400 shrink-0">L{lesson.order}</span>
                            <span className={cn(
                              'text-xs font-medium truncate',
                              isLessonSelected ? 'text-brand-900' : 'text-surface-700'
                            )}>
                              {lesson.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-surface-400">{lDuration}</span>
                            {lesson.objectives.length > 0 && (
                              <>
                                <span className="text-[10px] text-surface-300">|</span>
                                <BloomBadge level={lesson.objectives[0].bloomLevel} />
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
