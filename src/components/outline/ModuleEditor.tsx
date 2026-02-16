'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { cn, generateId } from '@/lib/utils';
import { VARK_MODALITIES, BLOOM_LEVELS } from '@/lib/types';
import type { VARKModality, BloomLevel, ZPDLevel, LearningObjective } from '@/lib/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface ModuleEditorProps {
  projectId: string;
  moduleId: string;
  lessonId?: string;
}

const ASSESSMENT_TYPES = [
  { value: '', label: 'None' },
  { value: 'formative-quiz', label: 'Formative Quiz' },
  { value: 'scenario-based', label: 'Scenario-Based' },
  { value: 'performance-task', label: 'Performance Task' },
  { value: 'reflection', label: 'Reflection' },
];

const ZPD_OPTIONS: { value: ZPDLevel; label: string; color: string; description: string }[] = [
  { value: 'comfort', label: 'Comfort', color: 'text-green-600 border-green-300 bg-green-50', description: 'Tasks the learner can do independently' },
  { value: 'learning', label: 'Learning', color: 'text-blue-600 border-blue-300 bg-blue-50', description: 'Achievable with appropriate scaffolding' },
  { value: 'stretch', label: 'Stretch', color: 'text-orange-600 border-orange-300 bg-orange-50', description: 'Challenging, requires extensive support' },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">{children}</h4>
  );
}

function ObjectivesList({
  objectives,
  onChange,
}: {
  objectives: LearningObjective[];
  onChange: (objectives: LearningObjective[]) => void;
}) {
  const handleUpdate = (index: number, updates: Partial<LearningObjective>) => {
    const updated = objectives.map((obj, i) => (i === index ? { ...obj, ...updates } : obj));
    onChange(updated);
  };

  const handleAdd = () => {
    onChange([
      ...objectives,
      {
        id: generateId(),
        text: '',
        bloomLevel: 'apply' as BloomLevel,
        assessmentAligned: false,
        materialRefs: [],
      },
    ]);
  };

  const handleRemove = (index: number) => {
    onChange(objectives.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {objectives.map((obj, index) => (
        <div key={obj.id} className="rounded-lg border border-surface-200 p-3 space-y-2">
          <div className="flex items-start gap-2">
            <textarea
              rows={2}
              className="flex-1 rounded-md border border-surface-300 px-2.5 py-1.5 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
              placeholder="By the end of this module, learners will be able to..."
              value={obj.text}
              onChange={(e) => handleUpdate(index, { text: e.target.value })}
            />
            <button
              onClick={() => handleRemove(index)}
              className="p-1 rounded-md text-surface-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
              aria-label="Remove objective"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-surface-500">Bloom&apos;s:</label>
              <select
                className="rounded-md border border-surface-300 px-2 py-1 text-xs text-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                value={obj.bloomLevel}
                onChange={(e) => handleUpdate(index, { bloomLevel: e.target.value as BloomLevel })}
              >
                {BLOOM_LEVELS.map((b) => (
                  <option key={b.key} value={b.key}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-1.5 text-xs text-surface-600 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-surface-300 text-brand-600 focus:ring-brand-500"
                checked={obj.assessmentAligned}
                onChange={(e) => handleUpdate(index, { assessmentAligned: e.target.checked })}
              />
              Assessment aligned
            </label>
          </div>
        </div>
      ))}

      <button
        onClick={handleAdd}
        className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add Objective
      </button>
    </div>
  );
}

function ModalityCheckboxes({
  selected,
  onChange,
}: {
  selected: VARKModality[];
  onChange: (modalities: VARKModality[]) => void;
}) {
  const handleToggle = (key: VARKModality) => {
    if (selected.includes(key)) {
      onChange(selected.filter((m) => m !== key));
    } else {
      onChange([...selected, key]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {VARK_MODALITIES.map((m) => {
        const isSelected = selected.includes(m.key);
        return (
          <button
            key={m.key}
            type="button"
            onClick={() => handleToggle(m.key)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
              isSelected
                ? cn(m.color, 'border-current')
                : 'bg-surface-50 text-surface-500 border-surface-200 hover:bg-surface-100'
            )}
          >
            <span className="font-bold">{m.short}</span>
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

function ActivitiesList({
  activities,
  onChange,
}: {
  activities: string[];
  onChange: (activities: string[]) => void;
}) {
  const handleUpdate = (index: number, value: string) => {
    const updated = activities.map((a, i) => (i === index ? value : a));
    onChange(updated);
  };

  const handleAdd = () => {
    onChange([...activities, '']);
  };

  const handleRemove = (index: number) => {
    onChange(activities.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="text-xs text-surface-400 w-5 shrink-0 text-right">{index + 1}.</span>
          <input
            type="text"
            className="flex-1 rounded-md border border-surface-300 px-2.5 py-1.5 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            placeholder="Describe the activity..."
            value={activity}
            onChange={(e) => handleUpdate(index, e.target.value)}
          />
          <button
            onClick={() => handleRemove(index)}
            className="p-1 rounded-md text-surface-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
            aria-label="Remove activity"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}

      <button
        onClick={handleAdd}
        className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add Activity
      </button>
    </div>
  );
}

export default function ModuleEditor({ projectId, moduleId, lessonId }: ModuleEditorProps) {
  const getCourseOutline = useAppStore((s) => s.getCourseOutline);
  const updateModule = useAppStore((s) => s.updateModule);
  const removeModule = useAppStore((s) => s.removeModule);
  const addLesson = useAppStore((s) => s.addLesson);
  const updateLesson = useAppStore((s) => s.updateLesson);
  const removeLesson = useAppStore((s) => s.removeLesson);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const outline = getCourseOutline(projectId);
  if (!outline) return null;

  const mod = outline.modules.find((m) => m.id === moduleId);
  if (!mod) return null;

  const lesson = lessonId ? mod.lessons.find((l) => l.id === lessonId) : null;

  const handleAddLesson = () => {
    addLesson(projectId, moduleId, {
      title: 'New Lesson',
      description: '',
      duration: 15,
      objectives: [],
      modalities: [],
      zpdLevel: 'learning',
      activities: [],
      assessmentType: '',
      materialRefs: [],
      accessibilityNotes: [],
    });
  };

  const handleDeleteConfirm = () => {
    if (lessonId && lesson) {
      removeLesson(projectId, moduleId, lessonId);
    } else {
      removeModule(projectId, moduleId);
    }
    setDeleteConfirmOpen(false);
  };

  // ── Lesson editor ──
  if (lesson && lessonId) {
    return (
      <div className="p-6 space-y-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">
              Module {mod.order} &rsaquo; Lesson {lesson.order}
            </p>
            <h3 className="text-lg font-semibold text-surface-900 mt-0.5">{lesson.title || 'Untitled Lesson'}</h3>
          </div>
          <Button variant="danger" size="sm" onClick={() => setDeleteConfirmOpen(true)}>
            Delete Lesson
          </Button>
        </div>

        {/* Title */}
        <div>
          <SectionLabel>Title</SectionLabel>
          <input
            type="text"
            className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            placeholder="Lesson title"
            value={lesson.title}
            onBlur={(e) => updateLesson(projectId, moduleId, lessonId, { title: e.target.value })}
            onChange={(e) => updateLesson(projectId, moduleId, lessonId, { title: e.target.value })}
          />
        </div>

        {/* Description */}
        <div>
          <SectionLabel>Description</SectionLabel>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
            placeholder="Brief description of this lesson..."
            value={lesson.description}
            onBlur={(e) => updateLesson(projectId, moduleId, lessonId, { description: e.target.value })}
            onChange={(e) => updateLesson(projectId, moduleId, lessonId, { description: e.target.value })}
          />
        </div>

        {/* Duration */}
        <div>
          <SectionLabel>Duration (minutes)</SectionLabel>
          <input
            type="number"
            min={0}
            className="w-32 rounded-lg border border-surface-300 px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            value={lesson.duration}
            onBlur={(e) =>
              updateLesson(projectId, moduleId, lessonId, {
                duration: Math.max(0, parseInt(e.target.value) || 0),
              })
            }
            onChange={(e) =>
              updateLesson(projectId, moduleId, lessonId, {
                duration: Math.max(0, parseInt(e.target.value) || 0),
              })
            }
          />
        </div>

        {/* ZPD Level */}
        <div>
          <SectionLabel>ZPD Level</SectionLabel>
          <div className="space-y-2">
            {ZPD_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                  lesson.zpdLevel === opt.value ? opt.color : 'border-surface-200 hover:bg-surface-50'
                )}
              >
                <input
                  type="radio"
                  name="zpd-level"
                  className="mt-0.5 text-brand-600 focus:ring-brand-500"
                  checked={lesson.zpdLevel === opt.value}
                  onChange={() => updateLesson(projectId, moduleId, lessonId, { zpdLevel: opt.value })}
                />
                <div>
                  <span className="text-sm font-medium">{opt.label}</span>
                  <p className="text-xs text-surface-500 mt-0.5">{opt.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* VARK Modalities */}
        <div>
          <SectionLabel>VARK Modalities</SectionLabel>
          <ModalityCheckboxes
            selected={lesson.modalities}
            onChange={(modalities) => updateLesson(projectId, moduleId, lessonId, { modalities })}
          />
        </div>

        {/* Activities */}
        <div>
          <SectionLabel>Activities</SectionLabel>
          <ActivitiesList
            activities={lesson.activities}
            onChange={(activities) => updateLesson(projectId, moduleId, lessonId, { activities })}
          />
        </div>

        {/* Assessment Type */}
        <div>
          <SectionLabel>Assessment Type</SectionLabel>
          <select
            className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm text-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            value={lesson.assessmentType || ''}
            onChange={(e) => updateLesson(projectId, moduleId, lessonId, { assessmentType: e.target.value || undefined })}
          >
            {ASSESSMENT_TYPES.map((at) => (
              <option key={at.value} value={at.value}>
                {at.label}
              </option>
            ))}
          </select>
        </div>

        {/* Learning Objectives */}
        <div>
          <SectionLabel>Learning Objectives</SectionLabel>
          <ObjectivesList
            objectives={lesson.objectives}
            onChange={(objectives) => updateLesson(projectId, moduleId, lessonId, { objectives })}
          />
        </div>

        {/* Accessibility Notes */}
        <div>
          <SectionLabel>Accessibility Notes</SectionLabel>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
            placeholder="WCAG considerations, alt text requirements, caption needs..."
            value={lesson.accessibilityNotes.join('\n')}
            onBlur={(e) =>
              updateLesson(projectId, moduleId, lessonId, {
                accessibilityNotes: e.target.value
                  .split('\n')
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            onChange={(e) =>
              updateLesson(projectId, moduleId, lessonId, {
                accessibilityNotes: e.target.value
                  .split('\n')
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />
          <p className="text-[10px] text-surface-400 mt-1">One note per line</p>
        </div>

        {/* Delete confirmation modal */}
        <Modal
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          title="Delete Lesson"
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setDeleteConfirmOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleDeleteConfirm}>
                Delete
              </Button>
            </>
          }
        >
          <p className="text-sm text-surface-700">
            Are you sure you want to delete <span className="font-medium">&quot;{lesson.title}&quot;</span>? This action
            cannot be undone.
          </p>
        </Modal>
      </div>
    );
  }

  // ── Module editor ──
  return (
    <div className="p-6 space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Module {mod.order}</p>
          <h3 className="text-lg font-semibold text-surface-900 mt-0.5">{mod.title || 'Untitled Module'}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleAddLesson}>
            <svg className="w-3.5 h-3.5 -ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Lesson
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteConfirmOpen(true)}>
            Delete Module
          </Button>
        </div>
      </div>

      {/* Title */}
      <div>
        <SectionLabel>Title</SectionLabel>
        <input
          type="text"
          className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          placeholder="Module title"
          value={mod.title}
          onBlur={(e) => updateModule(projectId, moduleId, { title: e.target.value })}
          onChange={(e) => updateModule(projectId, moduleId, { title: e.target.value })}
        />
      </div>

      {/* Description */}
      <div>
        <SectionLabel>Description</SectionLabel>
        <textarea
          rows={3}
          className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
          placeholder="Brief description of this module..."
          value={mod.description}
          onBlur={(e) => updateModule(projectId, moduleId, { description: e.target.value })}
          onChange={(e) => updateModule(projectId, moduleId, { description: e.target.value })}
        />
      </div>

      {/* Assessment Strategy */}
      <div>
        <SectionLabel>Assessment Strategy</SectionLabel>
        <textarea
          rows={3}
          className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
          placeholder="How will learners be assessed in this module? (e.g., formative quizzes, scenario-based assessments, performance tasks)"
          value={mod.assessmentStrategy}
          onBlur={(e) => updateModule(projectId, moduleId, { assessmentStrategy: e.target.value })}
          onChange={(e) => updateModule(projectId, moduleId, { assessmentStrategy: e.target.value })}
        />
      </div>

      {/* VARK Modalities */}
      <div>
        <SectionLabel>VARK Modalities</SectionLabel>
        <ModalityCheckboxes
          selected={mod.modalities}
          onChange={(modalities) => updateModule(projectId, moduleId, { modalities })}
        />
      </div>

      {/* Learning Objectives */}
      <div>
        <SectionLabel>Learning Objectives</SectionLabel>
        <ObjectivesList
          objectives={mod.objectives}
          onChange={(objectives) => updateModule(projectId, moduleId, { objectives })}
        />
      </div>

      {/* Delete confirmation modal */}
      <Modal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Module"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-surface-700">
          Are you sure you want to delete <span className="font-medium">&quot;{mod.title}&quot;</span> and all its
          lessons? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
