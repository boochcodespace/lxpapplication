'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import OutlineTree from '@/components/outline/OutlineTree';
import ModuleEditor from '@/components/outline/ModuleEditor';
import OutlineCharts from '@/components/outline/OutlineCharts';

interface OutlineBuilderProps {
  projectId: string;
}

export default function OutlineBuilder({ projectId }: OutlineBuilderProps) {
  const getCourseOutline = useAppStore((s) => s.getCourseOutline);
  const createCourseOutline = useAppStore((s) => s.createCourseOutline);
  const addModule = useAppStore((s) => s.addModule);
  const projects = useAppStore((s) => s.projects);

  const outline = getCourseOutline(projectId);
  const project = projects.find((p) => p.id === projectId);

  const [courseGoalInput, setCourseGoalInput] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const handleCreateOutline = () => {
    if (!courseGoalInput.trim()) return;
    createCourseOutline(projectId, courseGoalInput.trim());
    setCourseGoalInput('');
  };

  const handleAddModule = () => {
    const newModule = addModule(projectId, {
      title: 'New Module',
      description: '',
      duration: 0,
      objectives: [],
      assessmentStrategy: '',
      modalities: [],
      materialRefs: [],
    });
    setSelectedModuleId(newModule.id);
    setSelectedLessonId(null);
  };

  const handleSelectModule = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setSelectedLessonId(null);
  };

  const handleSelectLesson = (moduleId: string, lessonId: string) => {
    setSelectedModuleId(moduleId);
    setSelectedLessonId(lessonId);
  };

  // ── No outline yet: show creation screen ──
  if (!outline) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface-50 p-8">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-8">
            {/* Icon */}
            <div className="w-14 h-14 rounded-xl bg-brand-50 flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>

            <h2 className="text-xl font-semibold text-surface-900 mb-2">Create Course Outline</h2>
            <p className="text-sm text-surface-500 mb-6">
              Define the overarching goal for{' '}
              <span className="font-medium text-surface-700">{project?.title || 'this course'}</span>.
              This goal will guide the structure of your modules, lessons, and assessments.
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="course-goal" className="block text-sm font-medium text-surface-700 mb-1.5">
                  Course Goal
                </label>
                <textarea
                  id="course-goal"
                  rows={4}
                  className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
                  placeholder="e.g., Equip healthcare staff with the knowledge and skills to identify, prevent, and respond to cybersecurity threats in compliance with HIPAA regulations."
                  value={courseGoalInput}
                  onChange={(e) => setCourseGoalInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.metaKey) handleCreateOutline();
                  }}
                />
              </div>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={!courseGoalInput.trim()}
                onClick={handleCreateOutline}
              >
                Create Outline
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Outline exists: show three-column layout ──
  const totalDuration = outline.totalDuration;
  const moduleCount = outline.modules.length;
  const hours = Math.floor(totalDuration / 60);
  const mins = totalDuration % 60;
  const durationDisplay = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <div className="flex-1 flex flex-col bg-surface-50 min-h-0">
      {/* Top Bar */}
      <div className="bg-white border-b border-surface-200 px-5 py-3 flex items-center gap-4 shrink-0">
        {/* Course goal */}
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-surface-900 truncate">{outline.courseGoal}</h2>
          <p className="text-xs text-surface-500 mt-0.5">Course Outline v{outline.version}</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-surface-600">
            <svg className="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{durationDisplay}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-surface-600">
            <svg className="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
            <span className="font-medium">{moduleCount} module{moduleCount !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <Button variant="primary" size="sm" onClick={handleAddModule}>
          <svg className="w-4 h-4 -ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Module
        </Button>
      </div>

      {/* Three-column layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Outline Tree */}
        <div className="w-72 shrink-0 border-r border-surface-200 bg-white overflow-y-auto">
          <OutlineTree
            projectId={projectId}
            selectedModuleId={selectedModuleId}
            selectedLessonId={selectedLessonId}
            onSelectModule={handleSelectModule}
            onSelectLesson={handleSelectLesson}
          />
        </div>

        {/* Center: Editor */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          {selectedModuleId ? (
            <ModuleEditor
              projectId={projectId}
              moduleId={selectedModuleId}
              lessonId={selectedLessonId || undefined}
            />
          ) : (
            <div className="flex items-center justify-center h-full p-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-surface-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-surface-700">Select a module or lesson</p>
                <p className="text-xs text-surface-500 mt-1">Click on an item in the outline tree to edit it</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Charts */}
        <div className="w-80 shrink-0 border-l border-surface-200 bg-white overflow-y-auto">
          <OutlineCharts projectId={projectId} />
        </div>
      </div>
    </div>
  );
}
