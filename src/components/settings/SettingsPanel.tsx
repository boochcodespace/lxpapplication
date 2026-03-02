'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';

export default function SettingsPanel() {
  const userSettings = useAppStore((s) => s.userSettings);
  const updateUserSettings = useAppStore((s) => s.updateUserSettings);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Settings</h1>
        <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">
          Manage your preferences and application settings
        </p>
      </div>

      {/* Appearance */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-3">
          Appearance
        </h2>
        <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 divide-y divide-surface-200 dark:divide-surface-700">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-surface-900 dark:text-surface-100">Theme</p>
              <p className="text-xs text-surface-500 dark:text-surface-400">Switch between light and dark mode</p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-600 text-sm font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
            >
              {theme === 'dark' ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                  Light Mode
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                  Dark Mode
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* AI Agent Preferences */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-3">
          AI Agent Preferences
        </h2>
        <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 divide-y divide-surface-200 dark:divide-surface-700">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-surface-900 dark:text-surface-100">Default Course Type</p>
              <p className="text-xs text-surface-500 dark:text-surface-400">Preferred format for new course projects</p>
            </div>
            <select
              value={userSettings?.defaultCourseType ?? 'self-paced'}
              onChange={(e) => updateUserSettings({ defaultCourseType: e.target.value as any })}
              className="text-sm border border-surface-200 dark:border-surface-600 rounded-lg px-2 py-1 bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="self-paced">Self-Paced E-Learning</option>
              <option value="ilt">Instructor-Led Training</option>
              <option value="blended">Blended Learning</option>
              <option value="micro-learning">Micro-Learning</option>
              <option value="bootcamp">Bootcamp</option>
            </select>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-surface-900 dark:text-surface-100">Bloom's Target Level</p>
              <p className="text-xs text-surface-500 dark:text-surface-400">Default cognitive level for learning objectives</p>
            </div>
            <select
              value={userSettings?.defaultBloomTarget ?? 'apply'}
              onChange={(e) => updateUserSettings({ defaultBloomTarget: e.target.value as any })}
              className="text-sm border border-surface-200 dark:border-surface-600 rounded-lg px-2 py-1 bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="remember">Remember</option>
              <option value="understand">Understand</option>
              <option value="apply">Apply</option>
              <option value="analyze">Analyze</option>
              <option value="evaluate">Evaluate</option>
              <option value="create">Create</option>
            </select>
          </div>
        </div>
      </section>

      {/* About */}
      <section>
        <h2 className="text-sm font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-3">
          About
        </h2>
        <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 px-4 py-3">
          <p className="text-sm text-surface-700 dark:text-surface-300">
            <span className="font-medium">AI Course Development Agent</span> — Built with Next.js, TypeScript, TailwindCSS, and Zustand.
            Powered by ADDIE methodology, Bloom's Taxonomy, and instructional design best practices.
          </p>
        </div>
      </section>
    </div>
  );
}
