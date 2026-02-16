'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import {
  DesignNotesContent,
  BLOOM_LEVELS,
  BloomLevel,
  ZPDLevel,
} from '@/lib/types';
import { cn } from '@/lib/utils';

interface DesignNotesProps {
  docId: string;
  slideId: string;
}

const zpdConfig: Record<ZPDLevel, { label: string; color: string; bgColor: string; borderColor: string; description: string }> = {
  comfort: {
    label: 'Comfort Zone',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    description: 'Review / confidence building',
  },
  learning: {
    label: 'Learning Zone',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    description: 'Target zone -- growth with scaffolding',
  },
  stretch: {
    label: 'Stretch Zone',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    description: 'Challenging -- needs extensive support',
  },
};

export default function DesignNotes({ docId, slideId }: DesignNotesProps) {
  const doc = useAppStore((s) => s.designDocuments.find((d) => d.id === docId));
  const updateSlide = useAppStore((s) => s.updateDesignDocSlide);

  const slide = doc?.slides.find((s) => s.id === slideId);
  if (!slide || !doc) {
    return (
      <div className="flex items-center justify-center h-full text-surface-400 text-sm">
        No slide selected
      </div>
    );
  }

  const dn = slide.designNotes;

  const update = (field: keyof DesignNotesContent, value: DesignNotesContent[keyof DesignNotesContent]) => {
    updateSlide(docId, slideId, {
      designNotes: { ...dn, [field]: value },
    });
  };

  const handleBlur = (field: keyof DesignNotesContent) => (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    update(field, e.target.value);
  };

  // -- Asset requirements helpers --
  const addAsset = () => {
    update('assetRequirements', [...dn.assetRequirements, '']);
  };
  const removeAsset = (idx: number) => {
    update('assetRequirements', dn.assetRequirements.filter((_, i) => i !== idx));
  };
  const updateAsset = (idx: number, value: string) => {
    const updated = [...dn.assetRequirements];
    updated[idx] = value;
    update('assetRequirements', updated);
  };

  // -- Material references helpers --
  const addMaterialRef = () => {
    update('materialRefs', [...dn.materialRefs, '']);
  };
  const removeMaterialRef = (idx: number) => {
    update('materialRefs', dn.materialRefs.filter((_, i) => i !== idx));
  };
  const updateMaterialRef = (idx: number, value: string) => {
    const updated = [...dn.materialRefs];
    updated[idx] = value;
    update('materialRefs', updated);
  };

  const activeZpd = zpdConfig[dn.zpdLevel] || zpdConfig.learning;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-purple-600 rounded-t-lg">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-purple-500 flex items-center justify-center text-white text-xs font-bold">
            {slide.slideNumber}
          </span>
          <h3 className="text-sm font-semibold text-white">Design Notes</h3>
        </div>
        {/* ZPD indicator badge */}
        <span
          className={cn(
            'text-xs px-2 py-0.5 rounded-full font-medium',
            dn.zpdLevel === 'comfort' && 'bg-green-200 text-green-800',
            dn.zpdLevel === 'learning' && 'bg-blue-200 text-blue-800',
            dn.zpdLevel === 'stretch' && 'bg-orange-200 text-orange-800'
          )}
        >
          {activeZpd.label}
        </span>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white border border-t-0 border-surface-200 rounded-b-lg">
        {/* Instructional Rationale */}
        <div>
          <label className="block text-xs font-medium text-surface-600 mb-1">
            Instructional Rationale
          </label>
          <textarea
            defaultValue={dn.instructionalRationale}
            onBlur={handleBlur('instructionalRationale')}
            placeholder="Why is this slide here? What pedagogical purpose does it serve?"
            rows={3}
            className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y"
          />
        </div>

        {/* Multimodal Strategy */}
        <div>
          <label className="block text-xs font-medium text-surface-600 mb-1">
            Multimodal Strategy
          </label>
          <textarea
            defaultValue={dn.multimodalStrategy}
            onBlur={handleBlur('multimodalStrategy')}
            placeholder="Which VARK modalities are engaged and how?"
            rows={2}
            className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y"
          />
        </div>

        {/* Interactivity Specification */}
        <div>
          <label className="block text-xs font-medium text-surface-600 mb-1">
            Interactivity Specification
          </label>
          <textarea
            defaultValue={dn.interactivitySpec}
            onBlur={handleBlur('interactivitySpec')}
            placeholder="Technical specs for interactive elements (trigger, behavior, feedback)..."
            rows={2}
            className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y"
          />
        </div>

        {/* Development Notes */}
        <div>
          <label className="block text-xs font-medium text-surface-600 mb-1">
            Development Notes
          </label>
          <textarea
            defaultValue={dn.developmentNotes}
            onBlur={handleBlur('developmentNotes')}
            placeholder="Notes for the development team..."
            rows={2}
            className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y"
          />
        </div>

        {/* SME Review Section */}
        <div className={cn(
          'p-3 rounded-lg border',
          dn.smeReviewFlag
            ? 'bg-amber-50 border-amber-200'
            : 'bg-surface-50 border-surface-200'
        )}>
          <label className="flex items-center gap-2 cursor-pointer mb-2">
            <input
              type="checkbox"
              checked={dn.smeReviewFlag}
              onChange={(e) => update('smeReviewFlag', e.target.checked)}
              className="w-4 h-4 rounded border-surface-300 text-amber-600 focus:ring-amber-500"
            />
            <span className={cn(
              'text-xs font-medium',
              dn.smeReviewFlag ? 'text-amber-800' : 'text-surface-600'
            )}>
              Needs SME Review
            </span>
            {dn.smeReviewFlag && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                <path d="M12 9v4M12 17h.01" />
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            )}
          </label>
          {dn.smeReviewFlag && (
            <textarea
              defaultValue={dn.smeReviewNotes}
              onBlur={handleBlur('smeReviewNotes')}
              placeholder="What specifically needs SME verification?"
              rows={2}
              className="w-full px-3 py-2 text-sm border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-y bg-white"
            />
          )}
        </div>

        {/* Accessibility Implementation Notes */}
        <div>
          <label className="block text-xs font-medium text-surface-600 mb-1">
            Accessibility Implementation Notes
          </label>
          <textarea
            defaultValue={dn.accessibilityNotes}
            onBlur={handleBlur('accessibilityNotes')}
            placeholder="WCAG compliance notes, assistive tech considerations..."
            rows={2}
            className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y"
          />
        </div>

        {/* Branching Logic */}
        <div>
          <label className="block text-xs font-medium text-surface-600 mb-1">
            Branching Logic
          </label>
          <textarea
            defaultValue={dn.branchingLogic}
            onBlur={handleBlur('branchingLogic')}
            placeholder="If/then logic for navigation or scenario branching..."
            rows={2}
            className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y"
          />
        </div>

        {/* Assessment Scoring */}
        <div>
          <label className="block text-xs font-medium text-surface-600 mb-1">
            Assessment Scoring
          </label>
          <textarea
            defaultValue={dn.assessmentScoring}
            onBlur={handleBlur('assessmentScoring')}
            placeholder="Scoring rubric, pass criteria, point values..."
            rows={2}
            className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y"
          />
        </div>

        {/* Scaffolding Strategy */}
        <div>
          <label className="block text-xs font-medium text-surface-600 mb-1">
            Scaffolding Strategy
          </label>
          <textarea
            defaultValue={dn.scaffoldingStrategy}
            onBlur={handleBlur('scaffoldingStrategy')}
            placeholder="How is support provided and gradually removed?"
            rows={2}
            className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y"
          />
        </div>

        {/* Asset Requirements */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-surface-600">
              Asset Requirements
            </label>
            <button
              onClick={addAsset}
              className="text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              + Add
            </button>
          </div>
          <div className="space-y-2">
            {dn.assetRequirements.map((asset, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400 flex-shrink-0">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <path d="M14 2v6h6M12 18v-6M9 15h6" />
                </svg>
                <input
                  type="text"
                  defaultValue={asset}
                  onBlur={(e) => updateAsset(idx, e.target.value)}
                  placeholder={`e.g., Flowchart diagram, Stock photo of...`}
                  className="flex-1 px-3 py-1.5 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={() => removeAsset(idx)}
                  className="text-surface-400 hover:text-red-500 transition-colors p-0.5"
                  aria-label="Remove asset requirement"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            {dn.assetRequirements.length === 0 && (
              <p className="text-xs text-surface-400 italic">
                No assets specified. Click &quot;+ Add&quot; to list required assets.
              </p>
            )}
          </div>
        </div>

        {/* Material References */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-surface-600">
              Material References
            </label>
            <button
              onClick={addMaterialRef}
              className="text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              + Add
            </button>
          </div>
          <div className="space-y-2">
            {dn.materialRefs.map((ref, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400 flex-shrink-0">
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                </svg>
                <input
                  type="text"
                  defaultValue={ref}
                  onBlur={(e) => updateMaterialRef(idx, e.target.value)}
                  placeholder={`Source document or reference...`}
                  className="flex-1 px-3 py-1.5 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={() => removeMaterialRef(idx)}
                  className="text-surface-400 hover:text-red-500 transition-colors p-0.5"
                  aria-label="Remove material reference"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            {dn.materialRefs.length === 0 && (
              <p className="text-xs text-surface-400 italic">
                No references added. Click &quot;+ Add&quot; to link source materials.
              </p>
            )}
          </div>
        </div>

        {/* ZPD Level Selector */}
        <div>
          <label className="block text-xs font-medium text-surface-600 mb-2">
            ZPD Level
          </label>
          <div className="space-y-2">
            {(['comfort', 'learning', 'stretch'] as ZPDLevel[]).map((level) => {
              const cfg = zpdConfig[level];
              const isSelected = dn.zpdLevel === level;
              return (
                <label
                  key={level}
                  className={cn(
                    'flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all',
                    isSelected
                      ? cn(cfg.bgColor, cfg.borderColor)
                      : 'bg-white border-surface-200 hover:border-surface-300'
                  )}
                >
                  <input
                    type="radio"
                    name={`zpd-${slideId}`}
                    value={level}
                    checked={isSelected}
                    onChange={() => update('zpdLevel', level)}
                    className="sr-only"
                  />
                  <div
                    className={cn(
                      'w-3 h-3 rounded-full border-2 flex-shrink-0 transition-all',
                      isSelected
                        ? cn(
                            level === 'comfort' && 'border-green-500 bg-green-500',
                            level === 'learning' && 'border-blue-500 bg-blue-500',
                            level === 'stretch' && 'border-orange-500 bg-orange-500'
                          )
                        : 'border-surface-300 bg-white'
                    )}
                  />
                  <div className="min-w-0">
                    <span className={cn('text-xs font-semibold', isSelected ? cfg.color : 'text-surface-700')}>
                      {cfg.label}
                    </span>
                    <p className="text-[10px] text-surface-500">{cfg.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Bloom's Level Dropdown */}
        <div>
          <label className="block text-xs font-medium text-surface-600 mb-1">
            Bloom&apos;s Level
          </label>
          <select
            value={dn.bloomLevel}
            onChange={(e) => update('bloomLevel', e.target.value as BloomLevel)}
            className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
          >
            {BLOOM_LEVELS.map((bl) => (
              <option key={bl.key} value={bl.key}>
                {bl.label} ({bl.verbs.slice(0, 3).join(', ')})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
