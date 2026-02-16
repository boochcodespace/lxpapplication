'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { LearnerViewContent } from '@/lib/types';

interface LearnerViewProps {
  docId: string;
  slideId: string;
}

export default function LearnerView({ docId, slideId }: LearnerViewProps) {
  const doc = useAppStore((s) => s.designDocuments.find((d) => d.id === docId));
  const updateSlide = useAppStore((s) => s.updateDesignDocSlide);
  const [preview, setPreview] = useState(false);

  const slide = doc?.slides.find((s) => s.id === slideId);
  if (!slide || !doc) {
    return (
      <div className="flex items-center justify-center h-full text-surface-400 text-sm">
        No slide selected
      </div>
    );
  }

  const lv = slide.learnerView;

  const update = (field: keyof LearnerViewContent, value: LearnerViewContent[keyof LearnerViewContent]) => {
    updateSlide(docId, slideId, {
      learnerView: { ...lv, [field]: value },
    });
  };

  const handleBlur = (field: keyof LearnerViewContent) => (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    update(field, e.target.value);
  };

  // -- Bullet points helpers --
  const addBullet = () => {
    update('bulletPoints', [...lv.bulletPoints, '']);
  };
  const removeBullet = (idx: number) => {
    update('bulletPoints', lv.bulletPoints.filter((_, i) => i !== idx));
  };
  const updateBullet = (idx: number, value: string) => {
    const updated = [...lv.bulletPoints];
    updated[idx] = value;
    update('bulletPoints', updated);
  };

  // -- Accessibility features helpers --
  const addAccessibility = () => {
    update('accessibilityFeatures', [...lv.accessibilityFeatures, '']);
  };
  const removeAccessibility = (idx: number) => {
    update(
      'accessibilityFeatures',
      lv.accessibilityFeatures.filter((_, i) => i !== idx)
    );
  };
  const updateAccessibility = (idx: number, value: string) => {
    const updated = [...lv.accessibilityFeatures];
    updated[idx] = value;
    update('accessibilityFeatures', updated);
  };

  // ── Preview Mode ──
  if (preview) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-blue-600 rounded-t-lg">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
              {slide.slideNumber}
            </span>
            <h3 className="text-sm font-semibold text-white">Learner View</h3>
          </div>
          <button
            onClick={() => setPreview(false)}
            className="text-xs px-2 py-1 rounded bg-blue-500 text-blue-100 hover:bg-blue-400 transition-colors"
          >
            Edit Mode
          </button>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white border border-t-0 border-surface-200 rounded-b-lg">
          {lv.heading && (
            <h2 className="text-xl font-bold text-surface-900 mb-4">
              {lv.heading}
            </h2>
          )}

          {lv.bodyText && (
            <p className="text-sm text-surface-700 leading-relaxed mb-4 whitespace-pre-wrap">
              {lv.bodyText}
            </p>
          )}

          {lv.bulletPoints.filter((b) => b.trim()).length > 0 && (
            <ul className="list-disc list-inside space-y-1 mb-4">
              {lv.bulletPoints
                .filter((b) => b.trim())
                .map((bp, i) => (
                  <li key={i} className="text-sm text-surface-700">
                    {bp}
                  </li>
                ))}
            </ul>
          )}

          {lv.interactionDescription && (
            <div className="p-4 bg-brand-50 border border-brand-200 rounded-lg mb-4">
              <div className="flex items-center gap-1.5 mb-1.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600">
                  <path d="M15 15l-2 5L9 9l11 4-5 2z" />
                </svg>
                <span className="text-xs font-semibold text-brand-700 uppercase tracking-wide">
                  Interactive Element
                </span>
              </div>
              <p className="text-sm text-brand-800">{lv.interactionDescription}</p>
            </div>
          )}

          {lv.visualDescription && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <div className="flex items-center gap-1.5 mb-1.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                  Visual/Media
                </span>
              </div>
              <p className="text-sm text-blue-800">{lv.visualDescription}</p>
            </div>
          )}

          {lv.audioScript && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg mb-4">
              <div className="flex items-center gap-1.5 mb-1.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                  <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                  <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
                </svg>
                <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                  Audio/Narration
                </span>
              </div>
              <p className="text-sm text-purple-800 italic">{lv.audioScript}</p>
            </div>
          )}

          {lv.accessibilityFeatures.filter((a) => a.trim()).length > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-1.5 mb-1.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                  <circle cx="12" cy="4" r="2" />
                  <path d="M12 8v6M8 10l4 2 4-2M10 18l2-4 2 4" />
                </svg>
                <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                  Accessibility
                </span>
              </div>
              <ul className="list-disc list-inside space-y-0.5">
                {lv.accessibilityFeatures
                  .filter((a) => a.trim())
                  .map((af, i) => (
                    <li key={i} className="text-sm text-green-800">
                      {af}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Edit Mode ──
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-blue-600 rounded-t-lg">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
            {slide.slideNumber}
          </span>
          <h3 className="text-sm font-semibold text-white">Learner View</h3>
        </div>
        <button
          onClick={() => setPreview(true)}
          className="text-xs px-2 py-1 rounded bg-blue-500 text-blue-100 hover:bg-blue-400 transition-colors"
        >
          Preview
        </button>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white border border-t-0 border-surface-200 rounded-b-lg">
        {/* Heading */}
        <div>
          <label className="block text-xs font-medium text-surface-600 mb-1">
            Heading
          </label>
          <input
            type="text"
            defaultValue={lv.heading}
            onBlur={handleBlur('heading')}
            placeholder="Slide heading..."
            className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Body Text */}
        <div>
          <label className="block text-xs font-medium text-surface-600 mb-1">
            Body Text
          </label>
          <textarea
            defaultValue={lv.bodyText}
            onBlur={handleBlur('bodyText')}
            placeholder="Main content text..."
            rows={4}
            className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
          />
        </div>

        {/* Bullet Points */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-surface-600">
              Bullet Points
            </label>
            <button
              onClick={addBullet}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              + Add
            </button>
          </div>
          <div className="space-y-2">
            {lv.bulletPoints.map((bp, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-surface-400 text-xs">&#8226;</span>
                <input
                  type="text"
                  defaultValue={bp}
                  onBlur={(e) => updateBullet(idx, e.target.value)}
                  placeholder={`Bullet point ${idx + 1}...`}
                  className="flex-1 px-3 py-1.5 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => removeBullet(idx)}
                  className="text-surface-400 hover:text-red-500 transition-colors p-0.5"
                  aria-label="Remove bullet point"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            {lv.bulletPoints.length === 0 && (
              <p className="text-xs text-surface-400 italic">
                No bullet points yet. Click &quot;+ Add&quot; to create one.
              </p>
            )}
          </div>
        </div>

        {/* Interactive Element */}
        <div>
          <label className="block text-xs font-medium text-surface-600 mb-1">
            Interactive Element
          </label>
          <textarea
            defaultValue={lv.interactionDescription}
            onBlur={handleBlur('interactionDescription')}
            placeholder="Describe the interactive element (e.g., drag-and-drop, scenario choice, quiz question)..."
            rows={3}
            className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
          />
        </div>

        {/* Visual/Media Description */}
        <div>
          <label className="block text-xs font-medium text-surface-600 mb-1">
            Visual/Media Description
          </label>
          <textarea
            defaultValue={lv.visualDescription}
            onBlur={handleBlur('visualDescription')}
            placeholder="Describe visual elements (images, diagrams, videos, animations)..."
            rows={3}
            className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
          />
        </div>

        {/* Audio/Narration Script */}
        <div>
          <label className="block text-xs font-medium text-surface-600 mb-1">
            Audio/Narration Script
          </label>
          <textarea
            defaultValue={lv.audioScript}
            onBlur={handleBlur('audioScript')}
            placeholder="Write the voiceover or narration script for this slide..."
            rows={4}
            className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
          />
        </div>

        {/* Accessibility Features */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-surface-600">
              Accessibility Features
            </label>
            <button
              onClick={addAccessibility}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              + Add
            </button>
          </div>
          <div className="space-y-2">
            {lv.accessibilityFeatures.map((af, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 flex-shrink-0">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <path d="M22 4L12 14.01l-3-3" />
                </svg>
                <input
                  type="text"
                  defaultValue={af}
                  onBlur={(e) => updateAccessibility(idx, e.target.value)}
                  placeholder={`e.g., Alt text for image, Caption for video...`}
                  className="flex-1 px-3 py-1.5 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => removeAccessibility(idx)}
                  className="text-surface-400 hover:text-red-500 transition-colors p-0.5"
                  aria-label="Remove accessibility feature"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            {lv.accessibilityFeatures.length === 0 && (
              <p className="text-xs text-surface-400 italic">
                No accessibility features added. Click &quot;+ Add&quot; to specify alt text, captions, etc.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
