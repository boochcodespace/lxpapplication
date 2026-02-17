'use client';

import React, { useState, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import {
  QAFinding,
  QASeverity,
  BloomLevel,
  BLOOM_LEVELS,
  CourseModule,
  LearningObjective,
  DesignDocument,
} from '@/lib/types';
import { cn, generateId } from '@/lib/utils';
import Button from '@/components/ui/Button';

// ── Bloom's color mapping ──

const bloomColors: Record<BloomLevel, { bg: string; bar: string; text: string }> = {
  remember:   { bg: 'bg-gray-100',   bar: 'bg-gray-400',   text: 'text-gray-700' },
  understand: { bg: 'bg-blue-100',   bar: 'bg-blue-400',   text: 'text-blue-700' },
  apply:      { bg: 'bg-green-100',  bar: 'bg-green-500',  text: 'text-green-700' },
  analyze:    { bg: 'bg-amber-100',  bar: 'bg-amber-500',  text: 'text-amber-700' },
  evaluate:   { bg: 'bg-orange-100', bar: 'bg-orange-500', text: 'text-orange-700' },
  create:     { bg: 'bg-red-100',    bar: 'bg-red-500',    text: 'text-red-700' },
};

// ── Target distributions ──

type CourseLevel = 'foundational' | 'intermediate' | 'advanced';

const targetDistributions: Record<CourseLevel, Record<BloomLevel, number>> = {
  foundational: { remember: 20, understand: 20, apply: 40, analyze: 10, evaluate: 5, create: 5 },
  intermediate: { remember: 10, understand: 10, apply: 40, analyze: 20, evaluate: 15, create: 5 },
  advanced:     { remember: 5,  understand: 5,  apply: 30, analyze: 20, evaluate: 20, create: 20 },
};

// ── Severity helpers (reused pattern) ──

function SeverityIcon({ severity }: { severity: QASeverity }) {
  switch (severity) {
    case 'critical':
      return (
        <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      );
    case 'warning':
      return (
        <svg className="w-4 h-4 text-yellow-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      );
    case 'info':
      return (
        <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
      );
    case 'pass':
      return (
        <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
}

function severityBorder(severity: QASeverity): string {
  switch (severity) {
    case 'critical': return 'border-l-red-500';
    case 'warning': return 'border-l-yellow-500';
    case 'info': return 'border-l-blue-500';
    case 'pass': return 'border-l-green-500';
  }
}

// ── Finding Card ──

function FindingCard({
  finding,
  onResolve,
}: {
  finding: QAFinding;
  onResolve: () => void;
}) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-surface-200 border-l-4 p-4',
        severityBorder(finding.severity),
        finding.resolved && 'opacity-50'
      )}
    >
      <div className="flex items-start gap-3">
        <SeverityIcon severity={finding.severity} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-surface-900">{finding.title}</h4>
            {finding.resolved && (
              <span className="text-[10px] font-medium bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                Resolved
              </span>
            )}
          </div>
          <p className="text-xs text-surface-600 mt-1">{finding.description}</p>
          {finding.location && (
            <p className="text-[11px] text-surface-400 mt-1">
              Location: <span className="font-medium text-surface-500">{finding.location}</span>
            </p>
          )}
          {finding.suggestion && (
            <div className="mt-2 bg-brand-50 border border-brand-100 rounded px-3 py-2">
              <p className="text-xs text-brand-800">
                <span className="font-semibold">Suggestion:</span> {finding.suggestion}
              </p>
            </div>
          )}
        </div>
        {!finding.resolved && (
          <button
            onClick={onResolve}
            className="shrink-0 text-xs font-medium text-surface-500 hover:text-green-700 hover:bg-green-50 px-2 py-1 rounded transition-colors"
          >
            Mark Resolved
          </button>
        )}
      </div>
    </div>
  );
}

// ── Horizontal stacked bar ──

function StackedBar({
  distribution,
  total,
  label,
}: {
  distribution: Record<BloomLevel, number>;
  total: number;
  label: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-surface-600 mb-1">{label}</p>
      <div className="flex h-6 rounded-md overflow-hidden bg-surface-100">
        {BLOOM_LEVELS.map((bl) => {
          const count = distribution[bl.key] || 0;
          const pct = total > 0 ? (count / total) * 100 : 0;
          if (pct === 0) return null;
          return (
            <div
              key={bl.key}
              className={cn('flex items-center justify-center text-[10px] font-bold text-white transition-all relative group', bloomColors[bl.key].bar)}
              style={{ width: `${pct}%` }}
              title={`${bl.label}: ${count} (${Math.round(pct)}%)`}
            >
              {pct >= 8 && <span>{Math.round(pct)}%</span>}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-surface-800 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                {bl.label}: {count} ({Math.round(pct)}%)
              </div>
            </div>
          );
        })}
        {total === 0 && (
          <div className="flex items-center justify-center w-full text-xs text-surface-400">
            No data
          </div>
        )}
      </div>
    </div>
  );
}

// ── Module breakdown row ──

function ModuleBreakdown({
  module: mod,
  expanded,
  onToggle,
}: {
  module: CourseModule;
  expanded: boolean;
  onToggle: () => void;
}) {
  const dist: Record<BloomLevel, number> = {
    remember: 0, understand: 0, apply: 0, analyze: 0, evaluate: 0, create: 0,
  };
  const allObjs: LearningObjective[] = [...mod.objectives];
  mod.lessons.forEach((l) => allObjs.push(...l.objectives));
  allObjs.forEach((o) => { dist[o.bloomLevel]++; });
  const total = allObjs.length;

  return (
    <div className="border border-surface-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-surface-50 transition-colors text-left"
      >
        <svg
          className={cn('w-4 h-4 text-surface-400 transition-transform shrink-0', expanded && 'rotate-90')}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="flex-1 text-sm font-medium text-surface-800 truncate">{mod.title}</span>
        <span className="text-xs text-surface-500">{total} objective{total !== 1 ? 's' : ''}</span>
      </button>
      {expanded && (
        <div className="px-4 pb-3 bg-surface-50 border-t border-surface-100">
          <div className="mt-2">
            <StackedBar distribution={dist} total={total} label="" />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {BLOOM_LEVELS.map((bl) => (
              <span
                key={bl.key}
                className={cn('inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium', bloomColors[bl.key].bg, bloomColors[bl.key].text)}
              >
                {bl.label}: {dist[bl.key]}
              </span>
            ))}
          </div>
          {/* Per-lesson detail */}
          {mod.lessons.length > 0 && (
            <div className="mt-3 space-y-1">
              {mod.lessons.map((lesson) => {
                const lDist: Record<BloomLevel, number> = {
                  remember: 0, understand: 0, apply: 0, analyze: 0, evaluate: 0, create: 0,
                };
                lesson.objectives.forEach((o) => { lDist[o.bloomLevel]++; });
                const lTotal = lesson.objectives.length;
                return (
                  <div key={lesson.id} className="flex items-center gap-2 text-xs">
                    <span className="text-surface-500 w-32 truncate shrink-0">{lesson.title}</span>
                    <div className="flex-1">
                      <StackedBar distribution={lDist} total={lTotal} label="" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ──

interface BloomsAnalyzerProps {
  projectId: string;
}

export default function BloomsAnalyzer({ projectId }: BloomsAnalyzerProps) {
  const getCourseOutline = useAppStore((s) => s.getCourseOutline);
  const getDesignDocs = useAppStore((s) => s.getDesignDocs);
  const saveQAReport = useAppStore((s) => s.saveQAReport);
  const getQAReport = useAppStore((s) => s.getQAReport);
  const resolveQAFinding = useAppStore((s) => s.resolveQAFinding);
  const projects = useAppStore((s) => s.projects);

  const outline = getCourseOutline(projectId);
  const designDocs = getDesignDocs(projectId);
  const existingReport = getQAReport(projectId, 'blooms');
  const project = projects.find((p) => p.id === projectId);

  const [isRunning, setIsRunning] = useState(false);
  const [courseLevel, setCourseLevel] = useState<CourseLevel>('intermediate');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const toggleModule = useCallback((moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  }, []);

  // ── Compute actual distribution from outline ──
  const computeDistribution = useCallback((): Record<BloomLevel, number> => {
    const dist: Record<BloomLevel, number> = {
      remember: 0, understand: 0, apply: 0, analyze: 0, evaluate: 0, create: 0,
    };
    if (!outline) return dist;
    for (const mod of outline.modules) {
      mod.objectives.forEach((o) => { dist[o.bloomLevel]++; });
      for (const lesson of mod.lessons) {
        lesson.objectives.forEach((o) => { dist[o.bloomLevel]++; });
      }
    }
    return dist;
  }, [outline]);

  // Slide-level distribution from design docs
  const computeSlideDistribution = useCallback((): Record<BloomLevel, number> => {
    const dist: Record<BloomLevel, number> = {
      remember: 0, understand: 0, apply: 0, analyze: 0, evaluate: 0, create: 0,
    };
    for (const doc of designDocs) {
      for (const slide of doc.slides) {
        const level = slide.designNotes.bloomLevel;
        if (level && dist[level] !== undefined) {
          dist[level]++;
        }
      }
    }
    return dist;
  }, [designDocs]);

  const actualDist = computeDistribution();
  const slideDist = computeSlideDistribution();
  const totalObjectives = Object.values(actualDist).reduce((a, b) => a + b, 0);
  const totalSlides = Object.values(slideDist).reduce((a, b) => a + b, 0);
  const target = targetDistributions[courseLevel];

  // ── Run Analysis ──

  const runAnalysis = useCallback(() => {
    if (!outline) return;
    setIsRunning(true);

    const findings: QAFinding[] = [];
    const dist = computeDistribution();
    const total = Object.values(dist).reduce((a, b) => a + b, 0);

    if (total === 0) {
      findings.push({
        id: generateId(),
        tool: 'blooms',
        severity: 'critical',
        title: 'No learning objectives found',
        description: 'The course outline has no learning objectives to analyze.',
        location: 'Course Outline',
        suggestion: 'Add learning objectives to your modules and lessons before running the Bloom\'s analysis.',
        resolved: false,
      });
    } else {
      const lowerPct = ((dist.remember + dist.understand) / total) * 100;
      const applyPct = (dist.apply / total) * 100;
      const higherPct = ((dist.analyze + dist.evaluate + dist.create) / total) * 100;

      // Check for overreliance on lower-order
      if (lowerPct > 60) {
        findings.push({
          id: generateId(),
          tool: 'blooms',
          severity: 'critical',
          title: 'Overreliance on lower-order thinking',
          description: `${Math.round(lowerPct)}% of objectives are at Remember or Understand level. This limits learners to recall and comprehension without building real-world skills.`,
          location: 'Entire course',
          suggestion: 'Elevate objectives to Apply or above. Replace "identify" and "explain" verbs with "demonstrate", "analyze", or "evaluate" where the content supports deeper engagement.',
          resolved: false,
        });
      }

      // No higher-order objectives
      if (dist.apply === 0 && dist.analyze === 0 && dist.evaluate === 0 && dist.create === 0) {
        findings.push({
          id: generateId(),
          tool: 'blooms',
          severity: 'critical',
          title: 'No higher-order objectives',
          description: 'All objectives are at Remember or Understand level. The course lacks any Apply, Analyze, Evaluate, or Create objectives.',
          location: 'Entire course',
          suggestion: 'Add objectives that require learners to apply knowledge to realistic scenarios, analyze information, make judgments, or create deliverables.',
          resolved: false,
        });
      }

      // No Create level in advanced
      if (courseLevel === 'advanced' && dist.create === 0) {
        findings.push({
          id: generateId(),
          tool: 'blooms',
          severity: 'warning',
          title: 'No Create-level objectives in advanced course',
          description: 'An advanced course should include objectives where learners synthesize and create. No Create-level objectives were found.',
          location: 'Entire course',
          suggestion: 'Add at least one Create-level objective such as "Design a...", "Construct a...", or "Produce a...".',
          resolved: false,
        });
      }

      // Single level dominates
      for (const bl of BLOOM_LEVELS) {
        const pct = (dist[bl.key] / total) * 100;
        if (pct > 50) {
          findings.push({
            id: generateId(),
            tool: 'blooms',
            severity: 'warning',
            title: `${bl.label} level dominates (${Math.round(pct)}%)`,
            description: `More than half of all objectives are at the ${bl.label} level. A balanced distribution strengthens the learning experience.`,
            location: 'Entire course',
            suggestion: `Diversify by redistributing some ${bl.label}-level objectives to other levels.`,
            resolved: false,
          });
        }
      }

      // Per-module suggestions for low levels
      for (const mod of outline.modules) {
        const allObjs: LearningObjective[] = [...mod.objectives];
        mod.lessons.forEach((l) => allObjs.push(...l.objectives));
        const modLower = allObjs.filter((o) => o.bloomLevel === 'remember' || o.bloomLevel === 'understand');
        if (allObjs.length > 0 && modLower.length === allObjs.length) {
          findings.push({
            id: generateId(),
            tool: 'blooms',
            severity: 'info',
            title: `"${mod.title}" only has lower-order objectives`,
            description: `All ${allObjs.length} objective(s) in this module are at Remember or Understand. Consider elevating at least one to Apply or above.`,
            location: mod.title,
            suggestion: `Add a practice exercise or scenario-based activity to move at least one objective to the Apply level.`,
            resolved: false,
          });
        }

        // Specific lesson-level suggestions
        for (const lesson of mod.lessons) {
          if (lesson.objectives.length > 0) {
            const allLower = lesson.objectives.every(
              (o) => o.bloomLevel === 'remember' || o.bloomLevel === 'understand'
            );
            if (allLower && lesson.objectives.length >= 2) {
              findings.push({
                id: generateId(),
                tool: 'blooms',
                severity: 'info',
                title: `Opportunity to elevate "${lesson.title}"`,
                description: `This lesson has ${lesson.objectives.length} objectives all at lower levels. Adding a hands-on activity could move one to Apply.`,
                location: `${mod.title} > ${lesson.title}`,
                suggestion: `Consider adding a practice exercise that requires learners to demonstrate or solve, rather than just recall or explain.`,
                resolved: false,
              });
            }
          }
        }
      }
    }

    // Compute score based on how close to target distribution
    let score = 100;
    if (total > 0) {
      let deviationSum = 0;
      for (const bl of BLOOM_LEVELS) {
        const actualPct = (dist[bl.key] / total) * 100;
        const targetPct = target[bl.key];
        deviationSum += Math.abs(actualPct - targetPct);
      }
      // Max possible deviation is 200 (all in one bucket vs evenly distributed)
      score = Math.max(0, Math.round(100 - (deviationSum / 2)));
    }

    const critCount = findings.filter((f) => f.severity === 'critical').length;
    const warnCount = findings.filter((f) => f.severity === 'warning').length;
    const summary = total > 0
      ? `Analyzed ${total} objectives across ${outline.modules.length} modules. Distribution score: ${score}/100. Found ${critCount} critical and ${warnCount} warning issues.`
      : 'No learning objectives to analyze.';

    saveQAReport({
      projectId,
      tool: 'blooms',
      score,
      findings,
      summary,
    });

    setIsRunning(false);
  }, [outline, computeDistribution, target, courseLevel, projectId, saveQAReport]);

  // ── Empty state ──

  if (!outline) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75" />
            </svg>
          </div>
          <p className="text-sm font-medium text-surface-700">Create a course outline first</p>
          <p className="text-xs text-surface-500 mt-1">
            The Bloom&apos;s Analyzer requires learning objectives in the course outline.
          </p>
        </div>
      </div>
    );
  }

  const report = existingReport;
  const findings = report?.findings || [];
  const unresolvedFindings = findings.filter((f) => !f.resolved);
  const resolvedFindings = findings.filter((f) => f.resolved);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-surface-900">Bloom&apos;s Taxonomy Analyzer</h2>
          <p className="text-xs text-surface-500 mt-0.5">
            Analyze cognitive level distribution across learning objectives
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Course level selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-surface-500">Course level:</label>
            <select
              value={courseLevel}
              onChange={(e) => setCourseLevel(e.target.value as CourseLevel)}
              className="text-xs border border-surface-300 rounded-md px-2 py-1 bg-white text-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="foundational">Foundational</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <Button variant="primary" size="sm" loading={isRunning} onClick={runAnalysis}>
            <svg className="w-4 h-4 -ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
            Run Analysis
          </Button>
        </div>
      </div>

      {/* Score display */}
      {report && (
        <div className="bg-white rounded-lg border border-surface-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-surface-800">Distribution Score</h3>
            <span
              className={cn(
                'text-2xl font-bold',
                report.score < 40 ? 'text-red-600' : report.score <= 70 ? 'text-yellow-600' : 'text-green-600'
              )}
            >
              {report.score}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-surface-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                report.score < 40 ? 'bg-red-500' : report.score <= 70 ? 'bg-yellow-500' : 'bg-green-500'
              )}
              style={{ width: `${report.score}%` }}
            />
          </div>
          <p className="text-xs text-surface-500 mt-2">{report.summary}</p>
        </div>
      )}

      {/* Distribution Chart */}
      <div className="bg-white rounded-lg border border-surface-200 p-4 space-y-4">
        <h3 className="text-sm font-semibold text-surface-800">Bloom&apos;s Distribution</h3>

        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          {BLOOM_LEVELS.map((bl) => (
            <div key={bl.key} className="flex items-center gap-1.5">
              <div className={cn('w-3 h-3 rounded-sm', bloomColors[bl.key].bar)} />
              <span className="text-xs text-surface-600">{bl.label}</span>
            </div>
          ))}
        </div>

        {/* Objective distribution bar */}
        <StackedBar distribution={actualDist} total={totalObjectives} label={`Objectives (${totalObjectives} total)`} />

        {/* Slide distribution bar */}
        {totalSlides > 0 && (
          <StackedBar distribution={slideDist} total={totalSlides} label={`Design Doc Slides (${totalSlides} total)`} />
        )}
      </div>

      {/* Target vs Actual Comparison */}
      <div className="bg-white rounded-lg border border-surface-200 p-4">
        <h3 className="text-sm font-semibold text-surface-800 mb-3">
          Target vs Actual ({courseLevel.charAt(0).toUpperCase() + courseLevel.slice(1)} Level)
        </h3>
        <div className="space-y-3">
          {BLOOM_LEVELS.map((bl) => {
            const actualPct = totalObjectives > 0 ? Math.round((actualDist[bl.key] / totalObjectives) * 100) : 0;
            const targetPct = target[bl.key];
            const deviation = actualPct - targetPct;
            return (
              <div key={bl.key} className="flex items-center gap-3">
                <span className={cn('text-xs font-medium w-20 shrink-0', bloomColors[bl.key].text)}>
                  {bl.label}
                </span>
                <div className="flex-1 space-y-1">
                  {/* Target bar */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-surface-400 w-10 shrink-0">Target</span>
                    <div className="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-surface-300 transition-all"
                        style={{ width: `${targetPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-surface-400 w-8 text-right">{targetPct}%</span>
                  </div>
                  {/* Actual bar */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-surface-400 w-10 shrink-0">Actual</span>
                    <div className="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', bloomColors[bl.key].bar)}
                        style={{ width: `${Math.min(actualPct, 100)}%` }}
                      />
                    </div>
                    <span className={cn(
                      'text-[10px] w-8 text-right font-medium',
                      deviation > 15 ? 'text-red-600' : deviation < -15 ? 'text-yellow-600' : 'text-green-600'
                    )}>
                      {actualPct}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-Module Breakdown */}
      {outline.modules.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-surface-800">Per-Module Breakdown</h3>
          {outline.modules.map((mod) => (
            <ModuleBreakdown
              key={mod.id}
              module={mod}
              expanded={expandedModules.has(mod.id)}
              onToggle={() => toggleModule(mod.id)}
            />
          ))}
        </div>
      )}

      {/* Findings */}
      {findings.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-surface-800">
            Findings ({unresolvedFindings.length} unresolved)
          </h3>
          {unresolvedFindings.map((finding) => (
            <FindingCard
              key={finding.id}
              finding={finding}
              onResolve={() => resolveQAFinding(projectId, 'blooms', finding.id)}
            />
          ))}
          {resolvedFindings.length > 0 && (
            <details className="mt-4">
              <summary className="text-xs font-medium text-surface-500 cursor-pointer hover:text-surface-700">
                {resolvedFindings.length} resolved finding{resolvedFindings.length !== 1 ? 's' : ''}
              </summary>
              <div className="mt-2 space-y-2">
                {resolvedFindings.map((finding) => (
                  <FindingCard
                    key={finding.id}
                    finding={finding}
                    onResolve={() => {}}
                  />
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {/* Pre-analysis prompt */}
      {!report && (
        <div className="bg-surface-50 border border-surface-200 rounded-lg p-6 text-center">
          <p className="text-sm text-surface-500">
            Click &quot;Run Analysis&quot; to evaluate Bloom&apos;s Taxonomy distribution across your course objectives.
          </p>
        </div>
      )}
    </div>
  );
}
