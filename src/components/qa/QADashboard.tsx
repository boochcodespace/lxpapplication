'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { QA_TOOLS, QAToolType } from '@/lib/types';
import { cn, formatRelativeTime } from '@/lib/utils';
import Button from '@/components/ui/Button';
import AlignmentChecker from '@/components/qa/AlignmentChecker';
import BloomsAnalyzer from '@/components/qa/BloomsAnalyzer';
import MultimodalAnalyzer from '@/components/qa/MultimodalAnalyzer';

// ── Inline SVG icons for each QA tool ──

function ToolIcon({ icon, className }: { icon: string; className?: string }) {
  const cls = cn('w-5 h-5', className);
  switch (icon) {
    case 'link':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.018a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.25 8.81" />
        </svg>
      );
    case 'layers':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0l4.179 2.25L12 17.25 2.25 12l4.179-2.25m11.142 0l4.179 2.25L12 22.5l-9.75-5.25 4.179-2.25" />
        </svg>
      );
    case 'grid':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      );
    case 'target':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zM12 4.5a7.5 7.5 0 100 15 7.5 7.5 0 000-15zM12 1.5a10.5 10.5 0 100 21 10.5 10.5 0 000-21z" />
        </svg>
      );
    case 'zap':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      );
    case 'eye':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case 'type':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      );
    case 'search':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      );
    case 'folder':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
        </svg>
      );
    default:
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      );
  }
}

// ── Score helpers ──

function scoreBarColor(score: number): string {
  if (score < 40) return 'bg-red-500';
  if (score <= 70) return 'bg-yellow-500';
  return 'bg-green-500';
}

function scoreTextColor(score: number): string {
  if (score < 40) return 'text-red-700';
  if (score <= 70) return 'text-yellow-700';
  return 'text-green-700';
}

function scoreDotColor(score: number): string {
  if (score < 40) return 'bg-red-500';
  if (score <= 70) return 'bg-yellow-500';
  return 'bg-green-500';
}

// ── Score Summary Card ──

function ScoreCard({
  label,
  score,
  runAt,
}: {
  label: string;
  score: number | null;
  runAt: string | null;
}) {
  return (
    <div className="bg-white rounded-lg border border-surface-200 px-3 py-2.5 min-w-[140px] flex-shrink-0">
      <p className="text-[11px] font-medium text-surface-500 truncate">{label}</p>
      {score !== null ? (
        <>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn('text-lg font-bold', scoreTextColor(score))}>{score}</span>
            <div className="flex-1 h-1.5 bg-surface-100 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', scoreBarColor(score))}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
          {runAt && (
            <p className="text-[10px] text-surface-400 mt-0.5">{formatRelativeTime(runAt)}</p>
          )}
        </>
      ) : (
        <p className="text-xs text-surface-400 mt-1.5">Not run</p>
      )}
    </div>
  );
}

// ── Sidebar Nav Item ──

function NavItem({
  tool,
  score,
  isActive,
  onClick,
}: {
  tool: (typeof QA_TOOLS)[number];
  score: number | null;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors',
        isActive
          ? 'bg-brand-50 text-brand-700'
          : 'text-surface-700 hover:bg-surface-100'
      )}
    >
      <ToolIcon
        icon={tool.icon}
        className={cn('w-4 h-4 shrink-0', isActive ? 'text-brand-600' : 'text-surface-400')}
      />
      <span className="flex-1 text-sm font-medium truncate">{tool.label}</span>
      <span
        className={cn(
          'w-2.5 h-2.5 rounded-full shrink-0',
          score === null
            ? 'bg-surface-300'
            : scoreDotColor(score)
        )}
      />
    </button>
  );
}

// ── Active tool renderer ──

function ActiveToolView({
  projectId,
  tool,
}: {
  projectId: string;
  tool: QAToolType;
}) {
  switch (tool) {
    case 'alignment':
      return <AlignmentChecker projectId={projectId} />;
    case 'blooms':
      return <BloomsAnalyzer projectId={projectId} />;
    case 'multimodal':
      return <MultimodalAnalyzer projectId={projectId} />;
    case 'zpd':
      return <PlaceholderTool name="ZPD Validator" />;
    case 'interactivity':
      return <PlaceholderTool name="Interactivity Checker" />;
    case 'accessibility':
      return <PlaceholderTool name="Accessibility Validator" />;
    case 'style-guide':
      return <PlaceholderTool name="Style Guide Enforcer" />;
    case 'gap-analysis':
      return <PlaceholderTool name="Gap Analysis" />;
    case 'source-material':
      return <PlaceholderTool name="Source Material Audit" />;
    default:
      return null;
  }
}

function PlaceholderTool({ name }: { name: string }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center">
        <div className="w-14 h-14 rounded-xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384 3.218 1.03-5.986L2.696 8.2l6.012-.874L11.42 2l2.692 5.326 6.012.874-4.37 4.202 1.03 5.986L11.42 15.17z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-surface-700">{name}</p>
        <p className="text-xs text-surface-500 mt-1">This tool is coming soon.</p>
      </div>
    </div>
  );
}

// ── Main Dashboard ──

interface QADashboardProps {
  projectId: string;
}

export default function QADashboard({ projectId }: QADashboardProps) {
  const activeQATool = useAppStore((s) => s.activeQATool);
  const setActiveQATool = useAppStore((s) => s.setActiveQATool);
  const getQAReport = useAppStore((s) => s.getQAReport);
  const projects = useAppStore((s) => s.projects);

  const project = projects.find((p) => p.id === projectId);

  // Collect report data for each tool
  const toolReports = QA_TOOLS.map((tool) => {
    const report = getQAReport(projectId, tool.key);
    return {
      ...tool,
      score: report ? report.score : null,
      runAt: report ? report.runAt : null,
    };
  });

  const handleRunAllChecks = () => {
    setActiveQATool('alignment');
  };

  return (
    <div className="flex-1 flex flex-col bg-surface-50 min-h-0">
      {/* Header Bar */}
      <div className="bg-white border-b border-surface-200 px-5 py-3 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-surface-900">Quality Assurance</h1>
            <p className="text-xs text-surface-500 mt-0.5">
              {project?.title || 'Project'} — Evaluate course quality across 9 dimensions
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={handleRunAllChecks}>
            <svg className="w-4 h-4 -ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
            Run All Checks
          </Button>
        </div>
      </div>

      {/* Score Summary Bar */}
      <div className="bg-white border-b border-surface-200 px-5 py-3 shrink-0 overflow-x-auto">
        <div className="flex items-center gap-2">
          {toolReports.map((tr) => (
            <ScoreCard key={tr.key} label={tr.label} score={tr.score} runAt={tr.runAt} />
          ))}
        </div>
      </div>

      {/* Main area: sidebar + content */}
      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar */}
        <div className="w-56 shrink-0 bg-white border-r border-surface-200 overflow-y-auto p-3 space-y-0.5">
          {toolReports.map((tr) => (
            <NavItem
              key={tr.key}
              tool={tr}
              score={tr.score}
              isActive={activeQATool === tr.key}
              onClick={() => setActiveQATool(tr.key)}
            />
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          {activeQATool ? (
            <ActiveToolView projectId={projectId} tool={activeQATool} />
          ) : (
            <div className="flex items-center justify-center h-full p-8">
              <div className="text-center">
                <div className="w-14 h-14 rounded-xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-surface-700">Select a QA tool from the sidebar to begin analysis</p>
                <p className="text-xs text-surface-500 mt-1">
                  Each tool evaluates a different quality dimension of your course design
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
