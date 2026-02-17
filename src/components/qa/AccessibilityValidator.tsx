'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { cn, generateId, formatRelativeTime } from '@/lib/utils';
import type {
  QAFinding,
  QASeverity,
  DesignDocument,
  DesignDocSlide,
} from '@/lib/types';

interface AccessibilityValidatorProps {
  projectId: string;
}

type POURCategory = 'perceivable' | 'operable' | 'understandable' | 'robust';
type WCAGLevel = 'A' | 'AA' | 'AAA';

const POUR_LABELS: Record<POURCategory, string> = {
  perceivable: 'Perceivable',
  operable: 'Operable',
  understandable: 'Understandable',
  robust: 'Robust',
};

const POUR_DESCRIPTIONS: Record<POURCategory, string> = {
  perceivable: 'Information presented in ways all users can perceive',
  operable: 'Interface components users can operate',
  understandable: 'Information and interface operation is clear',
  robust: 'Content works with current and future technologies',
};

const POUR_COLORS: Record<POURCategory, { bg: string; text: string; border: string; light: string }> = {
  perceivable: { bg: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-200', light: 'bg-blue-50' },
  operable: { bg: 'bg-purple-500', text: 'text-purple-700', border: 'border-purple-200', light: 'bg-purple-50' },
  understandable: { bg: 'bg-teal-500', text: 'text-teal-700', border: 'border-teal-200', light: 'bg-teal-50' },
  robust: { bg: 'bg-indigo-500', text: 'text-indigo-700', border: 'border-indigo-200', light: 'bg-indigo-50' },
};

const SEVERITY_STYLES: Record<QASeverity, { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  warning: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  info: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  pass: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
};

const LEVEL_DEDUCTIONS: Record<WCAGLevel, number> = {
  A: 10,
  AA: 5,
  AAA: 2,
};

interface A11yFindingMeta {
  pour: POURCategory;
  wcag: WCAGLevel;
  slideId?: string;
}

interface SlideStatus {
  slide: DesignDocSlide;
  doc: DesignDocument;
  issues: number;
  hasAltText: boolean;
  hasCaptions: boolean;
  hasKeyboard: boolean;
  hasReadability: boolean;
}

function estimateReadability(text: string): { avgSentenceLength: number; complexRatio: number } {
  if (!text.trim()) return { avgSentenceLength: 0, complexRatio: 0 };
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : 0;
  const complexWords = words.filter((w) => w.length > 12);
  const complexRatio = words.length > 0 ? complexWords.length / words.length : 0;
  return { avgSentenceLength, complexRatio };
}

function hasColorOnlyInfo(text: string): boolean {
  const colorTerms = ['red', 'green', 'blue', 'yellow', 'orange', 'color-coded', 'highlighted in'];
  const alternativeTerms = ['icon', 'label', 'text', 'symbol', 'pattern', 'shape', 'underline'];
  const lower = text.toLowerCase();
  const mentionsColor = colorTerms.some((t) => lower.includes(t));
  const hasAlternative = alternativeTerms.some((t) => lower.includes(t));
  return mentionsColor && !hasAlternative;
}

export default function AccessibilityValidator({ projectId }: AccessibilityValidatorProps) {
  const getDesignDocs = useAppStore((s) => s.getDesignDocs);
  const getQAReport = useAppStore((s) => s.getQAReport);
  const saveQAReport = useAppStore((s) => s.saveQAReport);
  const resolveQAFinding = useAppStore((s) => s.resolveQAFinding);

  const [isRunning, setIsRunning] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [expandedSlides, setExpandedSlides] = useState<Set<string>>(new Set());

  const designDocs = getDesignDocs(projectId);
  const existingReport = getQAReport(projectId, 'accessibility');

  const toggleSlide = (id: string) => {
    setExpandedSlides((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const findingsMeta = useMemo<Map<string, A11yFindingMeta>>(() => new Map(), []);

  const runAnalysis = useCallback(() => {
    setIsRunning(true);
    const findings: QAFinding[] = [];
    findingsMeta.clear();

    const addFinding = (
      severity: QASeverity,
      title: string,
      description: string,
      location: string,
      suggestion: string,
      pour: POURCategory,
      wcag: WCAGLevel,
      slideId?: string
    ) => {
      const id = generateId();
      findings.push({
        id,
        tool: 'accessibility',
        severity,
        title,
        description,
        location,
        suggestion,
        resolved: false,
      });
      findingsMeta.set(id, { pour, wcag, slideId });
    };

    for (const doc of designDocs) {
      for (const slide of doc.slides) {
        const loc = `${doc.title} > Slide ${slide.slideNumber}: ${slide.title}`;
        const lv = slide.learnerView;
        const dn = slide.designNotes;

        // ── PERCEIVABLE ──

        // Alt text for visuals
        const hasVisual = lv.visualDescription?.trim().length > 0;
        const bodyMentionsVisual =
          /image|diagram|chart|graph|figure|illustration|photo|screenshot|infographic/i.test(
            lv.bodyText + ' ' + lv.bulletPoints.join(' ')
          );
        if ((bodyMentionsVisual || hasVisual) && !hasVisual) {
          addFinding(
            'critical',
            'Missing alt text for visual content',
            `Slide references visual content but no visual description (alt text) is provided.`,
            loc,
            'Add a descriptive visualDescription that conveys the meaning of the visual, not just its appearance.',
            'perceivable',
            'A',
            slide.id
          );
        }

        // Captions for audio
        const hasAudio = lv.audioScript?.trim().length > 0;
        const hasCaption =
          lv.accessibilityFeatures.some((f) =>
            /caption|transcript|subtitle/i.test(f)
          ) || /caption|transcript/i.test(dn.accessibilityNotes || '');
        if (hasAudio && !hasCaption) {
          addFinding(
            'critical',
            'Missing captions/transcript for audio',
            `Slide has audio script but no captions or transcript reference in accessibility features.`,
            loc,
            'Add "captions" or "transcript available" to accessibilityFeatures, and ensure captions are produced during development.',
            'perceivable',
            'A',
            slide.id
          );
        }

        // Color-only information
        const allText = `${lv.bodyText} ${lv.bulletPoints.join(' ')} ${lv.interactionDescription} ${lv.visualDescription}`;
        if (hasColorOnlyInfo(allText)) {
          addFinding(
            'warning',
            'Possible color-only information',
            `Content may use color as the sole means of conveying information without alternative indicators.`,
            loc,
            'Ensure color is supplemented with icons, labels, patterns, or text to convey the same information.',
            'perceivable',
            'AA',
            slide.id
          );
        }

        // ── OPERABLE ──

        // Keyboard accessibility
        const hasInteraction = lv.interactionDescription?.trim().length > 0;
        const hasKeyboardNote =
          lv.accessibilityFeatures.some((f) => /keyboard/i.test(f)) ||
          /keyboard/i.test(dn.accessibilityNotes || '');
        if (hasInteraction && !hasKeyboardNote) {
          addFinding(
            'warning',
            'No keyboard accessibility noted',
            `Slide has interactive elements but no keyboard accessibility considerations documented.`,
            loc,
            'Add keyboard navigation notes to accessibility features or design notes to ensure all interactions are keyboard-operable.',
            'operable',
            'AA',
            slide.id
          );
        }

        // Timing constraints
        const timingPattern = /time limit|timer|countdown|timed|seconds to|minutes to/i;
        if (timingPattern.test(lv.interactionDescription || '') || timingPattern.test(dn.interactivitySpec || '')) {
          const hasAdjustment = /extend|adjust|pause|disable timer|unlimited/i.test(
            `${lv.interactionDescription} ${dn.interactivitySpec} ${dn.accessibilityNotes || ''}`
          );
          if (!hasAdjustment) {
            addFinding(
              'info',
              'Timing constraint without adjustment option',
              `Slide has a timing constraint but no documented option for users to extend or adjust the time.`,
              loc,
              'Provide a mechanism for users to extend or disable time limits. WCAG 2.1.1 requires timing adjustability.',
              'operable',
              'AAA',
              slide.id
            );
          }
        }

        // Focus indicators
        if (hasInteraction) {
          const hasFocusNote =
            lv.accessibilityFeatures.some((f) => /focus/i.test(f)) ||
            /focus indicator|focus state|focus ring/i.test(dn.accessibilityNotes || '');
          if (!hasFocusNote) {
            addFinding(
              'info',
              'No focus indicator documented',
              `Interactive slide lacks documentation of visible focus indicators for keyboard users.`,
              loc,
              'Document that all interactive elements will have visible focus indicators during development.',
              'operable',
              'AAA',
              slide.id
            );
          }
        }

        // ── UNDERSTANDABLE ──

        // Readability check
        const readability = estimateReadability(lv.bodyText);
        if (readability.avgSentenceLength > 25) {
          addFinding(
            'warning',
            'Long average sentence length',
            `Average sentence length is ${Math.round(readability.avgSentenceLength)} words. Aim for 25 words or fewer for readability.`,
            loc,
            'Break long sentences into shorter, clearer statements. Use one idea per sentence.',
            'understandable',
            'AA',
            slide.id
          );
        }
        if (readability.complexRatio > 0.15) {
          addFinding(
            'info',
            'High proportion of complex words',
            `${Math.round(readability.complexRatio * 100)}% of words are complex (>12 characters). This may affect readability.`,
            loc,
            'Define technical terms on first use and consider simpler alternatives where possible.',
            'understandable',
            'AAA',
            slide.id
          );
        }

        // Heading hierarchy -- check across doc
        // (done at doc level below)

        // Clear labels for interactions
        if (hasInteraction) {
          const hasLabels = /label|instruction|prompt|direction/i.test(lv.interactionDescription || '');
          if (!hasLabels && lv.interactionDescription.length < 20) {
            addFinding(
              'info',
              'Interaction may lack clear instructions',
              `The interaction description is very brief and may not provide clear guidance to learners.`,
              loc,
              'Ensure interactive elements have clear labels, instructions, and error messages.',
              'understandable',
              'AAA',
              slide.id
            );
          }
        }

        // ── ROBUST ──

        // Semantic structure
        const hasSemanticNote =
          /semantic|aria|role|landmark|heading structure|html5/i.test(dn.accessibilityNotes || '') ||
          /semantic|aria|role/i.test(dn.developmentNotes || '');
        if (!hasSemanticNote && slide.slideNumber === 1) {
          // Check once per doc at slide 1
          addFinding(
            'info',
            'No semantic structure notes',
            `Design document "${doc.title}" lacks notes about semantic HTML structure or ARIA roles.`,
            doc.title,
            'Add development notes specifying semantic HTML elements, ARIA roles, and landmark regions for assistive technology.',
            'robust',
            'AAA'
          );
        }

        // Assistive technology
        const hasATNote =
          lv.accessibilityFeatures.some((f) =>
            /screen reader|assistive|at compatible|jaws|nvda|voiceover/i.test(f)
          ) || /screen reader|assistive tech/i.test(dn.accessibilityNotes || '');
        if (!hasATNote && slide.slideNumber === 1) {
          addFinding(
            'warning',
            'No assistive technology considerations',
            `Design document "${doc.title}" has no mentions of screen reader or assistive technology compatibility.`,
            doc.title,
            'Document screen reader behavior, ARIA labels, and test plans for assistive technology in accessibility notes.',
            'robust',
            'AA'
          );
        }
      }

      // Doc-level: heading hierarchy check
      const headings = doc.slides.map((s) => s.learnerView.heading?.trim() || '');
      const emptyHeadings = headings.filter((h) => h.length === 0);
      if (emptyHeadings.length > 0 && doc.slides.length > 1) {
        addFinding(
          'warning',
          'Inconsistent heading structure',
          `${emptyHeadings.length} of ${doc.slides.length} slides are missing headings, which breaks content hierarchy.`,
          doc.title,
          'Ensure every slide has a clear heading that follows proper hierarchy (H1, H2, H3).',
          'understandable',
          'AA'
        );
      }
    }

    // Score calculation
    let score = 100;
    findings.forEach((f) => {
      const meta = findingsMeta.get(f.id);
      if (meta) {
        score -= LEVEL_DEDUCTIONS[meta.wcag];
      }
    });
    score = Math.max(0, Math.min(100, score));

    const summary =
      score >= 85
        ? 'Accessibility compliance is strong. Minor issues may remain at AAA level.'
        : score >= 60
          ? 'Accessibility compliance is moderate. Several AA-level issues need attention before release.'
          : 'Accessibility compliance needs significant improvement. Critical A-level and AA-level violations were found.';

    saveQAReport({ projectId, tool: 'accessibility', score, findings, summary });
    setIsRunning(false);
  }, [designDocs, projectId, saveQAReport, findingsMeta]);

  // Compute POUR breakdown from existing report
  const pourBreakdown = useMemo(() => {
    const result: Record<POURCategory, { count: number; score: number }> = {
      perceivable: { count: 0, score: 100 },
      operable: { count: 0, score: 100 },
      understandable: { count: 0, score: 100 },
      robust: { count: 0, score: 100 },
    };
    if (!existingReport) return result;
    existingReport.findings.forEach((f) => {
      const meta = findingsMeta.get(f.id);
      if (meta && !f.resolved) {
        result[meta.pour].count++;
        result[meta.pour].score -= LEVEL_DEDUCTIONS[meta.wcag];
      }
    });
    Object.keys(result).forEach((k) => {
      const key = k as POURCategory;
      result[key].score = Math.max(0, Math.min(100, result[key].score));
    });
    return result;
  }, [existingReport, findingsMeta]);

  // Violation severity breakdown
  const violationCounts = useMemo(() => {
    const counts: Record<WCAGLevel, number> = { A: 0, AA: 0, AAA: 0 };
    if (!existingReport) return counts;
    existingReport.findings.forEach((f) => {
      if (f.resolved) return;
      const meta = findingsMeta.get(f.id);
      if (meta) counts[meta.wcag]++;
    });
    return counts;
  }, [existingReport, findingsMeta]);

  // Slide-level statuses
  const slideStatuses = useMemo<SlideStatus[]>(() => {
    const results: SlideStatus[] = [];
    for (const doc of designDocs) {
      for (const slide of doc.slides) {
        const lv = slide.learnerView;
        const hasAltText = lv.visualDescription?.trim().length > 0;
        const hasCaptions = lv.accessibilityFeatures.some((f) =>
          /caption|transcript/i.test(f)
        );
        const hasKeyboard = lv.accessibilityFeatures.some((f) => /keyboard/i.test(f));
        const readability = estimateReadability(lv.bodyText);
        const hasReadability = readability.avgSentenceLength <= 25;

        const issues = existingReport
          ? existingReport.findings.filter((f) => {
              const meta = findingsMeta.get(f.id);
              return meta?.slideId === slide.id && !f.resolved;
            }).length
          : 0;

        results.push({ slide, doc, issues, hasAltText, hasCaptions, hasKeyboard, hasReadability });
      }
    }
    return results;
  }, [designDocs, existingReport, findingsMeta]);

  // Generate downloadable report text
  const reportText = useMemo(() => {
    if (!existingReport) return '';
    const lines: string[] = [
      '=== ACCESSIBILITY COMPLIANCE REPORT ===',
      `Project: ${projectId}`,
      `Date: ${new Date(existingReport.runAt).toLocaleString()}`,
      `Overall Score: ${existingReport.score}/100`,
      `Summary: ${existingReport.summary}`,
      '',
      '--- VIOLATION BREAKDOWN ---',
      `Level A (Critical): ${violationCounts.A}`,
      `Level AA (Warning): ${violationCounts.AA}`,
      `Level AAA (Info): ${violationCounts.AAA}`,
      '',
      '--- POUR CATEGORY SCORES ---',
    ];
    (Object.keys(pourBreakdown) as POURCategory[]).forEach((cat) => {
      lines.push(
        `${POUR_LABELS[cat]}: ${pourBreakdown[cat].score}/100 (${pourBreakdown[cat].count} issues)`
      );
    });
    lines.push('', '--- DETAILED FINDINGS ---', '');
    existingReport.findings.forEach((f, i) => {
      const meta = findingsMeta.get(f.id);
      lines.push(
        `${i + 1}. [${f.severity.toUpperCase()}] ${f.title}${f.resolved ? ' (RESOLVED)' : ''}`,
        `   WCAG Level: ${meta?.wcag || 'N/A'} | Category: ${meta ? POUR_LABELS[meta.pour] : 'N/A'}`,
        `   Location: ${f.location}`,
        `   Description: ${f.description}`,
        `   Suggestion: ${f.suggestion}`,
        ''
      );
    });
    return lines.join('\n');
  }, [existingReport, violationCounts, pourBreakdown, findingsMeta, projectId]);

  // Empty state
  if (designDocs.length === 0) {
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
          <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>
        <h3 className="text-sm font-semibold text-surface-700 mb-1">No Design Documents Found</h3>
        <p className="text-xs text-surface-500 max-w-xs">
          Create design documents before running the accessibility validator.
        </p>
      </div>
    );
  }

  const unresolvedFindings = existingReport
    ? existingReport.findings.filter((f) => !f.resolved)
    : [];

  function scoreColor(score: number): string {
    if (score >= 85) return 'text-green-700';
    if (score >= 60) return 'text-amber-700';
    return 'text-red-700';
  }

  function ringStroke(score: number): string {
    if (score >= 85) return 'stroke-green-500';
    if (score >= 60) return 'stroke-amber-500';
    return 'stroke-red-500';
  }

  const overallScore = existingReport?.score ?? 0;
  const circumference = 2 * Math.PI * 42;
  const strokeDash = existingReport
    ? (overallScore / 100) * circumference
    : 0;

  return (
    <div className="space-y-6">
      {/* Header + Buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-surface-900">Accessibility Validator</h3>
          <p className="text-xs text-surface-500 mt-0.5">
            WCAG 2.0 Level AA compliance check across all design documents.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {existingReport && (
            <button
              onClick={() => setShowReport(!showReport)}
              className="px-3 py-2 text-sm font-medium rounded-lg border border-surface-200 text-surface-600 hover:bg-surface-50 transition-colors"
            >
              {showReport ? 'Hide Report' : 'Generate Accessibility Report'}
            </button>
          )}
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
      </div>

      {/* Overall Compliance Score -- ring indicator */}
      <div className="flex items-center gap-8 px-6 py-5 bg-surface-50 border border-surface-200 rounded-lg">
        <div className="relative w-28 h-28 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-surface-200"
            />
            {existingReport && (
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                className={ringStroke(overallScore)}
                strokeDasharray={`${strokeDash} ${circumference}`}
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn('text-2xl font-bold', existingReport ? scoreColor(overallScore) : 'text-surface-300')}>
              {existingReport ? overallScore : '--'}
            </span>
            <span className="text-[10px] text-surface-400">/ 100</span>
          </div>
        </div>
        <div className="flex-1">
          {existingReport ? (
            <>
              <p className="text-sm font-medium text-surface-800">{existingReport.summary}</p>
              <p className="text-xs text-surface-500 mt-1">
                {slideStatuses.length} slides analyzed across {designDocs.length} design doc{designDocs.length !== 1 ? 's' : ''}
                {' | '}Last run: {formatRelativeTime(existingReport.runAt)}
              </p>
            </>
          ) : (
            <p className="text-sm text-surface-500">
              Run analysis to check WCAG 2.0 Level AA compliance.
            </p>
          )}
        </div>
      </div>

      {/* POUR Breakdown */}
      {existingReport && (
        <div>
          <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">
            POUR Breakdown
          </h4>
          <div className="grid grid-cols-4 gap-3">
            {(Object.keys(POUR_LABELS) as POURCategory[]).map((cat) => {
              const data = pourBreakdown[cat];
              const colors = POUR_COLORS[cat];
              return (
                <div
                  key={cat}
                  className={cn('rounded-lg border p-4', colors.border, colors.light)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn('text-xs font-semibold', colors.text)}>
                      {POUR_LABELS[cat]}
                    </span>
                    <span
                      className={cn(
                        'text-lg font-bold',
                        data.score >= 85 ? 'text-green-700' : data.score >= 60 ? 'text-amber-700' : 'text-red-700'
                      )}
                    >
                      {data.score}
                    </span>
                  </div>
                  <p className="text-[10px] text-surface-500 mb-2">{POUR_DESCRIPTIONS[cat]}</p>
                  <div className="h-1.5 bg-white/50 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', colors.bg)}
                      style={{ width: `${data.score}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-surface-400 mt-1.5">
                    {data.count} issue{data.count !== 1 ? 's' : ''}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Violation Severity Breakdown */}
      {existingReport && (
        <div>
          <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">
            Violation Severity
          </h4>
          <div className="flex items-center gap-4 bg-surface-50 border border-surface-200 rounded-lg p-4">
            {([
              { level: 'A' as WCAGLevel, label: 'Level A (Critical)', color: 'bg-red-500', textColor: 'text-red-700' },
              { level: 'AA' as WCAGLevel, label: 'Level AA (Warning)', color: 'bg-amber-500', textColor: 'text-amber-700' },
              { level: 'AAA' as WCAGLevel, label: 'Level AAA (Info)', color: 'bg-blue-400', textColor: 'text-blue-700' },
            ]).map((item) => {
              const count = violationCounts[item.level];
              const total = unresolvedFindings.length || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={item.level} className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-surface-600">{item.label}</span>
                    <span className={cn('text-sm font-bold', item.textColor)}>{count}</span>
                  </div>
                  <div className="h-3 bg-surface-200 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', item.color)}
                      style={{ width: `${Math.max(count > 0 ? 8 : 0, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed Findings by POUR Category */}
      {existingReport && existingReport.findings.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">
            Findings by Category ({unresolvedFindings.length} unresolved)
          </h4>
          {(Object.keys(POUR_LABELS) as POURCategory[]).map((cat) => {
            const catFindings = existingReport.findings.filter((f) => {
              const meta = findingsMeta.get(f.id);
              return meta?.pour === cat;
            });
            if (catFindings.length === 0) return null;
            const colors = POUR_COLORS[cat];
            return (
              <div key={cat} className="mb-4">
                <div className={cn('text-xs font-medium mb-2 flex items-center gap-2', colors.text)}>
                  <div className={cn('w-2 h-2 rounded-full', colors.bg)} />
                  {POUR_LABELS[cat]} ({catFindings.filter((f) => !f.resolved).length} active)
                </div>
                <div className="space-y-2">
                  {catFindings.map((finding) => {
                    const style = SEVERITY_STYLES[finding.severity];
                    const meta = findingsMeta.get(finding.id);
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
                              {meta && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-surface-200 text-surface-600 rounded font-medium">
                                  WCAG {meta.wcag}
                                </span>
                              )}
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
                              onClick={() =>
                                resolveQAFinding(projectId, 'accessibility', finding.id)
                              }
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
            );
          })}
        </div>
      )}

      {/* Slide-by-slide Audit */}
      {slideStatuses.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">
            Slide-by-Slide Audit
          </h4>
          <div className="space-y-1">
            {slideStatuses.map((ss) => {
              const isExpanded = expandedSlides.has(ss.slide.id);
              const statusColor =
                ss.issues === 0
                  ? 'text-green-500'
                  : ss.issues <= 2
                    ? 'text-amber-500'
                    : 'text-red-500';
              return (
                <div
                  key={ss.slide.id}
                  className="border border-surface-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleSlide(ss.slide.id)}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-surface-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={cn(
                          'text-surface-400 transition-transform',
                          isExpanded && 'rotate-90'
                        )}
                      >
                        <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="text-xs text-surface-400">
                        Slide {ss.slide.slideNumber}
                      </span>
                      <span className="text-sm text-surface-700">{ss.slide.title}</span>
                      <span className="text-[10px] text-surface-400">{ss.doc.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {ss.issues > 0 && (
                        <span className={cn('text-xs font-medium', statusColor)}>
                          {ss.issues} issue{ss.issues !== 1 ? 's' : ''}
                        </span>
                      )}
                      {ss.issues === 0 && existingReport && (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-green-500"
                        >
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-4 py-3 border-t border-surface-100 bg-surface-50">
                      <div className="grid grid-cols-4 gap-3 text-xs">
                        {[
                          { label: 'Alt Text', ok: ss.hasAltText },
                          { label: 'Captions', ok: ss.hasCaptions },
                          { label: 'Keyboard', ok: ss.hasKeyboard },
                          { label: 'Readability', ok: ss.hasReadability },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className={cn(
                              'flex items-center gap-1.5 px-2 py-1.5 rounded',
                              item.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                            )}
                          >
                            {item.ok ? (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            ) : (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                            <span className="font-medium">{item.label}</span>
                          </div>
                        ))}
                      </div>
                      {existingReport && (
                        <div className="mt-2">
                          {existingReport.findings
                            .filter((f) => {
                              const meta = findingsMeta.get(f.id);
                              return meta?.slideId === ss.slide.id;
                            })
                            .map((f) => (
                              <div
                                key={f.id}
                                className={cn(
                                  'text-xs px-2 py-1 mt-1 rounded',
                                  f.resolved ? 'text-surface-400 line-through' : SEVERITY_STYLES[f.severity].text,
                                  f.resolved ? 'bg-surface-100' : SEVERITY_STYLES[f.severity].bg
                                )}
                              >
                                [{f.severity.toUpperCase()}] {f.title}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Generated Report */}
      {showReport && existingReport && (
        <div>
          <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">
            Accessibility Report
          </h4>
          <div className="bg-surface-900 text-surface-100 rounded-lg p-5 overflow-auto max-h-96">
            <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed">
              {reportText}
            </pre>
          </div>
          <div className="flex justify-end mt-2">
            <button
              onClick={() => {
                const blob = new Blob([reportText], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `accessibility-report-${projectId}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-3 py-1.5 text-xs font-medium rounded-md border border-surface-200 text-surface-600 hover:bg-surface-50 transition-colors"
            >
              Download Report
            </button>
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
          <span>All slides pass WCAG 2.0 AA accessibility checks. No issues detected.</span>
        </div>
      )}
    </div>
  );
}
