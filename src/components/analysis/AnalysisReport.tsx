'use client';

import React from 'react';
import { NeedsAnalysisReport, ANALYSIS_AREAS } from '@/lib/types';
import { cn, formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface AnalysisReportProps {
  report: NeedsAnalysisReport;
}

/** Reusable section card wrapper */
function ReportSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('bg-white border border-surface-200 rounded-xl p-6', className)}>
      <h2 className="text-base font-semibold text-surface-900 mb-4 flex items-center gap-2">
        {title}
      </h2>
      {children}
    </div>
  );
}

/** Key-value pair display */
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-3 last:mb-0">
      <dt className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-0.5">
        {label}
      </dt>
      <dd className="text-sm text-surface-800 leading-relaxed">{value}</dd>
    </div>
  );
}

/** Bullet list helper */
function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="text-sm text-surface-400 italic">None identified</p>;
  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-surface-700">
          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-surface-400 flex-shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function AnalysisReport({ report }: AnalysisReportProps) {
  const handleExport = () => {
    alert('Export functionality will be available in a future update. The report data is saved to your project.');
  };

  const { isTrainingAppropriate } = report.rootCauseAnalysis;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Report Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 mb-1">
            Needs Analysis Report
          </h1>
          <p className="text-sm text-surface-500">
            Generated {formatDate(report.createdAt)}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleExport}>
          Export Report
        </Button>
      </div>

      {/* Training Appropriateness Banner */}
      <div
        className={cn(
          'rounded-xl p-5 mb-6 flex items-center gap-4',
          isTrainingAppropriate
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        )}
      >
        <div
          className={cn(
            'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center',
            isTrainingAppropriate ? 'bg-green-500' : 'bg-red-500'
          )}
        >
          {isTrainingAppropriate ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          )}
        </div>
        <div>
          <h2
            className={cn(
              'text-lg font-bold',
              isTrainingAppropriate ? 'text-green-900' : 'text-red-900'
            )}
          >
            Is Training Appropriate? {isTrainingAppropriate ? 'YES' : 'NO'}
          </h2>
          <p
            className={cn(
              'text-sm mt-0.5',
              isTrainingAppropriate ? 'text-green-700' : 'text-red-700'
            )}
          >
            {report.rootCauseAnalysis.reasoning}
          </p>
        </div>
      </div>

      {/* Red Flags (if any) */}
      {report.redFlags.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
          <h2 className="text-base font-semibold text-amber-900 mb-3 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Red Flags ({report.redFlags.length})
          </h2>
          <div className="space-y-3">
            {report.redFlags.map((flag) => {
              const areaLabel =
                ANALYSIS_AREAS.find((a) => a.key === flag.area)?.label || flag.area;
              return (
                <div
                  key={flag.id}
                  className={cn(
                    'rounded-lg p-3',
                    flag.severity === 'critical'
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-amber-100 border border-amber-300'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                        flag.severity === 'critical'
                          ? 'bg-red-200 text-red-800'
                          : 'bg-amber-200 text-amber-800'
                      )}
                    >
                      {flag.severity}
                    </span>
                    <span className="text-xs font-medium text-surface-600">{areaLabel}</span>
                  </div>
                  <p className="text-sm text-surface-800 mb-1">{flag.message}</p>
                  <p className="text-xs text-surface-600">
                    <span className="font-semibold">Recommendation:</span> {flag.recommendation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Report Sections */}
      <div className="space-y-5">
        {/* Executive Summary */}
        <ReportSection title="Executive Summary">
          <p className="text-sm text-surface-700 leading-relaxed">
            {report.executiveSummary}
          </p>
        </ReportSection>

        {/* Performance Gap */}
        <ReportSection title="Performance Gap">
          <dl>
            <Field label="Current State" value={report.performanceGap.currentState} />
            <Field label="Desired State" value={report.performanceGap.desiredState} />
          </dl>
          <div className="mt-3">
            <dt className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">
              Evidence
            </dt>
            <BulletList items={report.performanceGap.evidence} />
          </div>
        </ReportSection>

        {/* Learner Profile */}
        <ReportSection title="Learner Profile">
          <dl>
            <Field label="Demographics" value={report.learnerProfile.demographics} />
            <Field label="Prior Knowledge" value={report.learnerProfile.priorKnowledge} />
            <Field label="Motivation" value={report.learnerProfile.motivation} />
            <Field label="ZPD Assessment" value={report.learnerProfile.zpdAssessment} />
          </dl>
          <div className="mt-3">
            <dt className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">
              Prerequisites
            </dt>
            <BulletList items={report.learnerProfile.prerequisites} />
          </div>
        </ReportSection>

        {/* Root Cause Analysis */}
        <ReportSection title="Root Cause Analysis">
          <Field label="Reasoning" value={report.rootCauseAnalysis.reasoning} />
          <div className="mt-3">
            <dt className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">
              Alternative Solutions Considered
            </dt>
            <BulletList items={report.rootCauseAnalysis.alternativeSolutions} />
          </div>
        </ReportSection>

        {/* Constraints */}
        <ReportSection title="Constraints">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            <dl>
              <Field label="Timeline" value={report.constraints.timeline} />
              <Field label="Budget" value={report.constraints.budget} />
            </dl>
            <dl>
              <Field label="Technology" value={report.constraints.technology} />
              <Field label="Environment" value={report.constraints.environment} />
            </dl>
          </div>
          <div className="mt-3">
            <dt className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">
              Key Stakeholders
            </dt>
            <BulletList items={report.constraints.stakeholders} />
          </div>
        </ReportSection>

        {/* Multimodal Recommendations */}
        <ReportSection title="Multimodal Recommendations">
          <Field label="Primary Modality" value={report.multimodalRecommendations.primaryModality} />
          <div className="mt-3">
            <dt className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">
              Secondary Modalities
            </dt>
            <BulletList items={report.multimodalRecommendations.secondaryModalities} />
          </div>
          <div className="mt-3">
            <Field label="Rationale" value={report.multimodalRecommendations.rationale} />
          </div>
        </ReportSection>

        {/* Accessibility Requirements */}
        <ReportSection title="Accessibility Requirements">
          <Field label="WCAG Compliance Level" value={report.accessibilityRequirements.wcagLevel} />
          <div className="mt-3">
            <dt className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">
              Assistive Technologies Supported
            </dt>
            <BulletList items={report.accessibilityRequirements.assistiveTech} />
          </div>
          <div className="mt-3">
            <dt className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">
              Key Considerations
            </dt>
            <BulletList items={report.accessibilityRequirements.considerations} />
          </div>
        </ReportSection>

        {/* Success Metrics */}
        <ReportSection title="Success Metrics">
          {report.successMetrics.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-200">
                    <th className="text-left py-2 pr-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                      Metric
                    </th>
                    <th className="text-left py-2 pr-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                      Measurement
                    </th>
                    <th className="text-left py-2 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                      Target
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {report.successMetrics.map((metric, i) => (
                    <tr key={i} className="border-b border-surface-100 last:border-0">
                      <td className="py-2.5 pr-4 text-surface-800 font-medium">{metric.metric}</td>
                      <td className="py-2.5 pr-4 text-surface-600">{metric.measurement}</td>
                      <td className="py-2.5 text-surface-600">{metric.target}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-surface-400 italic">No metrics defined</p>
          )}
        </ReportSection>

        {/* Business Impact */}
        <ReportSection title="Business Impact">
          <dl>
            <Field label="Organizational Problem" value={report.businessImpact.problem} />
            <Field label="Cost of Inaction" value={report.businessImpact.costOfInaction} />
            <Field label="Expected ROI" value={report.businessImpact.expectedROI} />
          </dl>
        </ReportSection>

        {/* Recommendation */}
        <ReportSection title="Recommendation" className="border-brand-200 bg-brand-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            <dl>
              <Field label="Recommended Format" value={report.recommendation.format} />
              <Field label="Duration" value={report.recommendation.duration} />
            </dl>
            <dl>
              <Field label="Delivery Method" value={report.recommendation.deliveryMethod} />
            </dl>
          </div>
          <div className="mt-3">
            <Field label="Rationale" value={report.recommendation.rationale} />
          </div>
        </ReportSection>

        {/* Material Gaps */}
        <ReportSection title="Material Gaps">
          <p className="text-xs text-surface-500 mb-2">
            Content and assets that need to be created or acquired:
          </p>
          <BulletList items={report.materialGaps} />
        </ReportSection>
      </div>

      {/* Footer Actions */}
      <div className="mt-8 flex items-center justify-between border-t border-surface-200 pt-6">
        <p className="text-xs text-surface-400">
          Report ID: {report.id}
        </p>
        <Button variant="secondary" size="sm" onClick={handleExport}>
          Export Report
        </Button>
      </div>
    </div>
  );
}
