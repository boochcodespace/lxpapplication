'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { cn, generateId, formatRelativeTime } from '@/lib/utils';
import type {
  QAFinding,
  QASeverity,
  ZPDLevel,
  LessonPlan,
  CourseModule,
  DesignDocument,
} from '@/lib/types';

interface ZPDValidatorProps {
  projectId: string;
}

const ZPD_COLORS: Record<ZPDLevel, { bg: string; text: string; dot: string; card: string }> = {
  comfort: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    dot: 'bg-green-500',
    card: 'border-green-200 bg-green-50',
  },
  learning: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    card: 'border-blue-200 bg-blue-50',
  },
  stretch: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    dot: 'bg-orange-500',
    card: 'border-orange-200 bg-orange-50',
  },
};

const ZPD_LABELS: Record<ZPDLevel, string> = {
  comfort: 'Comfort Zone',
  learning: 'Learning Zone',
  stretch: 'Stretch Zone',
};

const SEVERITY_STYLES: Record<QASeverity, { bg: string; text: string; border: string; icon: string }> = {
  critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: 'text-red-500' },
  warning: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: 'text-amber-500' },
  info: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'text-blue-500' },
  pass: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: 'text-green-500' },
};

interface FlatLesson {
  lesson: LessonPlan;
  module: CourseModule;
  globalIndex: number;
}

function getScaffoldingFromDesignDocs(
  designDocs: DesignDocument[],
  lessonId: string
): { hasScaffolding: boolean; strategy: string; fadePlan: string } {
  for (const doc of designDocs) {
    if (doc.lessonId === lessonId) {
      for (const slide of doc.slides) {
        const strat = slide.designNotes.scaffoldingStrategy?.trim();
        if (strat) {
          const hasFade =
            /fade|reduce|gradual|remove|withdraw|release|independent/i.test(strat);
          return {
            hasScaffolding: true,
            strategy: strat,
            fadePlan: hasFade ? 'Described' : 'Not described',
          };
        }
      }
    }
  }
  return { hasScaffolding: false, strategy: '', fadePlan: '' };
}

export default function ZPDValidator({ projectId }: ZPDValidatorProps) {
  const getCourseOutline = useAppStore((s) => s.getCourseOutline);
  const getDesignDocs = useAppStore((s) => s.getDesignDocs);
  const getQAReport = useAppStore((s) => s.getQAReport);
  const saveQAReport = useAppStore((s) => s.saveQAReport);
  const resolveQAFinding = useAppStore((s) => s.resolveQAFinding);

  const [isRunning, setIsRunning] = useState(false);

  const outline = getCourseOutline(projectId);
  const designDocs = getDesignDocs(projectId);
  const existingReport = getQAReport(projectId, 'zpd');

  const flatLessons = useMemo<FlatLesson[]>(() => {
    if (!outline) return [];
    let idx = 0;
    const result: FlatLesson[] = [];
    for (const mod of [...outline.modules].sort((a, b) => a.order - b.order)) {
      for (const lesson of [...mod.lessons].sort((a, b) => a.order - b.order)) {
        result.push({ lesson, module: mod, globalIndex: idx++ });
      }
    }
    return result;
  }, [outline]);

  const runAnalysis = useCallback(() => {
    if (!outline) return;
    setIsRunning(true);

    const findings: QAFinding[] = [];
    const totalLessons = flatLessons.length;
    if (totalLessons === 0) {
      setIsRunning(false);
      return;
    }

    const counts: Record<ZPDLevel, number> = { comfort: 0, learning: 0, stretch: 0 };
    flatLessons.forEach((fl) => {
      counts[fl.lesson.zpdLevel]++;
    });

    // 1. Check all same ZPD level
    const distinctLevels = (Object.keys(counts) as ZPDLevel[]).filter((k) => counts[k] > 0);
    if (distinctLevels.length === 1) {
      findings.push({
        id: generateId(),
        tool: 'zpd',
        severity: 'critical',
        title: 'No difficulty progression',
        description: `All ${totalLessons} lessons are at the "${ZPD_LABELS[distinctLevels[0]]}" level. Effective courses need progressive difficulty across comfort, learning, and stretch zones.`,
        location: 'Course-wide',
        suggestion:
          'Redesign lessons to follow a gradual release of responsibility: start with comfort-level content, move through learning-level practice, and build to stretch-level challenges.',
        resolved: false,
      });
    }

    // 2. No stretch content
    if (counts.stretch === 0 && totalLessons > 1) {
      findings.push({
        id: generateId(),
        tool: 'zpd',
        severity: 'warning',
        title: 'No stretch-level content',
        description:
          'The course contains no stretch-level lessons. Learners may not be sufficiently challenged to reach higher performance.',
        location: 'Course-wide',
        suggestion:
          'Add at least 1-2 stretch-level lessons toward the end of the course with complex scenarios or performance tasks.',
        resolved: false,
      });
    }

    // 3. Check ordering: stretch before learning
    let firstLearningIdx = -1;
    let firstStretchIdx = -1;
    for (const fl of flatLessons) {
      if (fl.lesson.zpdLevel === 'learning' && firstLearningIdx === -1) {
        firstLearningIdx = fl.globalIndex;
      }
      if (fl.lesson.zpdLevel === 'stretch' && firstStretchIdx === -1) {
        firstStretchIdx = fl.globalIndex;
      }
    }
    if (firstStretchIdx !== -1 && firstLearningIdx !== -1 && firstStretchIdx < firstLearningIdx) {
      const stretchLesson = flatLessons[firstStretchIdx];
      findings.push({
        id: generateId(),
        tool: 'zpd',
        severity: 'warning',
        title: 'Difficulty ordering issue',
        description: `Stretch-level lesson "${stretchLesson.lesson.title}" (Lesson ${firstStretchIdx + 1}) appears before any learning-level content.`,
        location: `${stretchLesson.module.title} > ${stretchLesson.lesson.title}`,
        suggestion:
          'Reorder so learning-level lessons precede stretch-level lessons to scaffold understanding before challenge.',
        resolved: false,
      });
    }

    // 4. Check comfort-to-stretch jumps (consecutive lessons)
    for (let i = 1; i < flatLessons.length; i++) {
      const prev = flatLessons[i - 1];
      const curr = flatLessons[i];
      if (prev.lesson.zpdLevel === 'comfort' && curr.lesson.zpdLevel === 'stretch') {
        findings.push({
          id: generateId(),
          tool: 'zpd',
          severity: 'warning',
          title: 'Comfort-to-stretch jump without transition',
          description: `"${prev.lesson.title}" (comfort) is immediately followed by "${curr.lesson.title}" (stretch) with no learning-level transition.`,
          location: `${curr.module.title} > ${curr.lesson.title}`,
          suggestion:
            'Insert a learning-level lesson between comfort and stretch levels, or convert the stretch lesson to learning level with added scaffolding.',
          resolved: false,
        });
      }
    }

    // 5. Check scaffolding for stretch lessons
    flatLessons.forEach((fl) => {
      if (fl.lesson.zpdLevel === 'stretch') {
        const scaffolding = getScaffoldingFromDesignDocs(designDocs, fl.lesson.id);
        if (!scaffolding.hasScaffolding) {
          findings.push({
            id: generateId(),
            tool: 'zpd',
            severity: 'critical',
            title: 'Stretch lesson without scaffolding strategy',
            description: `"${fl.lesson.title}" is at stretch level but has no scaffolding strategy defined in its design notes.`,
            location: `${fl.module.title} > ${fl.lesson.title}`,
            suggestion:
              'Add scaffolding such as worked examples, hints, peer support, or checklists. Stretch-level content requires explicit support structures.',
            resolved: false,
          });
        }
      }
    });

    // 6. Check learning-level lessons without scaffolding
    flatLessons.forEach((fl) => {
      if (fl.lesson.zpdLevel === 'learning') {
        const scaffolding = getScaffoldingFromDesignDocs(designDocs, fl.lesson.id);
        if (!scaffolding.hasScaffolding) {
          findings.push({
            id: generateId(),
            tool: 'zpd',
            severity: 'warning',
            title: 'Learning-level lesson without scaffolding',
            description: `"${fl.lesson.title}" is in the learning zone but has no scaffolding strategy. The learning zone is where growth happens -- scaffolding ensures it is achievable.`,
            location: `${fl.module.title} > ${fl.lesson.title}`,
            suggestion:
              'Add scaffolding strategies such as guided practice, partial completion, or hints to support learners in their ZPD.',
            resolved: false,
          });
        }
      }
    });

    // 7. Check scaffolding fading
    const scaffoldedLessons = flatLessons
      .map((fl) => ({
        ...fl,
        scaffolding: getScaffoldingFromDesignDocs(designDocs, fl.lesson.id),
      }))
      .filter((fl) => fl.scaffolding.hasScaffolding);

    if (scaffoldedLessons.length > 1) {
      const withoutFade = scaffoldedLessons.filter(
        (fl) => fl.scaffolding.fadePlan === 'Not described'
      );
      if (withoutFade.length > 0) {
        findings.push({
          id: generateId(),
          tool: 'zpd',
          severity: 'info',
          title: 'Scaffolding fade plan not described',
          description: `${withoutFade.length} lesson(s) with scaffolding do not describe how support will be reduced over time.`,
          location: withoutFade.map((fl) => fl.lesson.title).join(', '),
          suggestion:
            'Describe how scaffolding will fade: e.g., "Remove worked examples after Lesson 3" or "Shift from guided to independent practice."',
          resolved: false,
        });
      }
    }

    // 8. Check progression pattern (early comfort/learning, later learning/stretch)
    if (totalLessons >= 4 && distinctLevels.length > 1) {
      const midpoint = Math.floor(totalLessons / 2);
      const firstHalf = flatLessons.slice(0, midpoint);
      const secondHalf = flatLessons.slice(midpoint);
      const firstHalfStretch = firstHalf.filter(
        (fl) => fl.lesson.zpdLevel === 'stretch'
      ).length;
      const secondHalfComfort = secondHalf.filter(
        (fl) => fl.lesson.zpdLevel === 'comfort'
      ).length;
      if (
        firstHalfStretch > firstHalf.length * 0.5 ||
        secondHalfComfort > secondHalf.length * 0.5
      ) {
        findings.push({
          id: generateId(),
          tool: 'zpd',
          severity: 'warning',
          title: 'Inverted difficulty curve',
          description:
            'The course has more challenging content early and easier content later. Effective progression typically moves from comfort to stretch.',
          location: 'Course-wide',
          suggestion:
            'Rearrange lessons so early modules build foundational skills (comfort/learning) and later modules apply them under challenge (learning/stretch).',
          resolved: false,
        });
      }
    }

    // Score calculation
    const comfortPct = counts.comfort / totalLessons;
    const learningPct = counts.learning / totalLessons;
    const stretchPct = counts.stretch / totalLessons;

    // Ideal: 20% comfort, 60% learning, 20% stretch
    const comfortDev = Math.abs(comfortPct - 0.2);
    const learningDev = Math.abs(learningPct - 0.6);
    const stretchDev = Math.abs(stretchPct - 0.2);
    const distributionScore = Math.max(0, 100 - (comfortDev + learningDev + stretchDev) * 100);

    // Deductions for findings
    const criticalCount = findings.filter((f) => f.severity === 'critical').length;
    const warningCount = findings.filter((f) => f.severity === 'warning').length;
    const infoCount = findings.filter((f) => f.severity === 'info').length;
    const findingDeduction = criticalCount * 15 + warningCount * 7 + infoCount * 2;
    const score = Math.max(0, Math.min(100, Math.round(distributionScore - findingDeduction)));

    const summary =
      score >= 80
        ? 'ZPD distribution is well-balanced with appropriate scaffolding and progression.'
        : score >= 50
          ? 'ZPD distribution has some issues. Review findings to improve difficulty progression and scaffolding.'
          : 'ZPD distribution needs significant attention. Multiple issues with progression, scaffolding, or zone balance were found.';

    saveQAReport({ projectId, tool: 'zpd', score, findings, summary });
    setIsRunning(false);
  }, [outline, flatLessons, designDocs, projectId, saveQAReport]);

  // Empty state
  if (!outline) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-surface-300 mb-4"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
        </svg>
        <h3 className="text-sm font-semibold text-surface-700 mb-1">No Course Outline Found</h3>
        <p className="text-xs text-surface-500 max-w-xs">
          Create a course outline with modules and lessons before running the ZPD validator.
        </p>
      </div>
    );
  }

  if (flatLessons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-surface-300 mb-4"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 9h6M9 12h6M9 15h4" strokeLinecap="round" />
        </svg>
        <h3 className="text-sm font-semibold text-surface-700 mb-1">No Lessons Defined</h3>
        <p className="text-xs text-surface-500 max-w-xs">
          Add lessons to your course modules before running ZPD validation.
        </p>
      </div>
    );
  }

  const counts: Record<ZPDLevel, number> = { comfort: 0, learning: 0, stretch: 0 };
  flatLessons.forEach((fl) => {
    counts[fl.lesson.zpdLevel]++;
  });
  const totalLessons = flatLessons.length;

  const unresolvedFindings = existingReport
    ? existingReport.findings.filter((f) => !f.resolved)
    : [];

  return (
    <div className="space-y-6">
      {/* Header + Run Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-surface-900">ZPD Validator</h3>
          <p className="text-xs text-surface-500 mt-0.5">
            Assesses difficulty progression, scaffolding coverage, and zone distribution.
          </p>
        </div>
        <button
          onClick={runAnalysis}
          disabled={isRunning}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            isRunning
              ? 'bg-surface-200 text-surface-400 cursor-not-allowed'
              : 'bg-brand-600 text-white hover:bg-brand-700'
          )}
        >
          {isRunning ? 'Analyzing...' : existingReport ? 'Re-run Analysis' : 'Run Analysis'}
        </button>
      </div>

      {/* Score banner */}
      {existingReport && (
        <div
          className={cn(
            'flex items-center justify-between px-5 py-4 rounded-lg border',
            existingReport.score >= 80
              ? 'bg-green-50 border-green-200'
              : existingReport.score >= 50
                ? 'bg-amber-50 border-amber-200'
                : 'bg-red-50 border-red-200'
          )}
        >
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'text-3xl font-bold',
                existingReport.score >= 80
                  ? 'text-green-700'
                  : existingReport.score >= 50
                    ? 'text-amber-700'
                    : 'text-red-700'
              )}
            >
              {existingReport.score}
            </div>
            <div>
              <p className="text-sm font-medium text-surface-800">{existingReport.summary}</p>
              <p className="text-xs text-surface-500 mt-0.5">
                Last run: {formatRelativeTime(existingReport.runAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="px-2 py-1 rounded bg-red-100 text-red-700 font-medium">
              {existingReport.findings.filter((f) => f.severity === 'critical' && !f.resolved).length} critical
            </span>
            <span className="px-2 py-1 rounded bg-amber-100 text-amber-700 font-medium">
              {existingReport.findings.filter((f) => f.severity === 'warning' && !f.resolved).length} warnings
            </span>
            <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 font-medium">
              {existingReport.findings.filter((f) => f.severity === 'info' && !f.resolved).length} info
            </span>
          </div>
        </div>
      )}

      {/* ZPD Distribution Cards */}
      <div>
        <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">
          ZPD Distribution Overview
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {(['comfort', 'learning', 'stretch'] as ZPDLevel[]).map((level) => {
            const count = counts[level];
            const pct = totalLessons > 0 ? Math.round((count / totalLessons) * 100) : 0;
            const ideal = level === 'learning' ? 60 : 20;
            const isClose = Math.abs(pct - ideal) <= 10;
            return (
              <div
                key={level}
                className={cn(
                  'rounded-lg border p-4 text-center',
                  ZPD_COLORS[level].card
                )}
              >
                <div className={cn('text-2xl font-bold', ZPD_COLORS[level].text)}>{count}</div>
                <div className={cn('text-xs font-medium mt-1', ZPD_COLORS[level].text)}>
                  {ZPD_LABELS[level]}
                </div>
                <div className="text-xs text-surface-500 mt-1">
                  {pct}% of lessons
                </div>
                <div
                  className={cn(
                    'text-[10px] mt-1 font-medium',
                    isClose ? 'text-green-600' : 'text-amber-600'
                  )}
                >
                  Ideal: ~{ideal}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progression Chart */}
      <div>
        <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">
          Difficulty Progression
        </h4>
        <div className="bg-surface-50 border border-surface-200 rounded-lg p-4">
          <div className="relative">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-surface-400 w-14 pr-2 text-right">
              <span>Stretch</span>
              <span>Learning</span>
              <span>Comfort</span>
            </div>
            {/* Chart area */}
            <div className="ml-16 overflow-x-auto">
              <div className="relative" style={{ minWidth: Math.max(flatLessons.length * 44, 200) + 'px', height: '80px' }}>
                {/* Grid lines */}
                <div className="absolute inset-0">
                  <div className="absolute top-0 left-0 right-0 border-b border-dashed border-surface-200" />
                  <div className="absolute top-1/2 left-0 right-0 border-b border-dashed border-surface-200 -translate-y-px" />
                  <div className="absolute bottom-0 left-0 right-0 border-b border-dashed border-surface-200" />
                </div>
                {/* Connecting line */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  preserveAspectRatio="none"
                >
                  {flatLessons.map((fl, i) => {
                    if (i === 0) return null;
                    const prev = flatLessons[i - 1];
                    const getY = (level: ZPDLevel) =>
                      level === 'stretch' ? 12 : level === 'learning' ? 40 : 68;
                    const spacing = 44;
                    const x1 = i * spacing - spacing + 22;
                    const y1 = getY(prev.lesson.zpdLevel);
                    const x2 = i * spacing + 22;
                    const y2 = getY(fl.lesson.zpdLevel);
                    return (
                      <line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#94a3b8"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                      />
                    );
                  })}
                </svg>
                {/* Dots */}
                <div className="relative h-full flex items-start">
                  {flatLessons.map((fl, i) => {
                    const top =
                      fl.lesson.zpdLevel === 'stretch'
                        ? 4
                        : fl.lesson.zpdLevel === 'learning'
                          ? 32
                          : 60;
                    return (
                      <div
                        key={fl.lesson.id}
                        className="absolute flex flex-col items-center"
                        style={{ left: `${i * 44 + 12}px`, top: `${top}px` }}
                      >
                        <div
                          className={cn(
                            'w-5 h-5 rounded-full border-2 border-white shadow-sm',
                            ZPD_COLORS[fl.lesson.zpdLevel].dot
                          )}
                          title={`${fl.module.title} > ${fl.lesson.title} (${ZPD_LABELS[fl.lesson.zpdLevel]})`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* X-axis labels */}
              <div className="flex mt-2">
                {flatLessons.map((fl, i) => (
                  <div
                    key={fl.lesson.id}
                    className="text-[9px] text-surface-400 text-center truncate"
                    style={{ width: '44px' }}
                    title={fl.lesson.title}
                  >
                    L{i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 ml-16">
            {(['comfort', 'learning', 'stretch'] as ZPDLevel[]).map((level) => (
              <div key={level} className="flex items-center gap-1.5">
                <div className={cn('w-3 h-3 rounded-full', ZPD_COLORS[level].dot)} />
                <span className="text-[10px] text-surface-500">{ZPD_LABELS[level]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scaffolding Audit */}
      <div>
        <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">
          Scaffolding Audit
        </h4>
        {outline.modules.sort((a, b) => a.order - b.order).map((mod) => {
          const sortedLessons = [...mod.lessons].sort((a, b) => a.order - b.order);
          if (sortedLessons.length === 0) return null;
          return (
            <div key={mod.id} className="mb-4">
              <div className="text-xs font-medium text-surface-700 mb-2">
                {mod.title}
              </div>
              <div className="border border-surface-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-surface-50 text-surface-500 border-b border-surface-200">
                      <th className="text-left px-3 py-2 font-medium">Lesson</th>
                      <th className="text-left px-3 py-2 font-medium">ZPD Level</th>
                      <th className="text-center px-3 py-2 font-medium">Scaffolding</th>
                      <th className="text-left px-3 py-2 font-medium">Type</th>
                      <th className="text-left px-3 py-2 font-medium">Fade Plan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedLessons.map((lesson) => {
                      const scaffolding = getScaffoldingFromDesignDocs(designDocs, lesson.id);
                      return (
                        <tr key={lesson.id} className="border-b border-surface-100 last:border-0">
                          <td className="px-3 py-2 text-surface-700 font-medium">
                            {lesson.title}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={cn(
                                'inline-flex px-2 py-0.5 rounded text-[10px] font-semibold',
                                ZPD_COLORS[lesson.zpdLevel].bg,
                                ZPD_COLORS[lesson.zpdLevel].text
                              )}
                            >
                              {ZPD_LABELS[lesson.zpdLevel]}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center">
                            {scaffolding.hasScaffolding ? (
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                className="text-green-500 mx-auto"
                              >
                                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            ) : (
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                className="text-red-400 mx-auto"
                              >
                                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </td>
                          <td className="px-3 py-2 text-surface-600 max-w-[180px] truncate">
                            {scaffolding.strategy || (
                              <span className="text-surface-300">--</span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            {scaffolding.fadePlan ? (
                              <span
                                className={cn(
                                  'text-[10px] font-medium',
                                  scaffolding.fadePlan === 'Described'
                                    ? 'text-green-600'
                                    : 'text-amber-600'
                                )}
                              >
                                {scaffolding.fadePlan}
                              </span>
                            ) : (
                              <span className="text-surface-300">--</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Findings List */}
      {existingReport && existingReport.findings.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">
            Findings ({unresolvedFindings.length} unresolved)
          </h4>
          <div className="space-y-2">
            {existingReport.findings.map((finding) => {
              const style = SEVERITY_STYLES[finding.severity];
              return (
                <div
                  key={finding.id}
                  className={cn(
                    'rounded-lg border px-4 py-3 transition-opacity',
                    style.bg,
                    style.border,
                    finding.resolved && 'opacity-50'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={cn(
                            'inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase',
                            finding.severity === 'critical' && 'bg-red-200 text-red-800',
                            finding.severity === 'warning' && 'bg-amber-200 text-amber-800',
                            finding.severity === 'info' && 'bg-blue-200 text-blue-800',
                            finding.severity === 'pass' && 'bg-green-200 text-green-800'
                          )}
                        >
                          {finding.severity}
                        </span>
                        <span className={cn('text-sm font-medium', style.text)}>
                          {finding.title}
                        </span>
                        {finding.resolved && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-surface-200 text-surface-500 rounded font-medium">
                            Resolved
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-surface-600 mb-1">{finding.description}</p>
                      <p className="text-[10px] text-surface-400 mb-1">
                        Location: {finding.location}
                      </p>
                      <p className="text-xs text-surface-600 italic">
                        Suggestion: {finding.suggestion}
                      </p>
                    </div>
                    {!finding.resolved && (
                      <button
                        onClick={() => resolveQAFinding(projectId, 'zpd', finding.id)}
                        className="shrink-0 px-3 py-1.5 text-[10px] font-medium rounded-md bg-white border border-surface-200 text-surface-600 hover:bg-surface-50 hover:border-surface-300 transition-colors"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No findings state */}
      {existingReport && existingReport.findings.length === 0 && (
        <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <svg
            className="w-4 h-4 text-green-500 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>ZPD distribution is well-balanced. No issues detected.</span>
        </div>
      )}
    </div>
  );
}
