'use client';

import React from 'react';
import {
  DesignDocument,
  BLOOM_LEVELS,
  VARK_MODALITIES,
  BloomLevel,
} from '@/lib/types';
import { cn } from '@/lib/utils';

interface DesignDocStatsProps {
  doc: DesignDocument;
}

const bloomColors: Record<BloomLevel, string> = {
  remember: 'bg-gray-400',
  understand: 'bg-blue-400',
  apply: 'bg-green-400',
  analyze: 'bg-yellow-400',
  evaluate: 'bg-orange-400',
  create: 'bg-red-400',
};

const varkDotColors: Record<string, string> = {
  visual: 'bg-blue-500',
  auditory: 'bg-purple-500',
  readWrite: 'bg-green-500',
  kinesthetic: 'bg-orange-500',
};

function scoreColor(score: number): string {
  if (score < 40) return 'bg-red-500';
  if (score <= 70) return 'bg-yellow-500';
  return 'bg-green-500';
}

function scoreTextColor(score: number): string {
  if (score < 40) return 'text-red-700';
  if (score <= 70) return 'text-yellow-700';
  return 'text-green-700';
}

export default function DesignDocStats({ doc }: DesignDocStatsProps) {
  const smeCount = doc.slides.filter(
    (s) => s.designNotes.smeReviewFlag
  ).length;

  // Calculate bloom distribution from slides
  const computedBloom: Record<BloomLevel, number> = {
    remember: 0,
    understand: 0,
    apply: 0,
    analyze: 0,
    evaluate: 0,
    create: 0,
  };
  doc.slides.forEach((s) => {
    const level = s.designNotes.bloomLevel;
    if (level && computedBloom[level] !== undefined) {
      computedBloom[level]++;
    }
  });

  // Calculate VARK coverage from slides (check which modalities are mentioned)
  const computedVark: Record<string, boolean> = {
    visual: false,
    auditory: false,
    readWrite: false,
    kinesthetic: false,
  };
  doc.slides.forEach((s) => {
    if (s.learnerView.visualDescription.trim()) computedVark['visual'] = true;
    if (s.learnerView.audioScript.trim()) computedVark['auditory'] = true;
    if (s.learnerView.bodyText.trim() || s.learnerView.bulletPoints.length > 0)
      computedVark['readWrite'] = true;
    if (s.learnerView.interactionDescription.trim())
      computedVark['kinesthetic'] = true;
  });

  const totalBloom = Object.values(computedBloom).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-surface-50 border border-surface-200 rounded-lg">
      {/* Slide count */}
      <div className="flex items-center gap-1.5">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-surface-400"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
        <span className="text-xs font-medium text-surface-700">
          {doc.slides.length} slide{doc.slides.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-surface-200" />

      {/* Interactivity Score */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-surface-500">Interactivity</span>
        <div className="w-20 h-2 bg-surface-200 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all', scoreColor(doc.interactivityScore))}
            style={{ width: `${doc.interactivityScore}%` }}
          />
        </div>
        <span className={cn('text-xs font-semibold', scoreTextColor(doc.interactivityScore))}>
          {doc.interactivityScore}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-surface-200" />

      {/* Accessibility Compliance */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-surface-500">Accessibility</span>
        <div className="w-20 h-2 bg-surface-200 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all', scoreColor(doc.accessibilityCompliance))}
            style={{ width: `${doc.accessibilityCompliance}%` }}
          />
        </div>
        <span className={cn('text-xs font-semibold', scoreTextColor(doc.accessibilityCompliance))}>
          {doc.accessibilityCompliance}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-surface-200" />

      {/* Bloom's Distribution */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-surface-500">Bloom&apos;s</span>
        <div className="flex items-center gap-0.5">
          {BLOOM_LEVELS.map((bl) => {
            const count = computedBloom[bl.key];
            const pct = totalBloom > 0 ? (count / totalBloom) * 100 : 0;
            return (
              <div
                key={bl.key}
                className="relative group"
              >
                <div
                  className={cn('w-4 rounded-sm', bloomColors[bl.key])}
                  style={{ height: `${Math.max(pct > 0 ? 6 : 2, pct * 0.2)}px` }}
                  title={`${bl.label}: ${count}`}
                />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-surface-800 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                  {bl.label}: {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-surface-200" />

      {/* VARK Coverage */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-surface-500">VARK</span>
        <div className="flex items-center gap-1">
          {VARK_MODALITIES.map((v) => (
            <div
              key={v.key}
              className="relative group"
            >
              <div
                className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all',
                  computedVark[v.key]
                    ? cn(varkDotColors[v.key], 'text-white')
                    : 'bg-surface-200 text-surface-400'
                )}
              >
                {v.short}
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-surface-800 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                {v.label}: {computedVark[v.key] ? 'Covered' : 'Missing'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-surface-200" />

      {/* SME Reviews Needed */}
      <div className="flex items-center gap-1.5">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(smeCount > 0 ? 'text-amber-500' : 'text-surface-400')}
        >
          <path d="M12 9v4M12 17h.01" />
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <span
          className={cn(
            'text-xs font-medium',
            smeCount > 0 ? 'text-amber-700' : 'text-surface-500'
          )}
        >
          {smeCount} SME review{smeCount !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
