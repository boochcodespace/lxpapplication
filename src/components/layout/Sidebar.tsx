'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { cn, getPhaseColor, truncate } from '@/lib/utils';

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
              </button>
            ))}
        </div>
      </div>
    </aside>
  );
}
