'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { cn, formatFileSize, getMaterialTypeIcon } from '@/lib/utils';
import Button from '@/components/ui/Button';

export default function MaterialViewer() {
  const selectedMaterialId = useAppStore((s) => s.selectedMaterialId);
  const materials = useAppStore((s) => s.materials);
  const setSelectedMaterial = useAppStore((s) => s.setSelectedMaterial);

  const material = selectedMaterialId ? materials.find((m) => m.id === selectedMaterialId) : null;

  if (!material) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-[480px] bg-white border-l border-surface-200 shadow-xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xl">{getMaterialTypeIcon(material.type)}</span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-surface-900 truncate">{material.name}</h3>
            <p className="text-xs text-surface-500">
              {material.type.toUpperCase()} &middot; {formatFileSize(material.size)}
            </p>
          </div>
        </div>
        <button
          onClick={() => setSelectedMaterial(null)}
          className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors"
          aria-label="Close viewer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Category & tags */}
        <div>
          <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Details</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-surface-500 w-20">Category:</span>
              <span className="text-xs text-surface-700 font-medium capitalize">
                {material.category.replace('-', ' ')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-surface-500 w-20">File:</span>
              <span className="text-xs text-surface-700 font-mono">{material.originalName}</span>
            </div>
            {material.tags.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-xs text-surface-500 w-20 pt-0.5">Tags:</span>
                <div className="flex flex-wrap gap-1">
                  {material.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-surface-100 text-surface-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {material.notes && (
          <div>
            <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Notes</h4>
            <p className="text-sm text-surface-700 leading-relaxed">{material.notes}</p>
          </div>
        )}

        {/* Analysis results */}
        {material.analysis && (
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider">AI Analysis</h4>

            {/* Summary */}
            <div className="p-3 rounded-lg bg-brand-50 border border-brand-200">
              <p className="text-sm text-brand-900 leading-relaxed">{material.analysis.summary}</p>
            </div>

            {/* Key Concepts */}
            <div>
              <h5 className="text-xs font-medium text-surface-600 mb-1.5">Key Concepts</h5>
              <div className="flex flex-wrap gap-1.5">
                {material.analysis.keyConcepts.map((concept) => (
                  <span key={concept} className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {concept}
                  </span>
                ))}
              </div>
            </div>

            {/* Suggested Objectives */}
            <div>
              <h5 className="text-xs font-medium text-surface-600 mb-1.5">Suggested Learning Objectives</h5>
              <ul className="space-y-1">
                {material.analysis.suggestedObjectives.map((obj, i) => (
                  <li key={i} className="text-xs text-surface-700 flex items-start gap-2">
                    <span className="text-brand-500 mt-0.5 shrink-0">&#8226;</span>
                    {obj}
                  </li>
                ))}
              </ul>
            </div>

            {/* Content Gaps */}
            {material.analysis.contentGaps.length > 0 && (
              <div>
                <h5 className="text-xs font-medium text-surface-600 mb-1.5">Content Gaps</h5>
                <ul className="space-y-1">
                  {material.analysis.contentGaps.map((gap, i) => (
                    <li key={i} className="text-xs text-amber-700 flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5 shrink-0">!</span>
                      {gap}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Glossary Terms */}
            {material.analysis.glossaryTerms.length > 0 && (
              <div>
                <h5 className="text-xs font-medium text-surface-600 mb-1.5">Glossary Terms</h5>
                <dl className="space-y-1">
                  {material.analysis.glossaryTerms.map((term) => (
                    <div key={term.term} className="flex gap-2">
                      <dt className="text-xs font-semibold text-surface-800 shrink-0">{term.term}:</dt>
                      <dd className="text-xs text-surface-600">{term.definition}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Accessibility Issues */}
            {material.analysis.accessibilityIssues.length > 0 && (
              <div>
                <h5 className="text-xs font-medium text-surface-600 mb-1.5">Accessibility Issues</h5>
                <ul className="space-y-1">
                  {material.analysis.accessibilityIssues.map((issue, i) => (
                    <li key={i} className="text-xs text-red-700 flex items-start gap-2">
                      <span className="text-red-500 mt-0.5 shrink-0">&#9888;</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-surface-200 px-5 py-3 flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => setSelectedMaterial(null)}>
          Close
        </Button>
      </div>
    </div>
  );
}
