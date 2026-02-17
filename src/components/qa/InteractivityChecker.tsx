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

interface InteractivityCheckerProps {
  projectId: string;
}

const FAKE_INTERACTION_TERMS = [
  'click', 'next', 'reveal', 'hover', 'tab', 'accordion', 'flip', 'toggle',
];

const DECISION_TERMS = [
  'choose', 'decide', 'prioritize', 'evaluate', 'solve', 'analyze',
  'compare', 'build', 'create', 'select', 'determine', 'assess', 'judge',
];

const TRADEOFF_TERMS = [
  'trade-off', 'tradeoff', 'constraint', 'prioritize', 'limited', 'budget',
  'time', 'competing', 'balance', 'sacrifice', 'cost-benefit',
];

const SEVERITY_STYLES: Record<QASeverity, { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  warning: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  info: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  pass: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
};

interface SlideScore {
  slide: DesignDocSlide;
  doc: DesignDocument;
  total: number;
  hasDecisions: boolean;
  hasBranching: boolean;
  hasExplanatoryFeedback: boolean;
  hasScaffolding: boolean;
  hasTradeoffs: boolean;
  isFake: boolean;
  fakeReason: string;
}

function containsAny(text: string, terms: string[]): boolean {
  const lower = text.toLowerCase();
  return terms.some((t) => lower.includes(t));
}

function scoreSlide(slide: DesignDocSlide): Omit<SlideScore, 'slide' | 'doc'> {
  const interaction = slide.learnerView.interactionDescription?.trim() || '';
  const interactivitySpec = slide.designNotes.interactivitySpec?.trim() || '';
  const branching = slide.designNotes.branchingLogic?.trim() || '';
  const scoring = slide.designNotes.assessmentScoring?.trim() || '';
  const scaffolding = slide.designNotes.scaffoldingStrategy?.trim() || '';

  let total = 0;

  // Real decisions
  const hasDecisions =
    interaction.length > 0 && containsAny(interaction, DECISION_TERMS);
  if (hasDecisions) total += 20;

  // Branching with real consequences
  const hasBranching =
    branching.length > 0 &&
    (containsAny(branching, ['consequence', 'outcome', 'path', 'branch', 'result', 'different', 'if', 'then', 'leads to']) ||
      branching.length > 30);
  if (hasBranching) total += 20;

  // Explanatory feedback
  const hasExplanatoryFeedback =
    scoring.length > 0 &&
    containsAny(scoring, ['because', 'why', 'reason', 'explain', 'rationale', 'due to', 'since', 'correct because', 'incorrect because']);
  if (hasExplanatoryFeedback) total += 20;

  // Scaffolding
  const hasScaffolding = scaffolding.length > 0;
  if (hasScaffolding) total += 20;

  // Trade-offs
  const allText = `${interaction} ${interactivitySpec} ${branching} ${scaffolding}`;
  const hasTradeoffs = containsAny(allText, TRADEOFF_TERMS);
  if (hasTradeoffs) total += 20;

  // Fake interactivity detection
  let isFake = false;
  let fakeReason = '';
  if (interaction.length > 0) {
    const hasFakeTerms = containsAny(interaction, FAKE_INTERACTION_TERMS);
    const hasDecisionTerms = containsAny(interaction, DECISION_TERMS);
    if (hasFakeTerms && !hasDecisionTerms) {
      isFake = true;
      const matchedTerms = FAKE_INTERACTION_TERMS.filter((t) =>
        interaction.toLowerCase().includes(t)
      );
      fakeReason = `Interaction uses "${matchedTerms.join(', ')}" without decision-making elements.`;
    }
  }

  return {
    total,
    hasDecisions,
    hasBranching,
    hasExplanatoryFeedback,
    hasScaffolding,
    hasTradeoffs,
    isFake,
    fakeReason,
  };
}

export default function InteractivityChecker({ projectId }: InteractivityCheckerProps) {
  const getDesignDocs = useAppStore((s) => s.getDesignDocs);
  const getQAReport = useAppStore((s) => s.getQAReport);
  const saveQAReport = useAppStore((s) => s.saveQAReport);
  const resolveQAFinding = useAppStore((s) => s.resolveQAFinding);

  const [isRunning, setIsRunning] = useState(false);
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set());

  const designDocs = getDesignDocs(projectId);
  const existingReport = getQAReport(projectId, 'interactivity');

  const slideScores = useMemo<SlideScore[]>(() => {
    const results: SlideScore[] = [];
    for (const doc of designDocs) {
      for (const slide of doc.slides) {
        const scores = scoreSlide(slide);
        results.push({ slide, doc, ...scores });
      }
    }
    return results;
  }, [designDocs]);

  const courseScore = useMemo(() => {
    if (slideScores.length === 0) return 0;
    return Math.round(
      slideScores.reduce((sum, s) => sum + s.total, 0) / slideScores.length
    );
  }, [slideScores]);

  const criteriaStats = useMemo(() => {
    const total = slideScores.length || 1;
    return {
      decisions: Math.round((slideScores.filter((s) => s.hasDecisions).length / total) * 100),
      branching: Math.round((slideScores.filter((s) => s.hasBranching).length / total) * 100),
      feedback: Math.round((slideScores.filter((s) => s.hasExplanatoryFeedback).length / total) * 100),
      scaffolding: Math.round((slideScores.filter((s) => s.hasScaffolding).length / total) * 100),
      tradeoffs: Math.round((slideScores.filter((s) => s.hasTradeoffs).length / total) * 100),
    };
  }, [slideScores]);

  const fakeAlerts = useMemo(
    () => slideScores.filter((s) => s.isFake),
    [slideScores]
  );

  const toggleDoc = (docId: string) => {
    setExpandedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) next.delete(docId);
      else next.add(docId);
      return next;
    });
  };

  const runAnalysis = useCallback(() => {
    setIsRunning(true);
    const findings: QAFinding[] = [];

    // Per-slide findings
    for (const ss of slideScores) {
      // Fake interactivity
      if (ss.isFake) {
        findings.push({
          id: generateId(),
          tool: 'interactivity',
          severity: 'warning',
          title: 'Possible fake interactivity',
          description: ss.fakeReason,
          location: `${ss.doc.title} > Slide ${ss.slide.slideNumber}: ${ss.slide.title}`,
          suggestion:
            'Replace click-to-reveal or passive interactions with decision-making activities where learner choices change outcomes.',
          resolved: false,
        });
      }

      // Score-based flags
      if (ss.total < 20) {
        findings.push({
          id: generateId(),
          tool: 'interactivity',
          severity: 'critical',
          title: 'Very low interactivity score',
          description: `Slide "${ss.slide.title}" scored ${ss.total}/100. It lacks meaningful interaction elements.`,
          location: `${ss.doc.title} > Slide ${ss.slide.slideNumber}: ${ss.slide.title}`,
          suggestion:
            'Add at least two meaningful interactivity elements: real decision-making, branching consequences, explanatory feedback, or trade-off scenarios.',
          resolved: false,
        });
      } else if (ss.total < 40) {
        findings.push({
          id: generateId(),
          tool: 'interactivity',
          severity: 'warning',
          title: 'Low interactivity score',
          description: `Slide "${ss.slide.title}" scored ${ss.total}/100. Consider enriching the interaction design.`,
          location: `${ss.doc.title} > Slide ${ss.slide.slideNumber}: ${ss.slide.title}`,
          suggestion:
            'Strengthen interactivity by adding branching logic, explanatory feedback, or realistic trade-offs.',
          resolved: false,
        });
      }

      // No branching but has spec
      const spec = ss.slide.designNotes.interactivitySpec?.trim() || '';
      const branch = ss.slide.designNotes.branchingLogic?.trim() || '';
      if (spec.length > 0 && branch.length === 0) {
        findings.push({
          id: generateId(),
          tool: 'interactivity',
          severity: 'info',
          title: 'Consider adding branching',
          description: `Slide "${ss.slide.title}" has an interactivity spec but no branching logic defined.`,
          location: `${ss.doc.title} > Slide ${ss.slide.slideNumber}: ${ss.slide.title}`,
          suggestion:
            'Add branching logic so learner decisions lead to different consequences or paths.',
          resolved: false,
        });
      }

      // Weak feedback
      const scoring = ss.slide.designNotes.assessmentScoring?.trim() || '';
      if (
        scoring.length > 0 &&
        !ss.hasExplanatoryFeedback &&
        /correct|incorrect|right|wrong/i.test(scoring)
      ) {
        findings.push({
          id: generateId(),
          tool: 'interactivity',
          severity: 'warning',
          title: 'Feedback lacks explanation',
          description: `Slide "${ss.slide.title}" has assessment scoring that only marks correct/incorrect without explaining why.`,
          location: `${ss.doc.title} > Slide ${ss.slide.slideNumber}: ${ss.slide.title}`,
          suggestion:
            'Expand feedback to explain WHY each option is correct or incorrect. Explanatory feedback is critical for learning.',
          resolved: false,
        });
      }
    }

    // Course-wide findings
    if (courseScore < 30 && slideScores.length > 0) {
      findings.push({
        id: generateId(),
        tool: 'interactivity',
        severity: 'critical',
        title: 'Course-wide interactivity is very low',
        description: `The overall interactivity score is ${courseScore}/100. Most slides lack meaningful engagement.`,
        location: 'Course-wide',
        suggestion:
          'Redesign interactions to include real decisions with consequences, scenario branching, and explanatory feedback. Refer to the meaningful interactivity standards.',
        resolved: false,
      });
    }

    if (fakeAlerts.length > slideScores.length * 0.3 && slideScores.length > 0) {
      findings.push({
        id: generateId(),
        tool: 'interactivity',
        severity: 'critical',
        title: 'High rate of fake interactivity',
        description: `${fakeAlerts.length} of ${slideScores.length} slides (${Math.round((fakeAlerts.length / slideScores.length) * 100)}%) have possible fake interactivity.`,
        location: 'Course-wide',
        suggestion:
          'Systematically replace click-to-reveal, hover-to-see, and passive navigation with decision-based activities.',
        resolved: false,
      });
    }

    const summary =
      courseScore >= 70
        ? 'Interactivity quality is strong with meaningful engagement across most slides.'
        : courseScore >= 40
          ? 'Interactivity quality is moderate. Several slides need richer interaction design.'
          : 'Interactivity quality is low. Most interactions lack meaningful decision-making and feedback.';

    saveQAReport({ projectId, tool: 'interactivity', score: courseScore, findings, summary });
    setIsRunning(false);
  }, [slideScores, courseScore, fakeAlerts, projectId, saveQAReport]);

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
          <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h3 className="text-sm font-semibold text-surface-700 mb-1">No Design Documents Found</h3>
        <p className="text-xs text-surface-500 max-w-xs">
          Create design documents with slides before running the interactivity checker.
        </p>
      </div>
    );
  }

  const unresolvedFindings = existingReport
    ? existingReport.findings.filter((f) => !f.resolved)
    : [];

  function scoreColor(score: number): string {
    if (score >= 70) return 'text-green-700';
    if (score >= 40) return 'text-amber-700';
    return 'text-red-700';
  }

  function scoreBg(score: number): string {
    if (score >= 70) return 'bg-green-50 border-green-200';
    if (score >= 40) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  }

  function barColor(pct: number): string {
    if (pct >= 60) return 'bg-green-500';
    if (pct >= 30) return 'bg-amber-500';
    return 'bg-red-400';
  }

  const criteriaItems = [
    { label: 'Real Decisions', value: criteriaStats.decisions, description: '% slides with substantive interaction' },
    { label: 'Branching Consequences', value: criteriaStats.branching, description: '% with branching logic' },
    { label: 'Explanatory Feedback', value: criteriaStats.feedback, description: '% with why-based feedback' },
    { label: 'Scaffolding Support', value: criteriaStats.scaffolding, description: '% with scaffolding' },
    { label: 'Trade-offs & Constraints', value: criteriaStats.tradeoffs, description: '% mentioning trade-offs' },
  ];

  return (
    <div className="space-y-6">
      {/* Header + Run Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-surface-900">Interactivity Checker</h3>
          <p className="text-xs text-surface-500 mt-0.5">
            Detects fake interactivity and scores interactions on meaningfulness.
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

      {/* Overall Score */}
      <div className={cn('flex items-center gap-6 px-6 py-5 rounded-lg border', scoreBg(courseScore))}>
        <div className="text-center">
          <div className={cn('text-4xl font-bold', scoreColor(courseScore))}>
            {courseScore}
          </div>
          <div className="text-xs text-surface-500 mt-1">Overall Score</div>
        </div>
        <div className="flex-1">
          {existingReport && (
            <>
              <p className="text-sm font-medium text-surface-800">{existingReport.summary}</p>
              <p className="text-xs text-surface-500 mt-0.5">
                {slideScores.length} slides analyzed across {designDocs.length} design doc{designDocs.length !== 1 ? 's' : ''}
                {' | '}Last run: {formatRelativeTime(existingReport.runAt)}
              </p>
            </>
          )}
          {!existingReport && (
            <p className="text-sm text-surface-500">
              Run analysis to get a detailed interactivity report.
            </p>
          )}
        </div>
      </div>

      {/* Meaningfulness Criteria */}
      <div>
        <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">
          Meaningfulness Criteria
        </h4>
        <div className="grid grid-cols-5 gap-3">
          {criteriaItems.map((item) => (
            <div
              key={item.label}
              className="bg-surface-50 border border-surface-200 rounded-lg p-3 text-center"
            >
              <div className={cn('text-xl font-bold', scoreColor(item.value))}>
                {item.value}%
              </div>
              <div className="text-xs font-medium text-surface-700 mt-1">{item.label}</div>
              <div className="text-[10px] text-surface-400 mt-0.5">{item.description}</div>
              <div className="mt-2 h-1.5 bg-surface-200 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', barColor(item.value))}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fake Interactivity Alerts */}
      {fakeAlerts.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">
            Fake Interactivity Alerts ({fakeAlerts.length})
          </h4>
          <div className="space-y-2">
            {fakeAlerts.map((alert) => (
              <div
                key={`${alert.doc.id}-${alert.slide.id}`}
                className="border-2 border-red-300 bg-red-50 rounded-lg px-4 py-3"
              >
                <div className="flex items-start gap-3">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-red-500 shrink-0 mt-0.5"
                  >
                    <path
                      d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div>
                    <div className="text-sm font-medium text-red-800">
                      {alert.doc.title} &mdash; Slide {alert.slide.slideNumber}: {alert.slide.title}
                    </div>
                    <p className="text-xs text-red-700 mt-0.5">{alert.fakeReason}</p>
                    <p className="text-xs text-surface-500 mt-1 italic">
                      Current interaction: &ldquo;{alert.slide.learnerView.interactionDescription}&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per-slide Breakdown */}
      <div>
        <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">
          Per-slide Breakdown
        </h4>
        <div className="space-y-3">
          {designDocs.map((doc) => {
            const docSlides = slideScores.filter((ss) => ss.doc.id === doc.id);
            const isExpanded = expandedDocs.has(doc.id);
            const avgScore =
              docSlides.length > 0
                ? Math.round(docSlides.reduce((s, ss) => s + ss.total, 0) / docSlides.length)
                : 0;
            return (
              <div key={doc.id} className="border border-surface-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleDoc(doc.id)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-surface-50 hover:bg-surface-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <svg
                      width="16"
                      height="16"
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
                    <span className="text-sm font-medium text-surface-800">{doc.title}</span>
                    <span className="text-xs text-surface-400">
                      {docSlides.length} slide{docSlides.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className={cn('text-sm font-semibold', scoreColor(avgScore))}>
                    Avg: {avgScore}/100
                  </span>
                </button>
                {isExpanded && (
                  <div className="divide-y divide-surface-100">
                    {docSlides.map((ss) => {
                      const bars = [
                        { label: 'Decisions', active: ss.hasDecisions },
                        { label: 'Branching', active: ss.hasBranching },
                        { label: 'Feedback', active: ss.hasExplanatoryFeedback },
                        { label: 'Scaffolding', active: ss.hasScaffolding },
                        { label: 'Trade-offs', active: ss.hasTradeoffs },
                      ];
                      return (
                        <div key={ss.slide.id} className="px-4 py-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-surface-400">
                                Slide {ss.slide.slideNumber}
                              </span>
                              <span className="text-sm font-medium text-surface-700">
                                {ss.slide.title}
                              </span>
                              {ss.isFake && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-medium">
                                  Fake
                                </span>
                              )}
                            </div>
                            <span
                              className={cn(
                                'text-sm font-bold',
                                scoreColor(ss.total)
                              )}
                            >
                              {ss.total}/100
                            </span>
                          </div>
                          {/* Criteria bars */}
                          <div className="space-y-1.5">
                            {bars.map((bar) => (
                              <div key={bar.label} className="flex items-center gap-2">
                                <span className="text-[10px] text-surface-500 w-20 text-right">
                                  {bar.label}
                                </span>
                                <div className="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden">
                                  <div
                                    className={cn(
                                      'h-full rounded-full transition-all',
                                      bar.active ? 'bg-brand-500' : 'bg-surface-200'
                                    )}
                                    style={{ width: bar.active ? '100%' : '0%' }}
                                  />
                                </div>
                                <span className="text-[10px] w-8">
                                  {bar.active ? (
                                    <svg
                                      width="14"
                                      height="14"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2.5"
                                      className="text-green-500"
                                    >
                                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  ) : (
                                    <svg
                                      width="14"
                                      height="14"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2.5"
                                      className="text-surface-300"
                                    >
                                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </span>
                              </div>
                            ))}
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
                        onClick={() =>
                          resolveQAFinding(projectId, 'interactivity', finding.id)
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
      )}
    </div>
  );
}
