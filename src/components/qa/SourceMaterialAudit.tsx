'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import {
  QAToolType,
  QAFinding,
  QASeverity,
  Material,
} from '@/lib/types';
import { cn, generateId, formatRelativeTime, formatFileSize } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface SourceMaterialAuditProps {
  projectId: string;
}

const TOOL: QAToolType = 'source-material';

const SEVERITY_COLORS: Record<QASeverity, string> = {
  critical: 'bg-red-100 text-red-800',
  warning: 'bg-amber-100 text-amber-800',
  info: 'bg-blue-100 text-blue-800',
  pass: 'bg-green-100 text-green-800',
};

const TYPE_COLORS: Record<string, string> = {
  pdf: 'bg-red-50 text-red-700',
  docx: 'bg-blue-50 text-blue-700',
  pptx: 'bg-orange-50 text-orange-700',
  xlsx: 'bg-green-50 text-green-700',
  video: 'bg-purple-50 text-purple-700',
  audio: 'bg-pink-50 text-pink-700',
  image: 'bg-cyan-50 text-cyan-700',
  url: 'bg-indigo-50 text-indigo-700',
  txt: 'bg-surface-100 text-surface-700',
  md: 'bg-surface-100 text-surface-700',
  other: 'bg-surface-100 text-surface-700',
};

const CATEGORY_COLORS: Record<string, string> = {
  'sme-content': 'bg-brand-50 text-brand-700',
  'existing-course': 'bg-amber-50 text-amber-700',
  reference: 'bg-green-50 text-green-700',
  'media-asset': 'bg-purple-50 text-purple-700',
  template: 'bg-cyan-50 text-cyan-700',
  other: 'bg-surface-100 text-surface-700',
};

const CATEGORY_LABELS: Record<string, string> = {
  'sme-content': 'SME Content',
  'existing-course': 'Existing Course',
  reference: 'Reference',
  'media-asset': 'Media Asset',
  template: 'Template',
  other: 'Other',
};

type UsageStatus = 'used' | 'partial' | 'unused';

interface MaterialUsage {
  material: Material;
  status: UsageStatus;
  locations: string[];
  conceptsCovered: number;
  conceptsTotal: number;
  coveredConcepts: string[];
  uncoveredConcepts: string[];
  contentGaps: string[];
  needsAnalysis: boolean;
}

export default function SourceMaterialAudit({ projectId }: SourceMaterialAuditProps) {
  const materials = useAppStore((s) => s.materials);
  const getCourseOutline = useAppStore((s) => s.getCourseOutline);
  const getDesignDocs = useAppStore((s) => s.getDesignDocs);
  const getAnalysisWizard = useAppStore((s) => s.getAnalysisWizard);
  const getQAReport = useAppStore((s) => s.getQAReport);
  const saveQAReport = useAppStore((s) => s.saveQAReport);
  const resolveQAFinding = useAppStore((s) => s.resolveQAFinding);

  const outline = getCourseOutline(projectId);
  const designDocs = getDesignDocs(projectId);
  const wizard = getAnalysisWizard(projectId);
  const report = getQAReport(projectId, TOOL);

  const projectMaterials = useMemo(
    () => materials.filter((m) => m.projectIds.includes(projectId)),
    [materials, projectId]
  );

  const [running, setRunning] = useState(false);

  const runAnalysis = useCallback(() => {
    setRunning(true);
    const findings: QAFinding[] = [];
    const usageData: MaterialUsage[] = [];

    // Collect all references from outline
    const outlineRefs = new Set<string>();
    if (outline) {
      for (const mod of outline.modules) {
        for (const ref of mod.materialRefs) outlineRefs.add(ref);
        for (const lesson of mod.lessons) {
          for (const ref of lesson.materialRefs) outlineRefs.add(ref);
        }
      }
    }

    // Collect all references from design docs
    const designDocRefs = new Set<string>();
    for (const doc of designDocs) {
      for (const slide of doc.slides) {
        for (const ref of slide.designNotes.materialRefs) designDocRefs.add(ref);
      }
    }

    // Collect all references from analysis report
    const analysisRefs = new Set<string>();
    if (wizard.report) {
      for (const ref of wizard.report.materialReferences) analysisRefs.add(ref);
    }

    // Collect all objective texts and descriptions from outline for concept matching
    const courseTexts: string[] = [];
    if (outline) {
      courseTexts.push(outline.courseGoal.toLowerCase());
      for (const mod of outline.modules) {
        courseTexts.push(mod.title.toLowerCase());
        courseTexts.push(mod.description.toLowerCase());
        for (const obj of mod.objectives) {
          courseTexts.push(obj.text.toLowerCase());
        }
        for (const lesson of mod.lessons) {
          courseTexts.push(lesson.title.toLowerCase());
          courseTexts.push(lesson.description.toLowerCase());
        }
      }
    }
    const courseTextJoined = courseTexts.join(' ');

    let usedCount = 0;
    let totalConcepts = 0;
    let coveredConceptCount = 0;

    for (const mat of projectMaterials) {
      const locations: string[] = [];
      const inOutline = outlineRefs.has(mat.id);
      const inDesignDocs = designDocRefs.has(mat.id);
      const inAnalysis = analysisRefs.has(mat.id);

      if (inOutline) locations.push('Outline');
      if (inDesignDocs) locations.push('Design Docs');
      if (inAnalysis) locations.push('Analysis');

      // Check if material's suggested objectives map to actual objectives
      let objectivesIncorporated = false;
      if (mat.analysis?.suggestedObjectives && outline) {
        const allObjTexts = outline.modules.flatMap((m) => m.objectives.map((o) => o.text.toLowerCase()));
        objectivesIncorporated = mat.analysis.suggestedObjectives.some((sug) =>
          allObjTexts.some((ot) => {
            const sugWords = sug.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
            return sugWords.filter((w) => ot.includes(w)).length >= 2;
          })
        );
        if (objectivesIncorporated) locations.push('Objectives');
      }

      // Concept coverage
      const keyConcepts = mat.analysis?.keyConcepts || [];
      const covered: string[] = [];
      const uncovered: string[] = [];
      for (const concept of keyConcepts) {
        if (courseTextJoined.includes(concept.toLowerCase())) {
          covered.push(concept);
        } else {
          uncovered.push(concept);
        }
      }
      totalConcepts += keyConcepts.length;
      coveredConceptCount += covered.length;

      const isUsed = locations.length > 0;
      if (isUsed) usedCount++;

      const status: UsageStatus = isUsed ? (uncovered.length > 0 && keyConcepts.length > 0 ? 'partial' : 'used') : 'unused';
      const contentGaps = mat.analysis?.contentGaps || [];

      usageData.push({
        material: mat,
        status,
        locations,
        conceptsCovered: covered.length,
        conceptsTotal: keyConcepts.length,
        coveredConcepts: covered,
        uncoveredConcepts: uncovered,
        contentGaps,
        needsAnalysis: !mat.analysis,
      });

      // Generate findings
      if (!isUsed) {
        findings.push({
          id: generateId(),
          tool: TOOL,
          severity: 'warning',
          title: 'Unused material',
          description: `"${mat.name}" is not referenced in the outline, design documents, or analysis.`,
          location: `Material: ${mat.name}`,
          suggestion: mat.analysis?.keyConcepts
            ? `Consider incorporating key concepts: ${mat.analysis.keyConcepts.slice(0, 3).join(', ')}`
            : 'Review this material and decide whether to incorporate or remove it.',
          resolved: false,
        });
      }

      if (isUsed && !mat.analysis) {
        findings.push({
          id: generateId(),
          tool: TOOL,
          severity: 'info',
          title: 'Referenced material not analyzed',
          description: `"${mat.name}" is used but has not been analyzed for key concepts and structure.`,
          location: `Material: ${mat.name}`,
          suggestion: 'Run material analysis to extract key concepts, glossary terms, and suggested objectives.',
          resolved: false,
        });
      }

      // Uncovered concepts
      for (const concept of uncovered) {
        findings.push({
          id: generateId(),
          tool: TOOL,
          severity: 'warning',
          title: 'Uncovered concept from source material',
          description: `Key concept "${concept}" from "${mat.name}" does not appear in the course outline.`,
          location: `Material: ${mat.name}`,
          suggestion: `Consider adding "${concept}" to relevant module objectives or lesson descriptions.`,
          resolved: false,
        });
      }

      // Content gaps
      if (contentGaps.length > 0 && isUsed) {
        findings.push({
          id: generateId(),
          tool: TOOL,
          severity: 'info',
          title: 'Known gaps in source material',
          description: `"${mat.name}" has identified content gaps: ${contentGaps.join('; ')}`,
          location: `Material: ${mat.name}`,
          suggestion: 'Address these gaps with supplementary materials or additional content creation.',
          resolved: false,
        });
      }
    }

    // Material gaps from needs analysis
    if (wizard.report?.materialGaps) {
      for (const gap of wizard.report.materialGaps) {
        findings.push({
          id: generateId(),
          tool: TOOL,
          severity: 'critical',
          title: 'Missing material identified in analysis',
          description: `Needs analysis identified a required material that is not yet uploaded: "${gap}"`,
          location: 'Needs Analysis Report',
          suggestion: `Upload or create content for: "${gap}"`,
          resolved: false,
        });
      }
    }

    // Calculate score
    const usageRatio = projectMaterials.length > 0 ? usedCount / projectMaterials.length : 1;
    const conceptRatio = totalConcepts > 0 ? coveredConceptCount / totalConcepts : 1;
    const score = Math.round((usageRatio * 0.6 + conceptRatio * 0.4) * 100);

    const summary =
      findings.length === 0
        ? 'All materials are referenced and concepts are covered in the course.'
        : `${usedCount} of ${projectMaterials.length} materials used. ${coveredConceptCount} of ${totalConcepts} key concepts covered.`;

    saveQAReport({ projectId, tool: TOOL, score, findings, summary });
    setRunning(false);
  }, [projectMaterials, outline, designDocs, wizard, projectId, saveQAReport]);

  // Compute usage data for display from report
  const usageDisplayData = useMemo<MaterialUsage[]>(() => {
    if (!report) return [];

    const outlineRefs = new Set<string>();
    if (outline) {
      for (const mod of outline.modules) {
        for (const ref of mod.materialRefs) outlineRefs.add(ref);
        for (const lesson of mod.lessons) {
          for (const ref of lesson.materialRefs) outlineRefs.add(ref);
        }
      }
    }
    const designDocRefs = new Set<string>();
    for (const doc of designDocs) {
      for (const slide of doc.slides) {
        for (const ref of slide.designNotes.materialRefs) designDocRefs.add(ref);
      }
    }
    const analysisRefs = new Set<string>();
    if (wizard.report) {
      for (const ref of wizard.report.materialReferences) analysisRefs.add(ref);
    }

    const courseTexts: string[] = [];
    if (outline) {
      courseTexts.push(outline.courseGoal.toLowerCase());
      for (const mod of outline.modules) {
        courseTexts.push(mod.title.toLowerCase(), mod.description.toLowerCase());
        for (const obj of mod.objectives) courseTexts.push(obj.text.toLowerCase());
        for (const lesson of mod.lessons) courseTexts.push(lesson.title.toLowerCase(), lesson.description.toLowerCase());
      }
    }
    const courseTextJoined = courseTexts.join(' ');

    return projectMaterials.map((mat) => {
      const locations: string[] = [];
      if (outlineRefs.has(mat.id)) locations.push('Outline');
      if (designDocRefs.has(mat.id)) locations.push('Design Docs');
      if (analysisRefs.has(mat.id)) locations.push('Analysis');

      const keyConcepts = mat.analysis?.keyConcepts || [];
      const covered: string[] = [];
      const uncovered: string[] = [];
      for (const concept of keyConcepts) {
        if (courseTextJoined.includes(concept.toLowerCase())) covered.push(concept);
        else uncovered.push(concept);
      }

      const isUsed = locations.length > 0;
      const status: UsageStatus = isUsed ? (uncovered.length > 0 && keyConcepts.length > 0 ? 'partial' : 'used') : 'unused';

      return {
        material: mat,
        status,
        locations,
        conceptsCovered: covered.length,
        conceptsTotal: keyConcepts.length,
        coveredConcepts: covered,
        uncoveredConcepts: uncovered,
        contentGaps: mat.analysis?.contentGaps || [],
        needsAnalysis: !mat.analysis,
      };
    });
  }, [report, projectMaterials, outline, designDocs, wizard]);

  const usedMaterials = usageDisplayData.filter((u) => u.status !== 'unused');
  const unusedMaterials = usageDisplayData.filter((u) => u.status === 'unused');
  const materialGaps = wizard.report?.materialGaps || [];

  const STATUS_INDICATOR: Record<UsageStatus, { color: string; label: string }> = {
    used: { color: 'bg-green-500', label: 'Used' },
    partial: { color: 'bg-amber-500', label: 'Partial' },
    unused: { color: 'bg-red-500', label: 'Unused' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-surface-200 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-surface-900 mb-1">Source Material Audit</h2>
        <p className="text-sm text-surface-600">
          Track which materials are used, identify coverage gaps, and find missing content.
        </p>
      </div>

      <Button onClick={runAnalysis} loading={running} disabled={projectMaterials.length === 0}>
        Run Audit
      </Button>
      {projectMaterials.length === 0 && (
        <p className="text-xs text-surface-500">No materials associated with this project.</p>
      )}

      {report && (
        <>
          {/* Summary stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-surface-200 rounded-xl p-5 text-center">
              <p className="text-3xl font-bold text-surface-900">{projectMaterials.length}</p>
              <p className="text-xs text-surface-500 mt-1">Total Materials</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
              <p className="text-3xl font-bold text-green-700">{usedMaterials.length}</p>
              <p className="text-xs text-green-600 mt-1">
                Used ({projectMaterials.length > 0 ? Math.round((usedMaterials.length / projectMaterials.length) * 100) : 0}%)
              </p>
            </div>
            <div className={cn(
              'border rounded-xl p-5 text-center',
              unusedMaterials.length > 0 ? 'bg-red-50 border-red-200' : 'bg-surface-50 border-surface-200'
            )}>
              <p className={cn('text-3xl font-bold', unusedMaterials.length > 0 ? 'text-red-700' : 'text-surface-400')}>
                {unusedMaterials.length}
              </p>
              <p className={cn('text-xs mt-1', unusedMaterials.length > 0 ? 'text-red-600' : 'text-surface-500')}>
                Unused
              </p>
            </div>
          </div>

          {/* Score banner */}
          <div className={cn(
            'rounded-xl p-4 flex items-center gap-4 border',
            report.score >= 80 ? 'bg-green-50 border-green-200' : report.score >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
          )}>
            <div className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white',
              report.score >= 80 ? 'bg-green-500' : report.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
            )}>
              {report.score}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-surface-900">Material Utilization Score</h3>
              <p className="text-xs text-surface-600 mt-0.5">{report.summary}</p>
            </div>
          </div>

          {/* Material inventory table */}
          {usageDisplayData.length > 0 && (
            <div className="bg-white border border-surface-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-surface-200">
                <h3 className="text-sm font-semibold text-surface-900">Material Inventory</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-200 bg-surface-50">
                      <th className="text-left py-2.5 px-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Material</th>
                      <th className="text-left py-2.5 px-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Type</th>
                      <th className="text-left py-2.5 px-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Category</th>
                      <th className="text-left py-2.5 px-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Usage</th>
                      <th className="text-left py-2.5 px-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Concepts</th>
                      <th className="text-left py-2.5 px-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usageDisplayData.map((usage) => (
                      <tr key={usage.material.id} className="border-b border-surface-100 last:border-0 hover:bg-surface-50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-surface-800 truncate max-w-[200px]">{usage.material.name}</p>
                          <p className="text-[10px] text-surface-400 mt-0.5">{formatFileSize(usage.material.size)}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase', TYPE_COLORS[usage.material.type] || TYPE_COLORS.other)}>
                            {usage.material.type}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium', CATEGORY_COLORS[usage.material.category] || CATEGORY_COLORS.other)}>
                            {CATEGORY_LABELS[usage.material.category] || usage.material.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {usage.locations.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {usage.locations.map((loc) => (
                                <span key={loc} className="px-1.5 py-0.5 bg-brand-50 text-brand-700 rounded text-[10px] font-medium">
                                  {loc}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-surface-400 italic">Not referenced</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {usage.conceptsTotal > 0 ? (
                            <span className={cn(
                              'text-xs font-medium',
                              usage.conceptsCovered === usage.conceptsTotal ? 'text-green-600' : 'text-amber-600'
                            )}>
                              {usage.conceptsCovered}/{usage.conceptsTotal}
                            </span>
                          ) : (
                            <span className="text-xs text-surface-400">--</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <div className={cn('w-2.5 h-2.5 rounded-full', STATUS_INDICATOR[usage.status].color)} />
                            <span className="text-xs text-surface-600">{STATUS_INDICATOR[usage.status].label}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Concept coverage map */}
          {usageDisplayData.some((u) => u.conceptsTotal > 0) && (
            <div className="bg-white border border-surface-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-surface-900 mb-4">Concept Coverage Map</h3>
              <div className="space-y-4">
                {usageDisplayData
                  .filter((u) => u.conceptsTotal > 0)
                  .map((usage) => (
                    <div key={usage.material.id} className="border border-surface-100 rounded-lg p-3">
                      <p className="text-xs font-semibold text-surface-700 mb-2">{usage.material.name}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {usage.coveredConcepts.map((concept) => (
                          <span key={concept} className="px-2 py-1 rounded-full text-[11px] font-medium bg-green-100 text-green-800">
                            {concept}
                          </span>
                        ))}
                        {usage.uncoveredConcepts.map((concept) => (
                          <span key={concept} className="px-2 py-1 rounded-full text-[11px] font-medium bg-red-100 text-red-800">
                            {concept}
                          </span>
                        ))}
                      </div>
                      {usage.coveredConcepts.length > 0 && usage.uncoveredConcepts.length > 0 && (
                        <p className="text-[10px] text-surface-400 mt-2">
                          Green = covered in course | Red = not yet covered
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Unused materials panel */}
          {unusedMaterials.length > 0 && (
            <div className="bg-white border border-surface-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-surface-900 mb-4">
                Unused Materials ({unusedMaterials.length})
              </h3>
              <div className="space-y-3">
                {unusedMaterials.map((usage) => (
                  <div key={usage.material.id} className="border border-amber-200 bg-amber-50 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-surface-800">{usage.material.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase', TYPE_COLORS[usage.material.type] || TYPE_COLORS.other)}>
                            {usage.material.type}
                          </span>
                          <span className="text-[10px] text-surface-400">{formatFileSize(usage.material.size)}</span>
                        </div>
                        {usage.material.analysis?.keyConcepts && usage.material.analysis.keyConcepts.length > 0 && (
                          <p className="text-xs text-amber-800 mt-2">
                            Consider incorporating: {usage.material.analysis.keyConcepts.slice(0, 3).join(', ')}
                          </p>
                        )}
                        {!usage.material.analysis && (
                          <p className="text-xs text-amber-700 mt-2 italic">
                            This material has not been analyzed. Run analysis to discover usable content.
                          </p>
                        )}
                      </div>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400 shrink-0 mt-1">
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing materials panel */}
          {materialGaps.length > 0 && (
            <div className="bg-white border border-surface-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-surface-900 mb-4">
                Missing Materials ({materialGaps.length})
              </h3>
              <p className="text-xs text-surface-500 mb-3">
                These materials were identified as needed in the needs analysis but have not been uploaded.
              </p>
              <div className="space-y-2">
                {materialGaps.map((gap, idx) => (
                  <div key={idx} className="border border-red-200 bg-red-50 rounded-lg p-4 flex items-start gap-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 shrink-0 mt-0.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-red-900">{gap}</p>
                      <p className="text-xs text-red-700 mt-0.5">Upload or create this content to fill the identified gap.</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Findings list with resolve buttons */}
          {report.findings.length > 0 && (
            <div className="bg-white border border-surface-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-surface-900 mb-4">
                All Findings ({report.findings.filter((f) => !f.resolved).length} unresolved)
              </h3>
              <div className="space-y-2">
                {report.findings.map((finding) => (
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
            </div>
          )}

          {/* All clear state */}
          {report.findings.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 text-green-500">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <h3 className="text-lg font-semibold text-green-900 mb-1">All Materials Accounted For</h3>
              <p className="text-sm text-green-700">All source materials are referenced and key concepts are covered.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
