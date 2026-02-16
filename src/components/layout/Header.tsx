'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import SearchBar from '@/components/ui/SearchBar';
import { cn } from '@/lib/utils';

export default function Header() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const performSearch = useAppStore((s) => s.performSearch);
  const activeProjectId = useAppStore((s) => s.activeProjectId);
  const projects = useAppStore((s) => s.projects);

  const activeProject = activeProjectId ? projects.find((p) => p.id === activeProjectId) : null;

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-20 h-14 flex items-center gap-4 px-4 bg-white/80 backdrop-blur-sm border-b border-surface-200 transition-all duration-300',
        sidebarOpen ? 'left-64' : 'left-0'
      )}
    >
      {/* Sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-2 rounded-lg text-surface-500 hover:bg-surface-100 hover:text-surface-700 transition-colors"
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          {sidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          )}
        </svg>
      </button>

      {/* Page title */}
      {activeProject ? (
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-sm font-semibold text-surface-900 truncate">{activeProject.title}</h2>
        </div>
      ) : (
        <h2 className="text-sm font-semibold text-surface-900">Dashboard</h2>
      )}

      <div className="flex-1" />

      {/* Search */}
      <SearchBar onSearch={performSearch} className="w-64" />
    </header>
  );
}
