'use client';

import React, { useState, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import {
  QAFinding,
  QASeverity,
  BLOOM_LEVELS,
  LearningObjective,
  CourseModule,
  DesignDocument,
} from '@/lib/types';
import { cn, generateId } from '@/lib/utils';
import Button from '@/components/ui/Button';

// ── Severity helpers ──

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

// ── Stat Card ──

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-surface-200 px-4 py-3 text-center">
      <p className={cn('text-2xl font-bold', color)}>{value}</p>
      <p className="text-xs text-surface-500 mt-0.5">{label}</p>
    </div>
  );
}

// ── Collect all objectives from outline ──

interface CollectedObjective extends LearningObjective {
  moduleTitle: string;
  moduleId: string;
  lessonTitle?: string;
  lessonId?: string;
}

function collectObjectives(modules: CourseModule[]): CollectedObjective[] {
  const result: CollectedObjective[] = [];
  for (const mod of modules) {
    for (const obj of mod.objectives) {
      result.push({
        ...obj,
        moduleTitle: mod.title,
        moduleId: mod.id,
      });
    }
    for (const lesson of mod.lessons) {
      for (const obj of lesson.objectives) {
        result.push({
          ...obj,
          moduleTitle: mod.title,
          moduleId: mod.id,
          lessonTitle: lesson.title,
          lessonId: lesson.id,
        });
      }
    }
  }
  return result;
}

// ── Check content coverage via design docs ──

function objectiveHasContent(objectiveId: string, designDocs: DesignDocument[]): boolean {
  for (const doc of designDocs) {
    for (const slide of doc.slides) {
      if (slide.objectiveRef === objectiveId) return true;
    }
  }
  return false;
}

function findOrphanedSlides(
  objectiveIds: Set<string>,
  designDocs: DesignDocument[]
): { docTitle: string; slideTitle: string; slideNumber: number; objectiveRef: string }[] {
  const orphans: { docTitle: string; slideTitle: string; slideNumber: number; objectiveRef: string }[] = [];
  for (const doc of designDocs) {
    for (const slide of doc.slides) {
      if (slide.objectiveRef && !objectiveIds.has(slide.objectiveRef)) {
        orphans.push({
          docTitle: doc.title,
          slideTitle: slide.title,
          slideNumber: slide.slideNumber,
          objectiveRef: slide.objectiveRef,
        });
      }
    }
  }
  return orphans;
}

// ── Main Component ──

interface AlignmentCheckerProps {
  projectId: string;
}

export default function AlignmentChecker({ projectId }: AlignmentCheckerProps) {
  const getCourseOutline = useAppStore((s) => s.getCourseOutline);
  const getDesignDocs = useAppStore((s) => s.getDesignDocs);
  const saveQAReport = useAppStore((s) => s.saveQAReport);
  const getQAReport = useAppStore((s) => s.getQAReport);
  const resolveQAFinding = useAppStore((s) => s.resolveQAFinding);

  const outline = getCourseOutline(projectId);
  const designDocs = getDesignDocs(projectId);
  const existingReport = getQAReport(projectId, 'alignment');

  const [isRunning, setIsRunning] = useState(false);

  const bloomLabel = useCallback((level: string) => {
    const found = BLOOM_LEVELS.find((b) => b.key === level);
    return found ? found.label : level;
  }, []);

  const runAnalysis = useCallback(() => {
    if (!outline) return;

    setIsRunning(true);

    const findings: QAFinding[] = [];
    const modules = outline.modules;
    const allObjectives = collectObjectives(modules);
    const objectiveIds = new Set(allObjectives.map((o) => o.id));

    let alignedCount = 0;
    let unalignedCount = 0;
    let contentCoveredCount = 0;

    // 1) Check each objective for assessment alignment and content coverage
    for (const obj of allObjectives) {
      const hasContent = objectiveHasContent(obj.id, designDocs);
      if (hasContent) contentCoveredCount++;

      if (obj.assessmentAligned) {
        alignedCount++;
      } else {
        unalignedCount++;
        findings.push({
          id: generateId(),
          tool: 'alignment',
          severity: 'warning',
          title: 'Objective lacks assessment alignment',
          description: `"${obj.text}" is not marked as assessment-aligned. Learners may not be evaluated on this objective.`,
          location: obj.lessonTitle
            ? `${obj.moduleTitle} > ${obj.lessonTitle}`
            : obj.moduleTitle,
          suggestion: `Create a formative or summative assessment that evaluates this objective at the ${bloomLabel(obj.bloomLevel)} level.`,
          resolved: false,
        });
      }

      if (!hasContent) {
        findings.push({
          id: generateId(),
          tool: 'alignment',
          severity: 'warning',
          title: 'Objective has no content coverage',
          description: `"${obj.text}" has no matching design document slides. This objective may not have instructional content.`,
          location: obj.lessonTitle
            ? `${obj.moduleTitle} > ${obj.lessonTitle}`
            : obj.moduleTitle,
          suggestion: 'Create design document slides that reference this objective to ensure content supports the learning goal.',
          resolved: false,
        });
      }
    }

    // 2) Check for orphaned content
    const orphanedSlides = findOrphanedSlides(objectiveIds, designDocs);
    for (const orphan of orphanedSlides) {
      findings.push({
        id: generateId(),
        tool: 'alignment',
        severity: 'info',
        title: 'Orphaned content — no matching objective',
        description: `Slide "${orphan.slideTitle}" (Slide ${orphan.slideNumber}) in "${orphan.docTitle}" references objective "${orphan.objectiveRef}" which does not match any known objective.`,
        location: `${orphan.docTitle}, Slide ${orphan.slideNumber}`,
        suggestion: 'Either add a matching learning objective to the outline, update the slide\'s objective reference, or remove the slide if the content is no longer needed.',
        resolved: false,
      });
    }

    // 3) Check modules without assessment strategies
    for (const mod of modules) {
      if (!mod.assessmentStrategy || mod.assessmentStrategy.trim() === '') {
        findings.push({
          id: generateId(),
          tool: 'alignment',
          severity: 'critical',
          title: 'Module missing assessment strategy',
          description: `"${mod.title}" has no assessment strategy defined. Without an assessment plan, there is no way to verify learners have met the module objectives.`,
          location: mod.title,
          suggestion: 'Define an assessment strategy that includes both formative checks throughout the module and a summative evaluation at the end.',
          resolved: false,
        });
      }
    }

    // Compute score
    const totalObjectives = allObjectives.length;
    const score = totalObjectives > 0
      ? Math.round((alignedCount / totalObjectives) * 100)
      : 100;

    // Build summary
    const critCount = findings.filter((f) => f.severity === 'critical').length;
    const warnCount = findings.filter((f) => f.severity === 'warning').length;
    const infoCount = findings.filter((f) => f.severity === 'info').length;
    const summary = totalObjectives > 0
      ? `${alignedCount} of ${totalObjectives} objectives are assessment-aligned (${score}%). ${contentCoveredCount} have content coverage. Found ${critCount} critical, ${warnCount} warning, and ${infoCount} info findings.`
      : 'No learning objectives found in the course outline.';

    saveQAReport({
      projectId,
      tool: 'alignment',
      score,
      findings,
      summary,
    });

    setIsRunning(false);
  }, [outline, designDocs, projectId, saveQAReport, bloomLabel]);

  // ── No outline: empty state ──
  if (!outline) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.018a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.25 8.81" />
            </svg>
          </div>
          <p className="text-sm font-medium text-surface-700">Create a course outline first to run alignment checks</p>
          <p className="text-xs text-surface-500 mt-1">
            The alignment checker compares learning objectives against assessments and content coverage.
          </p>
        </div>
      </div>
    );
  }

  // Collect stats from the existing report or compute from outline
  const allObjectives = collectObjectives(outline.modules);
  const totalObjectives = allObjectives.length;
  const alignedFromOutline = allObjectives.filter((o) => o.assessmentAligned).length;
  const unalignedFromOutline = totalObjectives - alignedFromOutline;
  const orphanedFromDocs = findOrphanedSlides(
    new Set(allObjectives.map((o) => o.id)),
    designDocs
  ).length;

  const report = existingReport;
  const findings = report?.findings || [];
  const unresolvedFindings = findings.filter((f) => !f.resolved);
  const resolvedFindings = findings.filter((f) => f.resolved);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-surface-900">Alignment Checker</h2>
          <p className="text-xs text-surface-500 mt-0.5">
            Verify that assessments match learning objectives and content coverage is complete
          </p>
        </div>
        <Button variant="primary" size="sm" loading={isRunning} onClick={runAnalysis}>
          <svg className="w-4 h-4 -ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
          </svg>
          Run Analysis
        </Button>
      </div>

      {/* Summary Panel */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Total Objectives" value={totalObjectives} color="text-surface-900" />
        <StatCard label="Aligned" value={alignedFromOutline} color="text-green-700" />
        <StatCard label="Unaligned" value={unalignedFromOutline} color="text-yellow-700" />
        <StatCard label="Orphaned Content" value={orphanedFromDocs} color="text-blue-700" />
      </div>

      {/* Score display if report exists */}
      {report && (
        <div className="bg-white rounded-lg border border-surface-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-surface-800">Alignment Score</h3>
            <span
              className={cn(
                'text-2xl font-bold',
                report.score < 40
                  ? 'text-red-600'
                  : report.score <= 70
                    ? 'text-yellow-600'
                    : 'text-green-600'
              )}
            >
              {report.score}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-surface-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                report.score < 40
                  ? 'bg-red-500'
                  : report.score <= 70
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
              )}
              style={{ width: `${report.score}%` }}
            />
          </div>
          <p className="text-xs text-surface-500 mt-2">{report.summary}</p>
        </div>
      )}

      {/* Objective Alignment Matrix */}
      {totalObjectives > 0 && (
        <div className="bg-white rounded-lg border border-surface-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-surface-200">
            <h3 className="text-sm font-semibold text-surface-800">Objective Alignment Matrix</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-surface-50">
                  <th className="text-left font-medium text-surface-500 px-4 py-2.5 w-[40%]">Objective</th>
                  <th className="text-left font-medium text-surface-500 px-4 py-2.5">Bloom&apos;s</th>
                  <th className="text-center font-medium text-surface-500 px-4 py-2.5">Assessment</th>
                  <th className="text-center font-medium text-surface-500 px-4 py-2.5">Content</th>
                  <th className="text-left font-medium text-surface-500 px-4 py-2.5">Location</th>
                </tr>
              </thead>
              <tbody>
                {allObjectives.map((obj) => {
                  const hasContent = objectiveHasContent(obj.id, designDocs);
                  return (
                    <tr key={obj.id} className="border-t border-surface-100 hover:bg-surface-50 transition-colors">
                      <td className="px-4 py-2.5 text-surface-700">
                        <span className="line-clamp-2">{obj.text}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-surface-100 text-surface-600">
                          {bloomLabel(obj.bloomLevel)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {obj.assessmentAligned ? (
                          <svg className="w-4 h-4 text-green-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {hasContent ? (
                          <svg className="w-4 h-4 text-green-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-surface-500">
                        <span className="truncate block max-w-[200px]">
                          {obj.lessonTitle
                            ? `${obj.moduleTitle} > ${obj.lessonTitle}`
                            : obj.moduleTitle}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Findings List */}
      {findings.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-surface-800">
            Findings ({unresolvedFindings.length} unresolved)
          </h3>
          {unresolvedFindings.map((finding) => (
            <FindingCard
              key={finding.id}
              finding={finding}
              onResolve={() => resolveQAFinding(projectId, 'alignment', finding.id)}
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

      {/* No findings and no report */}
      {!report && findings.length === 0 && (
        <div className="bg-surface-50 border border-surface-200 rounded-lg p-6 text-center">
          <p className="text-sm text-surface-500">
            Click &quot;Run Analysis&quot; to check alignment between objectives, assessments, and content.
          </p>
        </div>
      )}
    </div>
  );
}
