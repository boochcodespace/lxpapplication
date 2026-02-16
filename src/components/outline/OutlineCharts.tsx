'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { BLOOM_LEVELS, VARK_MODALITIES } from '@/lib/types';
import type { BloomLevel, VARKModality, ZPDLevel, CourseModule } from '@/lib/types';

interface OutlineChartsProps {
  projectId: string;
}

const BLOOM_COLORS: Record<BloomLevel, string> = {
  remember: 'bg-gray-400',
  understand: 'bg-blue-400',
  apply: 'bg-green-500',
  analyze: 'bg-yellow-500',
  evaluate: 'bg-orange-500',
  create: 'bg-red-500',
};

const BLOOM_LABEL_COLORS: Record<BloomLevel, string> = {
  remember: 'text-gray-700',
  understand: 'text-blue-700',
  apply: 'text-green-700',
  analyze: 'text-yellow-700',
  evaluate: 'text-orange-700',
  create: 'text-red-700',
};

const ZPD_COLORS: Record<ZPDLevel, string> = {
  comfort: 'bg-green-400',
  learning: 'bg-blue-500',
  stretch: 'bg-orange-500',
};

const ZPD_BG_COLORS: Record<ZPDLevel, string> = {
  comfort: 'bg-green-100',
  learning: 'bg-blue-100',
  stretch: 'bg-orange-100',
};

const ZPD_LABELS: Record<ZPDLevel, string> = {
  comfort: 'Comfort',
  learning: 'Learning',
  stretch: 'Stretch',
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">{children}</h4>
  );
}

function WarningItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
      <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      <span>{children}</span>
    </div>
  );
}

export default function OutlineCharts({ projectId }: OutlineChartsProps) {
  const getCourseOutline = useAppStore((s) => s.getCourseOutline);
  const outline = getCourseOutline(projectId);

  if (!outline) return null;

  const modules = outline.modules;
  const allLessons = modules.flatMap((m) => m.lessons);

  // ── Bloom's Distribution ──
  const allObjectives = [
    ...modules.flatMap((m) => m.objectives),
    ...allLessons.flatMap((l) => l.objectives),
  ];
  const bloomCounts: Record<BloomLevel, number> = {
    remember: 0,
    understand: 0,
    apply: 0,
    analyze: 0,
    evaluate: 0,
    create: 0,
  };
  allObjectives.forEach((obj) => {
    bloomCounts[obj.bloomLevel] = (bloomCounts[obj.bloomLevel] || 0) + 1;
  });
  const maxBloomCount = Math.max(1, ...Object.values(bloomCounts));

  // ── VARK Coverage ──
  const totalModules = modules.length || 1;
  const varkModuleCount: Record<VARKModality, number> = {
    visual: 0,
    auditory: 0,
    readWrite: 0,
    kinesthetic: 0,
  };
  modules.forEach((m) => {
    const allModalities = new Set([...m.modalities, ...m.lessons.flatMap((l) => l.modalities)]);
    allModalities.forEach((mod) => {
      varkModuleCount[mod] = (varkModuleCount[mod] || 0) + 1;
    });
  });

  // ── ZPD Heat Map ──
  const zpdCounts: Record<ZPDLevel, number> = { comfort: 0, learning: 0, stretch: 0 };
  allLessons.forEach((l) => {
    zpdCounts[l.zpdLevel] = (zpdCounts[l.zpdLevel] || 0) + 1;
  });
  const totalLessons = allLessons.length || 1;

  // ── Duration Summary ──
  const totalDuration = outline.totalDuration;
  const moduleDurations = modules.map((m) => m.duration);
  const avgDuration = modules.length > 0 ? Math.round(totalDuration / modules.length) : 0;
  const minDuration = modules.length > 0 ? Math.min(...moduleDurations) : 0;
  const maxDuration = modules.length > 0 ? Math.max(...moduleDurations) : 0;

  function formatDuration(mins: number) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  // ── Balance Warnings ──
  const warnings: string[] = [];

  // Module > 60 min without activity/break
  modules.forEach((mod) => {
    if (mod.duration > 60) {
      const hasActivities = mod.lessons.some((l) => l.activities.length > 0);
      if (!hasActivities) {
        warnings.push(`"${mod.title}" is ${formatDuration(mod.duration)} with no activities. Add breaks or interactive elements.`);
      }
    }
  });

  // Bloom's skewed to lower levels
  const lowerBloom = bloomCounts.remember + bloomCounts.understand;
  const totalObjectives = allObjectives.length;
  if (totalObjectives > 0 && lowerBloom / totalObjectives > 0.6) {
    warnings.push(
      `${Math.round((lowerBloom / totalObjectives) * 100)}% of objectives are at Remember/Understand level. Consider adding higher-order objectives (Apply, Analyze, Evaluate, Create).`
    );
  }

  // VARK coverage < 20%
  VARK_MODALITIES.forEach((m) => {
    const coverage = (varkModuleCount[m.key] / totalModules) * 100;
    if (modules.length > 0 && coverage < 20) {
      warnings.push(`${m.label} modality has only ${Math.round(coverage)}% coverage. Aim for at least 20% across modules.`);
    }
  });

  // >50% comfort zone
  if (allLessons.length > 0 && zpdCounts.comfort / totalLessons > 0.5) {
    warnings.push(
      `${Math.round((zpdCounts.comfort / totalLessons) * 100)}% of lessons are in the Comfort zone. Increase Learning/Stretch zone lessons for growth.`
    );
  }

  return (
    <div className="p-5 space-y-6">
      {/* ── Bloom's Distribution ── */}
      <div>
        <SectionTitle>Bloom&apos;s Distribution</SectionTitle>
        {allObjectives.length === 0 ? (
          <p className="text-xs text-surface-400">No objectives defined yet.</p>
        ) : (
          <div className="space-y-2">
            {BLOOM_LEVELS.map((level) => {
              const count = bloomCounts[level.key];
              const pct = (count / maxBloomCount) * 100;
              return (
                <div key={level.key} className="flex items-center gap-2">
                  <span className={cn('text-[10px] font-medium w-16 text-right', BLOOM_LABEL_COLORS[level.key])}>
                    {level.label}
                  </span>
                  <div className="flex-1 h-5 bg-surface-100 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-300', BLOOM_COLORS[level.key])}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-surface-600 w-5 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── VARK Coverage ── */}
      <div>
        <SectionTitle>VARK Coverage</SectionTitle>
        {modules.length === 0 ? (
          <p className="text-xs text-surface-400">No modules defined yet.</p>
        ) : (
          <div className="space-y-3">
            {VARK_MODALITIES.map((m) => {
              const count = varkModuleCount[m.key];
              const pct = Math.round((count / totalModules) * 100);
              // Extract background color from color string for the progress bar
              const barColor = m.color.split(' ')[0].replace('bg-', 'bg-').replace('-100', '-500');
              return (
                <div key={m.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded', m.color)}>
                      {m.short} {m.label}
                    </span>
                    <span className="text-[10px] font-semibold text-surface-600">{pct}%</span>
                  </div>
                  <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-300',
                        m.key === 'visual' && 'bg-blue-500',
                        m.key === 'auditory' && 'bg-purple-500',
                        m.key === 'readWrite' && 'bg-green-500',
                        m.key === 'kinesthetic' && 'bg-orange-500'
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── ZPD Heat Map ── */}
      <div>
        <SectionTitle>ZPD Distribution</SectionTitle>
        {allLessons.length === 0 ? (
          <p className="text-xs text-surface-400">No lessons defined yet.</p>
        ) : (
          <>
            {/* Grid of lesson cells */}
            <div className="flex flex-wrap gap-1 mb-3">
              {allLessons
                .sort((a, b) => {
                  const modA = modules.find((m) => m.lessons.some((l) => l.id === a.id));
                  const modB = modules.find((m) => m.lessons.some((l) => l.id === b.id));
                  if (!modA || !modB) return 0;
                  if (modA.order !== modB.order) return modA.order - modB.order;
                  return a.order - b.order;
                })
                .map((lesson) => {
                  const parentModule = modules.find((m) => m.lessons.some((l) => l.id === lesson.id));
                  return (
                    <div
                      key={lesson.id}
                      className={cn(
                        'w-7 h-7 rounded flex items-center justify-center text-[9px] font-bold',
                        ZPD_BG_COLORS[lesson.zpdLevel],
                        lesson.zpdLevel === 'comfort' && 'text-green-700',
                        lesson.zpdLevel === 'learning' && 'text-blue-700',
                        lesson.zpdLevel === 'stretch' && 'text-orange-700'
                      )}
                      title={`${parentModule?.title || 'Module'} > ${lesson.title} (${ZPD_LABELS[lesson.zpdLevel]})`}
                    >
                      {lesson.order}
                    </div>
                  );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3">
              {(['comfort', 'learning', 'stretch'] as ZPDLevel[]).map((level) => (
                <div key={level} className="flex items-center gap-1">
                  <span className={cn('w-2.5 h-2.5 rounded-sm', ZPD_COLORS[level])} />
                  <span className="text-[10px] text-surface-500">
                    {ZPD_LABELS[level]} ({zpdCounts[level]})
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Duration Summary ── */}
      <div>
        <SectionTitle>Duration Summary</SectionTitle>
        {modules.length === 0 ? (
          <p className="text-xs text-surface-400">No modules defined yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-50 rounded-lg p-3">
              <p className="text-[10px] text-surface-500 uppercase tracking-wider">Total</p>
              <p className="text-lg font-semibold text-surface-900 mt-0.5">{formatDuration(totalDuration)}</p>
            </div>
            <div className="bg-surface-50 rounded-lg p-3">
              <p className="text-[10px] text-surface-500 uppercase tracking-wider">Avg Module</p>
              <p className="text-lg font-semibold text-surface-900 mt-0.5">{formatDuration(avgDuration)}</p>
            </div>
            <div className="bg-surface-50 rounded-lg p-3">
              <p className="text-[10px] text-surface-500 uppercase tracking-wider">Shortest</p>
              <p className="text-lg font-semibold text-surface-900 mt-0.5">{formatDuration(minDuration)}</p>
            </div>
            <div className="bg-surface-50 rounded-lg p-3">
              <p className="text-[10px] text-surface-500 uppercase tracking-wider">Longest</p>
              <p className="text-lg font-semibold text-surface-900 mt-0.5">{formatDuration(maxDuration)}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Balance Checker ── */}
      {warnings.length > 0 && (
        <div>
          <SectionTitle>Balance Warnings</SectionTitle>
          <div className="space-y-2">
            {warnings.map((warning, i) => (
              <WarningItem key={i}>{warning}</WarningItem>
            ))}
          </div>
        </div>
      )}

      {/* ── No warnings state ── */}
      {warnings.length === 0 && modules.length > 0 && allObjectives.length > 0 && (
        <div>
          <SectionTitle>Balance Check</SectionTitle>
          <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Course outline is well-balanced. No issues detected.</span>
          </div>
        </div>
      )}
    </div>
  );
}
