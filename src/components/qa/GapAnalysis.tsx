'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import {
  QAToolType,
  QAFinding,
  QASeverity,
  ADDIEPhase,
  ADDIE_PHASES,
} from '@/lib/types';
import { cn, generateId, formatRelativeTime } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface GapAnalysisProps {
  projectId: string;
}

const TOOL: QAToolType = 'gap-analysis';

const SEVERITY_COLORS: Record<QASeverity, string> = {
  critical: 'bg-red-100 text-red-800',
  warning: 'bg-amber-100 text-amber-800',
  info: 'bg-blue-100 text-blue-800',
  pass: 'bg-green-100 text-green-800',
};

const PHASE_COLORS: Record<ADDIEPhase, string> = {
  analysis: 'text-blue-600 bg-blue-100',
  design: 'text-purple-600 bg-purple-100',
  development: 'text-amber-600 bg-amber-100',
  implementation: 'text-green-600 bg-green-100',
  evaluation: 'text-rose-600 bg-rose-100',
};

const GAP_CATEGORIES = [
  { key: 'addie', label: 'ADDIE Phases' },
  { key: 'assessments', label: 'Assessments' },
  { key: 'content', label: 'Content Coverage' },
  { key: 'structural', label: 'Structural' },
] as const;

type GapCategory = (typeof GAP_CATEGORIES)[number]['key'];

function CircularProgress({ value, size = 120 }: { value: number; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 80 ? '#22c55e' : value >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-surface-900">{value}%</span>
        <span className="text-[10px] text-surface-500 uppercase tracking-wider">Complete</span>
      </div>
    </div>
  );
}

export default function GapAnalysis({ projectId }: GapAnalysisProps) {
  const getCourseOutline = useAppStore((s) => s.getCourseOutline);
  const getDesignDocs = useAppStore((s) => s.getDesignDocs);
  const getAnalysisWizard = useAppStore((s) => s.getAnalysisWizard);
  const getQAReport = useAppStore((s) => s.getQAReport);
  const saveQAReport = useAppStore((s) => s.saveQAReport);
  const resolveQAFinding = useAppStore((s) => s.resolveQAFinding);
  const projects = useAppStore((s) => s.projects);

  const outline = getCourseOutline(projectId);
  const designDocs = getDesignDocs(projectId);
  const wizard = getAnalysisWizard(projectId);
  const report = getQAReport(projectId, TOOL);
  const project = projects.find((p) => p.id === projectId);

  const [running, setRunning] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleSection = useCallback((key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const runAnalysis = useCallback(() => {
    setRunning(true);
    const findings: QAFinding[] = [];
    let completedItems = 0;
    let totalExpected = 0;

    const phaseCompleteness: Record<ADDIEPhase, { completed: number; total: number }> = {
      analysis: { completed: 0, total: 3 },
      design: { completed: 0, total: 3 },
      development: { completed: 0, total: 2 },
      implementation: { completed: 0, total: 1 },
      evaluation: { completed: 0, total: 1 },
    };

    // ── 1. ADDIE Phase Completeness ──

    // Analysis phase
    const hasReport = wizard.status === 'completed' && wizard.report;
    const hasLearnerProfile = hasReport && wizard.report?.learnerProfile;
    const hasConstraints = hasReport && wizard.report?.constraints;

    if (hasReport) { phaseCompleteness.analysis.completed++; completedItems++; }
    else {
      findings.push({
        id: generateId(), tool: TOOL, severity: 'critical',
        title: 'No needs analysis report',
        description: 'The Analysis phase is missing a completed needs analysis report.',
        location: 'Analysis Phase',
        suggestion: 'Complete the Needs Analysis Wizard to generate a comprehensive analysis report.',
        resolved: false,
      });
    }
    totalExpected++;

    if (hasLearnerProfile) { phaseCompleteness.analysis.completed++; completedItems++; }
    else {
      findings.push({
        id: generateId(), tool: TOOL, severity: 'warning',
        title: 'No learner profile defined',
        description: 'A learner profile helps tailor content to the target audience.',
        location: 'Analysis Phase',
        suggestion: 'Complete the audience analysis section in the Needs Analysis Wizard.',
        resolved: false,
      });
    }
    totalExpected++;

    if (hasConstraints) { phaseCompleteness.analysis.completed++; completedItems++; }
    else {
      findings.push({
        id: generateId(), tool: TOOL, severity: 'warning',
        title: 'Constraints not documented',
        description: 'Timeline, budget, and technology constraints are not documented.',
        location: 'Analysis Phase',
        suggestion: 'Document project constraints to guide design decisions.',
        resolved: false,
      });
    }
    totalExpected++;

    // Design phase
    const hasOutline = !!outline;
    const hasObjectives = outline ? outline.modules.some((m) => m.objectives.length > 0) : false;
    const hasAssessmentStrategy = outline ? outline.modules.some((m) => m.assessmentStrategy.trim()) : false;

    if (hasOutline) { phaseCompleteness.design.completed++; completedItems++; }
    else {
      findings.push({
        id: generateId(), tool: TOOL, severity: 'critical',
        title: 'No course outline',
        description: 'A course outline is required to structure the learning experience.',
        location: 'Design Phase',
        suggestion: 'Create a course outline using the Outline Builder.',
        resolved: false,
      });
    }
    totalExpected++;

    if (hasObjectives) { phaseCompleteness.design.completed++; completedItems++; }
    else {
      findings.push({
        id: generateId(), tool: TOOL, severity: 'critical',
        title: 'No learning objectives defined',
        description: 'Learning objectives are essential for alignment of content and assessments.',
        location: 'Design Phase',
        suggestion: 'Add learning objectives to each module using Bloom\'s Taxonomy.',
        resolved: false,
      });
    }
    totalExpected++;

    if (hasAssessmentStrategy) { phaseCompleteness.design.completed++; completedItems++; }
    else {
      findings.push({
        id: generateId(), tool: TOOL, severity: 'warning',
        title: 'No assessment strategy',
        description: 'Assessment strategy is not defined for any module.',
        location: 'Design Phase',
        suggestion: 'Define assessment strategies for each module in the outline.',
        resolved: false,
      });
    }
    totalExpected++;

    // Development phase
    const hasDesignDocs = designDocs.length > 0;
    const moduleCount = outline?.modules.length || 0;
    const modulesWithDocs = outline
      ? outline.modules.filter((m) => designDocs.some((d) => d.moduleId === m.id)).length
      : 0;
    const hasEnoughCoverage = moduleCount > 0 && modulesWithDocs >= moduleCount * 0.5;

    if (hasDesignDocs) { phaseCompleteness.development.completed++; completedItems++; }
    else {
      findings.push({
        id: generateId(), tool: TOOL, severity: 'critical',
        title: 'No design documents created',
        description: 'Design documents are required to develop actual course content.',
        location: 'Development Phase',
        suggestion: 'Generate design documents for each module using the Design Doc Generator.',
        resolved: false,
      });
    }
    totalExpected++;

    if (hasEnoughCoverage) { phaseCompleteness.development.completed++; completedItems++; }
    else if (hasDesignDocs) {
      findings.push({
        id: generateId(), tool: TOOL, severity: 'warning',
        title: 'Insufficient content coverage',
        description: `Only ${modulesWithDocs} of ${moduleCount} modules have design documents.`,
        location: 'Development Phase',
        suggestion: 'Create design documents for remaining modules to ensure full coverage.',
        resolved: false,
      });
    }
    totalExpected++;

    // Implementation phase
    const hasFacilitatorGuide = designDocs.some((d) => d.format === 'facilitator-guide');
    if (hasFacilitatorGuide) { phaseCompleteness.implementation.completed++; completedItems++; }
    else {
      findings.push({
        id: generateId(), tool: TOOL, severity: 'info',
        title: 'No facilitator guide',
        description: 'A facilitator guide helps instructors deliver the course effectively.',
        location: 'Implementation Phase',
        suggestion: 'Create a facilitator guide design document for instructor-led components.',
        resolved: false,
      });
    }
    totalExpected++;

    // Evaluation phase
    const hasSuccessMetrics = hasReport && wizard.report?.successMetrics && wizard.report.successMetrics.length > 0;
    if (hasSuccessMetrics) { phaseCompleteness.evaluation.completed++; completedItems++; }
    else {
      findings.push({
        id: generateId(), tool: TOOL, severity: 'info',
        title: 'No success metrics defined',
        description: 'Success metrics are needed to evaluate course effectiveness.',
        location: 'Evaluation Phase',
        suggestion: 'Define success metrics in the needs analysis or separately.',
        resolved: false,
      });
    }
    totalExpected++;

    // ── 2. Assessment Completeness ──
    if (outline) {
      for (const mod of outline.modules) {
        // Objectives without assessment alignment
        const unaligned = mod.objectives.filter((o) => !o.assessmentAligned);
        if (unaligned.length > 0) {
          findings.push({
            id: generateId(), tool: TOOL, severity: 'critical',
            title: `${unaligned.length} objective${unaligned.length > 1 ? 's' : ''} without assessments`,
            description: `Module "${mod.title}" has ${unaligned.length} learning objective${unaligned.length > 1 ? 's' : ''} not aligned to an assessment.`,
            location: `Module: ${mod.title}`,
            suggestion: 'Create or align assessments for each learning objective.',
            resolved: false,
          });
        }

        // Module without assessment strategy
        if (!mod.assessmentStrategy.trim()) {
          findings.push({
            id: generateId(), tool: TOOL, severity: 'warning',
            title: 'Module missing assessment strategy',
            description: `Module "${mod.title}" has no assessment strategy defined.`,
            location: `Module: ${mod.title}`,
            suggestion: 'Define formative and summative assessment approaches.',
            resolved: false,
          });
        }

        // Lessons without assessment type (no formative assessments)
        const lessonsNoAssessment = mod.lessons.filter((l) => !l.assessmentType);
        if (lessonsNoAssessment.length > 0 && mod.lessons.length > 0) {
          findings.push({
            id: generateId(), tool: TOOL, severity: 'warning',
            title: 'Lessons without formative assessment',
            description: `${lessonsNoAssessment.length} of ${mod.lessons.length} lessons in "${mod.title}" lack an assessment type.`,
            location: `Module: ${mod.title}`,
            suggestion: 'Add formative checks to lessons to verify understanding as learners progress.',
            resolved: false,
          });
        }
      }

      // Check for summative assessment at end
      const lastModule = outline.modules[outline.modules.length - 1];
      if (lastModule && !lastModule.assessmentStrategy.toLowerCase().includes('summative')) {
        findings.push({
          id: generateId(), tool: TOOL, severity: 'info',
          title: 'No summative assessment at course end',
          description: 'The final module does not explicitly mention a summative assessment.',
          location: `Module: ${lastModule.title}`,
          suggestion: 'Consider adding a summative assessment or capstone activity.',
          resolved: false,
        });
      }
    }

    // ── 3. Content Coverage ──
    if (outline) {
      for (const mod of outline.modules) {
        const modDocs = designDocs.filter((d) => d.moduleId === mod.id);
        if (modDocs.length === 0) {
          findings.push({
            id: generateId(), tool: TOOL, severity: 'critical',
            title: 'Module without design documents',
            description: `Module "${mod.title}" has no design documents developed.`,
            location: `Module: ${mod.title}`,
            suggestion: 'Create design documents to develop lesson content for this module.',
            resolved: false,
          });
        }

        for (const lesson of mod.lessons) {
          if (lesson.duration === 0) {
            findings.push({
              id: generateId(), tool: TOOL, severity: 'info',
              title: 'Lesson with zero duration',
              description: `Lesson "${lesson.title}" in "${mod.title}" has 0-minute duration.`,
              location: `Module: ${mod.title} > Lesson: ${lesson.title}`,
              suggestion: 'Set an estimated duration for accurate course planning.',
              resolved: false,
            });
          }
          if (lesson.activities.length === 0) {
            findings.push({
              id: generateId(), tool: TOOL, severity: 'warning',
              title: 'Lesson without activities',
              description: `Lesson "${lesson.title}" in "${mod.title}" has no activities defined.`,
              location: `Module: ${mod.title} > Lesson: ${lesson.title}`,
              suggestion: 'Add at least one learning activity to engage learners.',
              resolved: false,
            });
          }
        }
      }
    }

    // ── 4. Structural Gaps ──
    if (!outline || !outline.courseGoal.trim()) {
      findings.push({
        id: generateId(), tool: TOOL, severity: 'critical',
        title: 'No course goal set',
        description: 'A course goal provides direction for the entire learning experience.',
        location: 'Course Outline',
        suggestion: 'Define a clear course goal that describes the overall learning outcome.',
        resolved: false,
      });
    }

    if (outline && outline.modules.length < 3) {
      findings.push({
        id: generateId(), tool: TOOL, severity: 'info',
        title: 'Course has fewer than 3 modules',
        description: `The course has only ${outline.modules.length} module${outline.modules.length !== 1 ? 's' : ''}. Consider if more structure is needed.`,
        location: 'Course Outline',
        suggestion: 'Ensure the course structure adequately covers all required topics.',
        resolved: false,
      });
    }

    if (outline) {
      for (const mod of outline.modules) {
        if (mod.lessons.length < 2) {
          findings.push({
            id: generateId(), tool: TOOL, severity: 'info',
            title: 'Module with fewer than 2 lessons',
            description: `Module "${mod.title}" has only ${mod.lessons.length} lesson${mod.lessons.length !== 1 ? 's' : ''}.`,
            location: `Module: ${mod.title}`,
            suggestion: 'Consider breaking down the module into more granular lessons.',
            resolved: false,
          });
        }
        if (!mod.description.trim()) {
          findings.push({
            id: generateId(), tool: TOOL, severity: 'warning',
            title: 'Missing module description',
            description: `Module "${mod.title}" has no description.`,
            location: `Module: ${mod.title}`,
            suggestion: 'Add a description that explains what learners will gain from this module.',
            resolved: false,
          });
        }
        for (const lesson of mod.lessons) {
          if (!lesson.description.trim()) {
            findings.push({
              id: generateId(), tool: TOOL, severity: 'warning',
              title: 'Missing lesson description',
              description: `Lesson "${lesson.title}" in "${mod.title}" has no description.`,
              location: `Module: ${mod.title} > Lesson: ${lesson.title}`,
              suggestion: 'Add a description explaining the purpose and content of the lesson.',
              resolved: false,
            });
          }
        }
      }
    }

    // ── Calculate score ──
    const score = totalExpected > 0 ? Math.round((completedItems / totalExpected) * 100) : 0;

    const criticalCount = findings.filter((f) => f.severity === 'critical').length;
    const warningCount = findings.filter((f) => f.severity === 'warning').length;
    const infoCount = findings.filter((f) => f.severity === 'info').length;

    const summary =
      findings.length === 0
        ? 'All components are in place. The course structure is complete.'
        : `Found ${findings.length} gap${findings.length !== 1 ? 's' : ''}: ${criticalCount} critical, ${warningCount} warnings, ${infoCount} informational.`;

    saveQAReport({ projectId, tool: TOOL, score, findings, summary });
    setRunning(false);
  }, [outline, designDocs, wizard, projectId, saveQAReport]);

  // Group findings by category
  const groupedFindings = useMemo(() => {
    if (!report) return null;
    const groups: Record<GapCategory, QAFinding[]> = {
      addie: [],
      assessments: [],
      content: [],
      structural: [],
    };
    for (const f of report.findings) {
      const loc = f.location.toLowerCase();
      const title = f.title.toLowerCase();
      if (loc.includes('phase') || title.includes('needs analysis') || title.includes('facilitator') || title.includes('success metrics')) {
        groups.addie.push(f);
      } else if (title.includes('assessment') || title.includes('objective') || title.includes('summative') || title.includes('formative')) {
        groups.assessments.push(f);
      } else if (title.includes('design document') || title.includes('coverage') || title.includes('duration') || title.includes('activities') || title.includes('activity')) {
        groups.content.push(f);
      } else {
        groups.structural.push(f);
      }
    }
    return groups;
  }, [report]);

  // ADDIE phase completeness for display
  const phaseDisplay = useMemo(() => {
    if (!project) return [];
    return ADDIE_PHASES.map((phase) => ({
      ...phase,
      progress: project.phaseProgress[phase.key],
    }));
  }, [project]);

  const actionItems = useMemo(() => {
    if (!report) return [];
    const unresolvedFindings = report.findings.filter((f) => !f.resolved);
    const severityOrder: Record<QASeverity, number> = { critical: 0, warning: 1, info: 2, pass: 3 };
    return [...unresolvedFindings].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  }, [report]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-surface-200 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-surface-900 mb-1">Gap Analysis</h2>
        <p className="text-sm text-surface-600">
          Identifies missing components and checks completeness across all ADDIE phases.
        </p>
      </div>

      {/* Run analysis */}
      <Button onClick={runAnalysis} loading={running}>
        Run Analysis
      </Button>

      {report && (
        <>
          {/* Completeness dashboard */}
          <div className="bg-white border border-surface-200 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <CircularProgress value={report.score} />
              <div className="flex-1 w-full">
                <h3 className="text-sm font-semibold text-surface-900 mb-3">ADDIE Phase Progress</h3>
                <div className="grid grid-cols-5 gap-2">
                  {phaseDisplay.map((phase) => (
                    <div key={phase.key} className="text-center">
                      <div className={cn('inline-flex items-center justify-center w-10 h-10 rounded-full text-xs font-bold mb-1', PHASE_COLORS[phase.key])}>
                        {phase.progress}%
                      </div>
                      <p className="text-[10px] font-medium text-surface-600 truncate">{phase.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <p className="text-xs text-surface-600">{report.summary}</p>
                  <p className="text-[10px] text-surface-400 mt-1">Last run: {formatRelativeTime(report.runAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gap categories — collapsible sections */}
          {groupedFindings && (
            <div className="space-y-3">
              {GAP_CATEGORIES.map(({ key, label }) => {
                const items = groupedFindings[key];
                const isCollapsed = collapsed[key] ?? false;
                const criticalCount = items.filter((f) => f.severity === 'critical' && !f.resolved).length;
                const warningCount = items.filter((f) => f.severity === 'warning' && !f.resolved).length;

                return (
                  <div key={key} className="bg-white border border-surface-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection(key)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <svg
                          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          className={cn('text-surface-400 transition-transform', !isCollapsed && 'rotate-90')}
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                        <span className="text-sm font-semibold text-surface-800">{label}</span>
                        <span className="text-xs text-surface-500">({items.length} finding{items.length !== 1 ? 's' : ''})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {criticalCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                            {criticalCount} critical
                          </span>
                        )}
                        {warningCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            {warningCount} warning{warningCount !== 1 ? 's' : ''}
                          </span>
                        )}
                        {items.length === 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                            Clear
                          </span>
                        )}
                      </div>
                    </button>
                    {!isCollapsed && items.length > 0 && (
                      <div className="px-5 pb-4 space-y-2">
                        {items.map((finding) => (
                          <div key={finding.id} className={cn(
                            'border rounded-lg p-3',
                            finding.resolved ? 'bg-surface-50 border-surface-200 opacity-60' : 'bg-white border-surface-200'
                          )}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold uppercase', SEVERITY_COLORS[finding.severity])}>
                                    {finding.severity}
                                  </span>
                                  <span className="text-sm font-medium text-surface-800">{finding.title}</span>
                                </div>
                                <p className="text-xs text-surface-600 mb-1">{finding.description}</p>
                                <p className="text-[10px] text-surface-400 mb-1">{finding.location}</p>
                                <p className="text-xs text-brand-700 italic">{finding.suggestion}</p>
                              </div>
                              {!finding.resolved && (
                                <button
                                  onClick={() => resolveQAFinding(projectId, TOOL, finding.id)}
                                  className="shrink-0 px-2 py-1 text-[10px] font-medium bg-surface-100 text-surface-600 rounded hover:bg-surface-200 transition-colors"
                                >
                                  Mark Resolved
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Action items — prioritized list */}
          {actionItems.length > 0 && (
            <div className="bg-white border border-surface-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-surface-900 mb-4">
                Action Items ({actionItems.length})
              </h3>
              <p className="text-xs text-surface-500 mb-3">Prioritized by severity. Address critical items first.</p>
              <div className="space-y-2">
                {actionItems.slice(0, 10).map((item, idx) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 bg-surface-50 rounded-lg">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-surface-200 flex items-center justify-center text-xs font-bold text-surface-600">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold uppercase', SEVERITY_COLORS[item.severity])}>
                          {item.severity}
                        </span>
                        <span className="text-sm font-medium text-surface-800">{item.title}</span>
                      </div>
                      <p className="text-xs text-surface-600">{item.suggestion}</p>
                    </div>
                  </div>
                ))}
                {actionItems.length > 10 && (
                  <p className="text-xs text-surface-400 text-center pt-2">
                    ...and {actionItems.length - 10} more items
                  </p>
                )}
              </div>
            </div>
          )}

          {/* All clear state */}
          {report.findings.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 text-green-500">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <h3 className="text-lg font-semibold text-green-900 mb-1">No Gaps Found</h3>
              <p className="text-sm text-green-700">All components are in place. The course structure is complete.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
