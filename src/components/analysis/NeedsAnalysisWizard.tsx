'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { ANALYSIS_AREAS } from '@/lib/types';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import AnalysisChat from './AnalysisChat';
import AnalysisSummary from './AnalysisSummary';
import AnalysisReport from './AnalysisReport';

interface NeedsAnalysisWizardProps {
  projectId: string;
}

/** Inline SVG icons mapped to ANALYSIS_AREAS icon keys */
function AreaIcon({ icon, className }: { icon: string; className?: string }) {
  const size = 24;
  const shared = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  switch (icon) {
    case 'gap':
      return (
        <svg {...shared} className={className}>
          <path d="M4 12h6M14 12h6" />
          <path d="M12 4v16" strokeDasharray="2 2" />
        </svg>
      );
    case 'search':
      return (
        <svg {...shared} className={className}>
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      );
    case 'users':
      return (
        <svg {...shared} className={className}>
          <circle cx="9" cy="7" r="3" />
          <path d="M3 21v-1a5 5 0 015-5h2a5 5 0 015 5v1" />
          <circle cx="17" cy="9" r="2" />
          <path d="M21 21v-1a3 3 0 00-2-2.83" />
        </svg>
      );
    case 'settings':
      return (
        <svg {...shared} className={className}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1.08-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1.08 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001.08 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1.08z" />
        </svg>
      );
    case 'chart':
      return (
        <svg {...shared} className={className}>
          <path d="M18 20V10M12 20V4M6 20v-6" />
        </svg>
      );
    case 'building':
      return (
        <svg {...shared} className={className}>
          <rect x="4" y="2" width="16" height="20" rx="1" />
          <path d="M9 22V12h6v10" />
          <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
        </svg>
      );
    case 'layers':
      return (
        <svg {...shared} className={className}>
          <path d="M12 2l10 6.5v7L12 22 2 15.5v-7L12 2z" />
          <path d="M12 22v-7" />
          <path d="M22 8.5l-10 7-10-7" />
          <path d="M2 15.5l10-7 10 7" />
        </svg>
      );
    case 'accessibility':
      return (
        <svg {...shared} className={className}>
          <circle cx="12" cy="4" r="2" />
          <path d="M12 8v6M8 10l4 2 4-2M10 18l2-4 2 4" />
        </svg>
      );
    default:
      return (
        <svg {...shared} className={className}>
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
}

export default function NeedsAnalysisWizard({ projectId }: NeedsAnalysisWizardProps) {
  const wizard = useAppStore((s) => s.getAnalysisWizard(projectId));
  const startWizard = useAppStore((s) => s.startAnalysisWizard);

  // ── NOT STARTED: Welcome / Intro Screen ──
  if (wizard.status === 'not-started') {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-100 mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-surface-900 mb-2">
              Needs Analysis Wizard
            </h1>
            <p className="text-surface-600 max-w-lg mx-auto leading-relaxed">
              This guided interview will walk you through a comprehensive needs analysis
              covering 8 critical areas. The AI agent will ask probing questions, detect
              potential red flags, and generate a professional analysis report.
            </p>
          </div>

          {/* Analysis Areas Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {ANALYSIS_AREAS.map((area, index) => (
              <div
                key={area.key}
                className="relative p-4 bg-white border border-surface-200 rounded-xl hover:border-brand-200 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                    <AreaIcon icon={area.icon} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-medium text-surface-400 uppercase tracking-wider">
                      {index + 1} of 8
                    </span>
                    <h3 className="text-sm font-semibold text-surface-900 leading-tight">
                      {area.label}
                    </h3>
                    <p className="text-xs text-surface-500 mt-0.5">
                      {area.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* What to expect */}
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-6 mb-8">
            <h2 className="text-sm font-semibold text-brand-900 mb-3">What to expect</h2>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-brand-800">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-brand-200 text-brand-700 flex items-center justify-center text-xs font-bold">1</span>
                A conversational interview covering each analysis area
              </li>
              <li className="flex items-start gap-2 text-sm text-brand-800">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-brand-200 text-brand-700 flex items-center justify-center text-xs font-bold">2</span>
                Real-time red flag detection for potential issues
              </li>
              <li className="flex items-start gap-2 text-sm text-brand-800">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-brand-200 text-brand-700 flex items-center justify-center text-xs font-bold">3</span>
                A running summary tracking your progress
              </li>
              <li className="flex items-start gap-2 text-sm text-brand-800">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-brand-200 text-brand-700 flex items-center justify-center text-xs font-bold">4</span>
                A comprehensive Needs Analysis Report at the end
              </li>
            </ul>
          </div>

          {/* Start Button */}
          <div className="text-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => startWizard(projectId)}
            >
              Start Needs Analysis
            </Button>
            <p className="text-xs text-surface-400 mt-3">
              Estimated time: 15-30 minutes depending on detail level
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── COMPLETED: Show Report ──
  if (wizard.status === 'completed' && wizard.report) {
    return (
      <div className="h-full overflow-y-auto">
        <AnalysisReport report={wizard.report} />
      </div>
    );
  }

  // ── IN PROGRESS: Two-panel layout ──
  return (
    <div className="h-full flex">
      {/* Left Panel: Chat */}
      <div className="flex-1 min-w-0 border-r border-surface-200">
        <AnalysisChat projectId={projectId} />
      </div>

      {/* Right Panel: Summary Sidebar */}
      <div className="w-80 flex-shrink-0 overflow-y-auto bg-surface-50">
        <AnalysisSummary projectId={projectId} />
      </div>
    </div>
  );
}
