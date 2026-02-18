'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { cn, getPhaseColor, truncate } from '@/lib/utils';
import type { ADDIEPhase } from '@/lib/types';

const navItems = [
  {
    key: 'dashboard' as const,
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    key: 'materials' as const,
    label: 'Materials',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
      </svg>
    ),
  },
  {
    key: 'knowledge-base' as const,
    label: 'Knowledge Base',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
];

// Project-context workflow nav items (shown when a project is selected)
const workflowItems = [
  {
    key: 'chat' as const,
    label: 'Chat',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
  },
  {
    key: 'analysis' as const,
    label: 'Needs Analysis',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
  },
  {
    key: 'outline' as const,
    label: 'Course Outline',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
  },
  {
    key: 'design-doc' as const,
    label: 'Design Docs',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    key: 'quality-assurance' as const,
    label: 'Quality Assurance',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    key: 'development' as const,
    label: 'Dev Support',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l5.653-4.655m0 0l3.166-2.516c.1-.08.209-.152.323-.218M13.126 11.572a3.643 3.643 0 00-.318-.318m0 0a3.643 3.643 0 00-5.15.115l-.318.318m5.468-.433a3.643 3.643 0 01.318.318" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const activeView = useAppStore((s) => s.activeView);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const projects = useAppStore((s) => s.projects);
  const activeProjectId = useAppStore((s) => s.activeProjectId);
  const setActiveProject = useAppStore((s) => s.setActiveProject);

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex flex-col bg-white border-r border-surface-200 transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-0 -translate-x-full'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 h-14 px-4 border-b border-surface-200 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
          <span className="text-white text-sm font-bold">CD</span>
        </div>
        <div>
          <h1 className="text-sm font-semibold text-surface-900">Course Dev</h1>
          <p className="text-xs text-surface-500">AI Agent</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-3 pt-4 pb-2">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => {
              setActiveView(item.key);
              if (item.key === 'dashboard') setActiveProject(null);
            }}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
              activeView === item.key && !activeProjectId
                ? 'bg-brand-50 text-brand-700'
                : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
            )}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Project workflow nav (shown when project selected) */}
      {activeProjectId && (
        <div className="px-3 pb-2 border-b border-surface-100">
          <div className="px-3 py-1.5 mb-1">
            <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Workflows</span>
          </div>
          {workflowItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveView(item.key)}
              className={cn(
                'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium w-full transition-colors duration-150',
                activeView === item.key
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Projects list */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Projects</span>
          <span className="text-xs text-surface-400">{projects.length}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          {projects
            .filter((p) => p.status === 'active')
            .map((project) => (
              <button
                key={project.id}
                onClick={() => setActiveProject(project.id)}
                className={cn(
                  'flex flex-col items-start gap-1 px-3 py-2.5 rounded-lg text-left transition-colors duration-150 w-full',
                  activeProjectId === project.id
                    ? 'bg-brand-50 border border-brand-200'
                    : 'hover:bg-surface-50'
                )}
              >
                <span
                  className={cn(
                    'text-sm font-medium',
                    activeProjectId === project.id ? 'text-brand-800' : 'text-surface-800'
                  )}
                >
                  {truncate(project.title, 28)}
                </span>
                <span className={cn('text-xs px-1.5 py-0.5 rounded-full', getPhaseColor(project.currentPhase))}>
                  {project.currentPhase.charAt(0).toUpperCase() + project.currentPhase.slice(1)}
                </span>
                <div className="flex gap-0.5 w-full mt-1">
                  {(['analysis', 'design', 'development', 'implementation', 'evaluation'] as ADDIEPhase[]).map((phase) => (
                    <div
                      key={phase}
                      className={cn(
                        'h-1 flex-1 rounded-full',
                        project.phaseProgress[phase] === 100
                          ? 'bg-green-400'
                          : project.phaseProgress[phase] > 0
                          ? 'bg-brand-300'
                          : 'bg-surface-200'
                      )}
                    />
                  ))}
                </div>
              </button>
            ))}
        </div>
      </div>
    </aside>
  );
}
