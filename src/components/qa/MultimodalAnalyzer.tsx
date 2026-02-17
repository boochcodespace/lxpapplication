'use client';

import React, { useState, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import {
  QAFinding,
  QASeverity,
  VARKModality,
  VARK_MODALITIES,
  CourseModule,
  DesignDocument,
} from '@/lib/types';
import { cn, generateId } from '@/lib/utils';
import Button from '@/components/ui/Button';

// ── VARK color helpers ──

const varkColors: Record<VARKModality, { bg: string; fill: string; text: string; light: string; dot: string }> = {
  visual:      { bg: 'bg-blue-100',   fill: 'bg-blue-500',   text: 'text-blue-700',   light: 'bg-blue-50',   dot: 'bg-blue-500' },
  auditory:    { bg: 'bg-purple-100', fill: 'bg-purple-500', text: 'text-purple-700', light: 'bg-purple-50', dot: 'bg-purple-500' },
  readWrite:   { bg: 'bg-green-100',  fill: 'bg-green-500',  text: 'text-green-700',  light: 'bg-green-50',  dot: 'bg-green-500' },
  kinesthetic: { bg: 'bg-orange-100', fill: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-50', dot: 'bg-orange-500' },
};

// ── VARK inline SVG icons ──

function VARKIcon({ modality, className }: { modality: VARKModality; className?: string }) {
  const cls = cn('w-5 h-5', className);
  switch (modality) {
    case 'visual':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case 'auditory':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
        </svg>
      );
    case 'readWrite':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      );
    case 'kinesthetic':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3.006c-.927.856-1.5 2.07-1.5 3.42 0 2.552 2.089 4.625 4.65 4.625h4.2c2.561 0 4.65-2.073 4.65-4.625 0-1.35-.573-2.564-1.5-3.42V4.575a1.575 1.575 0 00-3.15 0v1.578A4.569 4.569 0 0012.6 5.78V4.575a1.575 1.575 0 10-3.15 0v1.205a4.57 4.57 0 00-.6.372V4.575zM8.55 18.375v1.875a.75.75 0 001.5 0v-1.875m3.75 0v1.875a.75.75 0 001.5 0v-1.875" />
        </svg>
      );
  }
}

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

// ── VARK overview card ──

function VARKOverviewCard({
  modality,
  coverage,
  moduleCount,
  totalModules,
}: {
  modality: (typeof VARK_MODALITIES)[number];
  coverage: number;
  moduleCount: number;
  totalModules: number;
}) {
  const colors = varkColors[modality.key];
  return (
    <div className={cn('rounded-lg border border-surface-200 p-4', colors.light)}>
      <div className="flex items-center gap-2 mb-2">
        <VARKIcon modality={modality.key} className={colors.text} />
        <span className={cn('text-sm font-semibold', colors.text)}>{modality.label}</span>
      </div>
      <div className="space-y-2">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-surface-500">Coverage</span>
            <span className={cn('text-sm font-bold', colors.text)}>{coverage}%</span>
          </div>
          <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', colors.fill)}
              style={{ width: `${coverage}%` }}
            />
          </div>
        </div>
        <p className="text-xs text-surface-500">
          {moduleCount} of {totalModules} module{totalModules !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}

// ── Heatmap cell ──

function HeatmapCell({ present }: { present: boolean }) {
  return (
    <td className="px-3 py-2 text-center">
      <div
        className={cn(
          'w-6 h-6 rounded mx-auto flex items-center justify-center',
          present ? 'bg-green-500' : 'bg-red-100'
        )}
      >
        {present ? (
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </div>
    </td>
  );
}

// ── Compute module-level VARK from outline and design docs ──

interface ModuleVARK {
  moduleId: string;
  moduleTitle: string;
  modalities: Set<VARKModality>;
  lessonDetails: {
    lessonId: string;
    lessonTitle: string;
    modalities: Set<VARKModality>;
  }[];
}

function computeModuleVARK(modules: CourseModule[], designDocs: DesignDocument[]): ModuleVARK[] {
  const result: ModuleVARK[] = [];

  for (const mod of modules) {
    const modModalities = new Set<VARKModality>(mod.modalities);
    const lessonDetails: ModuleVARK['lessonDetails'] = [];

    for (const lesson of mod.lessons) {
      const lessonMods = new Set<VARKModality>(lesson.modalities);

      // Also check if lesson has activities (kinesthetic indicator)
      if (lesson.activities.length > 0 && !lessonMods.has('kinesthetic')) {
        lessonMods.add('kinesthetic');
      }

      // Merge into module-level
      lessonMods.forEach((m) => modModalities.add(m));

      lessonDetails.push({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        modalities: lessonMods,
      });
    }

    // Check design docs for this module
    const moduleDocs = designDocs.filter((d) => d.moduleId === mod.id);
    for (const doc of moduleDocs) {
      for (const slide of doc.slides) {
        if (slide.learnerView.visualDescription.trim()) modModalities.add('visual');
        if (slide.learnerView.audioScript.trim()) modModalities.add('auditory');
        if (slide.learnerView.bodyText.trim() || slide.learnerView.bulletPoints.length > 0) modModalities.add('readWrite');
        if (slide.learnerView.interactionDescription.trim()) modModalities.add('kinesthetic');
      }
    }

    result.push({
      moduleId: mod.id,
      moduleTitle: mod.title,
      modalities: modModalities,
      lessonDetails,
    });
  }

  return result;
}

// ── Main Component ──

interface MultimodalAnalyzerProps {
  projectId: string;
}

export default function MultimodalAnalyzer({ projectId }: MultimodalAnalyzerProps) {
  const getCourseOutline = useAppStore((s) => s.getCourseOutline);
  const getDesignDocs = useAppStore((s) => s.getDesignDocs);
  const saveQAReport = useAppStore((s) => s.saveQAReport);
  const getQAReport = useAppStore((s) => s.getQAReport);
  const resolveQAFinding = useAppStore((s) => s.resolveQAFinding);

  const outline = getCourseOutline(projectId);
  const designDocs = getDesignDocs(projectId);
  const existingReport = getQAReport(projectId, 'multimodal');

  const [isRunning, setIsRunning] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const toggleModule = useCallback((moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  }, []);

  // Compute VARK data
  const modules = outline?.modules || [];
  const moduleVARK = computeModuleVARK(modules, designDocs);
  const totalModules = modules.length;

  // Compute coverage per modality
  const modalityCoverage: Record<VARKModality, { count: number; pct: number }> = {
    visual:      { count: 0, pct: 0 },
    auditory:    { count: 0, pct: 0 },
    readWrite:   { count: 0, pct: 0 },
    kinesthetic: { count: 0, pct: 0 },
  };

  for (const mv of moduleVARK) {
    if (mv.modalities.has('visual')) modalityCoverage.visual.count++;
    if (mv.modalities.has('auditory')) modalityCoverage.auditory.count++;
    if (mv.modalities.has('readWrite')) modalityCoverage.readWrite.count++;
    if (mv.modalities.has('kinesthetic')) modalityCoverage.kinesthetic.count++;
  }

  for (const key of Object.keys(modalityCoverage) as VARKModality[]) {
    modalityCoverage[key].pct = totalModules > 0
      ? Math.round((modalityCoverage[key].count / totalModules) * 100)
      : 0;
  }

  // ── Run Analysis ──

  const runAnalysis = useCallback(() => {
    if (!outline) return;
    setIsRunning(true);

    const findings: QAFinding[] = [];
    const mvData = computeModuleVARK(outline.modules, designDocs);
    const numModules = outline.modules.length;

    if (numModules === 0) {
      findings.push({
        id: generateId(),
        tool: 'multimodal',
        severity: 'critical',
        title: 'No modules found',
        description: 'The course outline has no modules to analyze for multimodal coverage.',
        location: 'Course Outline',
        suggestion: 'Add modules and lessons to the course outline before running multimodal analysis.',
        resolved: false,
      });
      saveQAReport({ projectId, tool: 'multimodal', score: 0, findings, summary: 'No modules to analyze.' });
      setIsRunning(false);
      return;
    }

    // Per-module checks
    for (const mv of mvData) {
      const count = mv.modalities.size;

      if (count === 1) {
        const only = Array.from(mv.modalities)[0];
        const label = VARK_MODALITIES.find((v) => v.key === only)?.label || only;
        findings.push({
          id: generateId(),
          tool: 'multimodal',
          severity: 'critical',
          title: `Single-modality bias in "${mv.moduleTitle}"`,
          description: `This module only uses the ${label} modality. Research shows 66% of learners prefer multimodal approaches.`,
          location: mv.moduleTitle,
          suggestion: `Add at least 1-2 additional modalities. Consider adding ${getMissingSuggestions(mv.modalities)} elements.`,
          resolved: false,
        });
      } else if (count < 2 && count > 0) {
        findings.push({
          id: generateId(),
          tool: 'multimodal',
          severity: 'warning',
          title: `Insufficient modality coverage in "${mv.moduleTitle}"`,
          description: `This module uses fewer than 2 VARK modalities. Best practice is 2-3 modalities per learning experience.`,
          location: mv.moduleTitle,
          suggestion: `Add ${getMissingSuggestions(mv.modalities)} elements to create a more balanced learning experience.`,
          resolved: false,
        });
      } else if (count === 0) {
        findings.push({
          id: generateId(),
          tool: 'multimodal',
          severity: 'critical',
          title: `No modalities defined for "${mv.moduleTitle}"`,
          description: 'This module has no VARK modalities specified. Learners will not have defined engagement channels.',
          location: mv.moduleTitle,
          suggestion: 'Define visual, auditory, read/write, and kinesthetic elements for this module.',
          resolved: false,
        });
      }

      // Missing kinesthetic (no activities)
      if (!mv.modalities.has('kinesthetic')) {
        findings.push({
          id: generateId(),
          tool: 'multimodal',
          severity: 'warning',
          title: `No kinesthetic activities in "${mv.moduleTitle}"`,
          description: 'This module lacks hands-on activities, simulations, or interactive exercises. Kinesthetic engagement is critical for skill transfer.',
          location: mv.moduleTitle,
          suggestion: 'Add a practice exercise, simulation, role-play, or hands-on activity to engage kinesthetic learners.',
          resolved: false,
        });
      }

      // Missing visual
      if (!mv.modalities.has('visual')) {
        findings.push({
          id: generateId(),
          tool: 'multimodal',
          severity: 'info',
          title: `No visual elements in "${mv.moduleTitle}"`,
          description: 'This module does not include visual elements such as diagrams, charts, or demonstrations.',
          location: mv.moduleTitle,
          suggestion: 'Add flowcharts, infographics, diagrams, or video demonstrations to support visual learners.',
          resolved: false,
        });
      }
    }

    // Course-level: any modality with 0% coverage
    const coverageMap: Record<VARKModality, number> = { visual: 0, auditory: 0, readWrite: 0, kinesthetic: 0 };
    for (const mv of mvData) {
      if (mv.modalities.has('visual')) coverageMap.visual++;
      if (mv.modalities.has('auditory')) coverageMap.auditory++;
      if (mv.modalities.has('readWrite')) coverageMap.readWrite++;
      if (mv.modalities.has('kinesthetic')) coverageMap.kinesthetic++;
    }

    for (const vm of VARK_MODALITIES) {
      if (coverageMap[vm.key] === 0 && numModules > 0) {
        findings.push({
          id: generateId(),
          tool: 'multimodal',
          severity: 'critical',
          title: `${vm.label} modality has 0% coverage`,
          description: `No module in the entire course includes ${vm.label.toLowerCase()} elements. This modality is completely absent.`,
          location: 'Entire course',
          suggestion: `Add ${vm.label.toLowerCase()} elements to at least some modules to support learners who prefer this modality.`,
          resolved: false,
        });
      }
    }

    // Compute score: average modality count per module / 4 * 100
    const avgModalities = mvData.reduce((sum, mv) => sum + mv.modalities.size, 0) / numModules;
    const score = Math.min(100, Math.round((avgModalities / 4) * 100));

    const critCount = findings.filter((f) => f.severity === 'critical').length;
    const warnCount = findings.filter((f) => f.severity === 'warning').length;
    const summary = `Analyzed ${numModules} modules. Average modality coverage: ${avgModalities.toFixed(1)} of 4 VARK modalities per module. Score: ${score}/100. Found ${critCount} critical and ${warnCount} warning issues.`;

    saveQAReport({ projectId, tool: 'multimodal', score, findings, summary });
    setIsRunning(false);
  }, [outline, designDocs, projectId, saveQAReport]);

  // ── Empty state ──

  if (!outline) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-surface-700">Create a course outline first</p>
          <p className="text-xs text-surface-500 mt-1">
            The Multimodal Analyzer requires modules and lessons in the course outline.
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
          <h2 className="text-lg font-semibold text-surface-900">Multimodal Coverage Analyzer</h2>
          <p className="text-xs text-surface-500 mt-0.5">
            Check VARK modality distribution across course modules
          </p>
        </div>
        <Button variant="primary" size="sm" loading={isRunning} onClick={runAnalysis}>
          <svg className="w-4 h-4 -ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
          </svg>
          Run Analysis
        </Button>
      </div>

      {/* Score display */}
      {report && (
        <div className="bg-white rounded-lg border border-surface-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-surface-800">Multimodal Score</h3>
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

      {/* VARK Overview Cards */}
      <div className="grid grid-cols-4 gap-3">
        {VARK_MODALITIES.map((vm) => (
          <VARKOverviewCard
            key={vm.key}
            modality={vm}
            coverage={modalityCoverage[vm.key].pct}
            moduleCount={modalityCoverage[vm.key].count}
            totalModules={totalModules}
          />
        ))}
      </div>

      {/* Coverage Heatmap */}
      {totalModules > 0 && (
        <div className="bg-white rounded-lg border border-surface-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-surface-200">
            <h3 className="text-sm font-semibold text-surface-800">Coverage Heatmap</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-surface-50">
                  <th className="text-left font-medium text-surface-500 px-4 py-2.5 w-[40%]">Module</th>
                  {VARK_MODALITIES.map((vm) => (
                    <th key={vm.key} className="text-center font-medium px-3 py-2.5">
                      <div className="flex flex-col items-center gap-1">
                        <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white', varkColors[vm.key].fill)}>
                          {vm.short}
                        </div>
                        <span className="text-surface-500">{vm.label}</span>
                      </div>
                    </th>
                  ))}
                  <th className="text-center font-medium text-surface-500 px-3 py-2.5">Count</th>
                </tr>
              </thead>
              <tbody>
                {moduleVARK.map((mv) => {
                  const count = mv.modalities.size;
                  return (
                    <tr key={mv.moduleId} className="border-t border-surface-100 hover:bg-surface-50 transition-colors">
                      <td className="px-4 py-2.5 text-surface-700 font-medium">{mv.moduleTitle}</td>
                      {VARK_MODALITIES.map((vm) => (
                        <HeatmapCell key={vm.key} present={mv.modalities.has(vm.key)} />
                      ))}
                      <td className="px-3 py-2.5 text-center">
                        <span
                          className={cn(
                            'inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold',
                            count >= 3
                              ? 'bg-green-100 text-green-700'
                              : count === 2
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                          )}
                        >
                          {count}
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

      {/* Per-Module Detail (expandable) */}
      {moduleVARK.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-surface-800">Per-Module Detail</h3>
          {moduleVARK.map((mv) => {
            const isExpanded = expandedModules.has(mv.moduleId);
            const presentMods = Array.from(mv.modalities);
            const missingMods = VARK_MODALITIES.filter((vm) => !mv.modalities.has(vm.key));

            return (
              <div key={mv.moduleId} className="border border-surface-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleModule(mv.moduleId)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-surface-50 transition-colors text-left"
                >
                  <svg
                    className={cn('w-4 h-4 text-surface-400 transition-transform shrink-0', isExpanded && 'rotate-90')}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                  <span className="flex-1 text-sm font-medium text-surface-800 truncate">{mv.moduleTitle}</span>
                  <div className="flex items-center gap-1">
                    {VARK_MODALITIES.map((vm) => (
                      <div
                        key={vm.key}
                        className={cn(
                          'w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold',
                          mv.modalities.has(vm.key)
                            ? cn(varkColors[vm.key].fill, 'text-white')
                            : 'bg-surface-200 text-surface-400'
                        )}
                      >
                        {vm.short}
                      </div>
                    ))}
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 bg-surface-50 border-t border-surface-100 space-y-3">
                    {/* Present modalities */}
                    <div className="mt-3">
                      <p className="text-[11px] font-medium text-surface-500 mb-1.5">Present</p>
                      <div className="flex flex-wrap gap-2">
                        {presentMods.length > 0 ? presentMods.map((key) => {
                          const vm = VARK_MODALITIES.find((v) => v.key === key);
                          if (!vm) return null;
                          return (
                            <span key={key} className={cn('inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full font-medium', varkColors[key].bg, varkColors[key].text)}>
                              <VARKIcon modality={key} className="w-3.5 h-3.5" />
                              {vm.label}
                            </span>
                          );
                        }) : (
                          <span className="text-xs text-surface-400">None defined</span>
                        )}
                      </div>
                    </div>

                    {/* Missing modalities */}
                    {missingMods.length > 0 && (
                      <div>
                        <p className="text-[11px] font-medium text-surface-500 mb-1.5">Missing</p>
                        <div className="flex flex-wrap gap-2">
                          {missingMods.map((vm) => (
                            <span key={vm.key} className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full font-medium bg-red-50 text-red-600">
                              <VARKIcon modality={vm.key} className="w-3.5 h-3.5" />
                              {vm.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lesson-level breakdown */}
                    {mv.lessonDetails.length > 0 && (
                      <div>
                        <p className="text-[11px] font-medium text-surface-500 mb-1.5">Lessons</p>
                        <div className="space-y-1.5">
                          {mv.lessonDetails.map((ld) => (
                            <div key={ld.lessonId} className="flex items-center gap-2 text-xs">
                              <span className="text-surface-600 w-40 truncate shrink-0">{ld.lessonTitle}</span>
                              <div className="flex items-center gap-1">
                                {VARK_MODALITIES.map((vm) => (
                                  <div
                                    key={vm.key}
                                    className={cn(
                                      'w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold',
                                      ld.modalities.has(vm.key)
                                        ? cn(varkColors[vm.key].fill, 'text-white')
                                        : 'bg-surface-200 text-surface-400'
                                    )}
                                  >
                                    {vm.short}
                                  </div>
                                ))}
                              </div>
                              <span className="text-surface-400 text-[10px]">
                                {ld.modalities.size} of 4
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
              onResolve={() => resolveQAFinding(projectId, 'multimodal', finding.id)}
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
            Click &quot;Run Analysis&quot; to check VARK modality distribution across your course modules.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Helper: get missing modality suggestions ──

function getMissingSuggestions(present: Set<VARKModality>): string {
  const missing = VARK_MODALITIES.filter((vm) => !present.has(vm.key));
  if (missing.length === 0) return '';
  return missing.map((vm) => vm.label.toLowerCase()).join(', ');
}
