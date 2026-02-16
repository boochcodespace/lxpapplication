'use client';

import React from 'react';
import { Material } from '@/lib/types';
import { cn, formatFileSize, formatRelativeTime, getMaterialTypeIcon, truncate } from '@/lib/utils';

interface MaterialCardProps {
  material: Material;
  onSelect: (id: string) => void;
  isSelected?: boolean;
}

export default function MaterialCard({ material, onSelect, isSelected = false }: MaterialCardProps) {
  const categoryLabels: Record<string, string> = {
    'sme-content': 'SME Content',
    'existing-course': 'Existing Course',
    reference: 'Reference',
    'media-asset': 'Media Asset',
    template: 'Template',
    other: 'Other',
  };

  return (
    <button
      onClick={() => onSelect(material.id)}
      className={cn(
        'w-full text-left p-4 rounded-xl border transition-all duration-200 hover:shadow-sm',
        isSelected
          ? 'border-brand-300 bg-brand-50'
          : 'border-surface-200 bg-white hover:border-surface-300'
      )}
    >
      <div className="flex items-start gap-3">
        {/* File type icon */}
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-surface-100 text-lg shrink-0">
          {getMaterialTypeIcon(material.type)}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name */}
          <h4 className="text-sm font-medium text-surface-900 truncate">{material.name}</h4>

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-surface-500 uppercase">{material.type}</span>
            <span className="text-surface-300 text-xs">|</span>
            <span className="text-xs text-surface-500">{formatFileSize(material.size)}</span>
            <span className="text-surface-300 text-xs">|</span>
            <span className="text-xs text-surface-500">{categoryLabels[material.category]}</span>
          </div>

          {/* Notes preview */}
          {material.notes && (
            <p className="text-xs text-surface-500 mt-1 line-clamp-1">{truncate(material.notes, 80)}</p>
          )}

          {/* Tags */}
          {material.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {material.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-surface-100 text-surface-600">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Analysis badge */}
          {material.analysis && (
            <div className="mt-1.5">
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                Analyzed
              </span>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-xs text-surface-400 shrink-0">{formatRelativeTime(material.uploadedAt)}</span>
      </div>
    </button>
  );
}
