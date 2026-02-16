'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import LearnerView from './LearnerView';
import DesignNotes from './DesignNotes';

interface DualTrackViewProps {
  docId: string;
}

export default function DualTrackView({ docId }: DualTrackViewProps) {
  const doc = useAppStore((s) => s.designDocuments.find((d) => d.id === docId));
  const addSlide = useAppStore((s) => s.addDesignDocSlide);
  const removeSlide = useAppStore((s) => s.removeDesignDocSlide);

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!doc) {
    return (
      <div className="flex items-center justify-center h-64 text-surface-400 text-sm">
        Design document not found.
      </div>
    );
  }

  const slides = doc.slides;
  const activeSlide = slides[activeSlideIndex] || null;

  const handleAddSlide = () => {
    const newSlide = addSlide(docId, {
      title: `Slide ${slides.length + 1}`,
      objectiveRef: '',
      learnerView: {
        heading: '',
        bodyText: '',
        bulletPoints: [],
        interactionDescription: '',
        visualDescription: '',
        audioScript: '',
        accessibilityFeatures: [],
      },
      designNotes: {
        instructionalRationale: '',
        multimodalStrategy: '',
        interactivitySpec: '',
        developmentNotes: '',
        smeReviewFlag: false,
        smeReviewNotes: '',
        accessibilityNotes: '',
        branchingLogic: '',
        assessmentScoring: '',
        scaffoldingStrategy: '',
        assetRequirements: [],
        materialRefs: [],
        zpdLevel: 'learning',
        bloomLevel: 'apply',
      },
    });
    // Navigate to the new slide
    setActiveSlideIndex(slides.length); // will be the index after the slide is added
  };

  const handleDeleteSlide = () => {
    if (!activeSlide) return;
    removeSlide(docId, activeSlide.id);
    setConfirmDelete(false);
    // Adjust index
    if (activeSlideIndex >= slides.length - 1) {
      setActiveSlideIndex(Math.max(0, slides.length - 2));
    }
  };

  return (
    <div className="flex h-full">
      {/* Left: Slide Navigation */}
      <div className="w-48 flex-shrink-0 border-r border-surface-200 bg-surface-50 flex flex-col">
        <div className="px-3 py-3 border-b border-surface-200">
          <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
            Slides
          </h4>
        </div>

        <div className="flex-1 overflow-y-auto py-1">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => {
                setActiveSlideIndex(idx);
                setConfirmDelete(false);
              }}
              className={cn(
                'w-full text-left px-3 py-2.5 transition-colors border-l-2',
                idx === activeSlideIndex
                  ? 'bg-brand-50 border-l-brand-600 text-brand-900'
                  : 'border-l-transparent text-surface-700 hover:bg-surface-100'
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0',
                    idx === activeSlideIndex
                      ? 'bg-brand-600 text-white'
                      : 'bg-surface-200 text-surface-600'
                  )}
                >
                  {slide.slideNumber}
                </span>
                <span className="text-xs font-medium truncate">
                  {slide.title || `Slide ${slide.slideNumber}`}
                </span>
              </div>
              {slide.designNotes.smeReviewFlag && (
                <div className="mt-1 ml-7">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                    SME Review
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Slide Actions */}
        <div className="p-3 border-t border-surface-200 space-y-2">
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={handleAddSlide}
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            }
          >
            Add Slide
          </Button>

          {activeSlide && (
            <>
              {confirmDelete ? (
                <div className="space-y-1.5">
                  <p className="text-[10px] text-red-600 text-center font-medium">
                    Delete slide {activeSlide.slideNumber}?
                  </p>
                  <div className="flex gap-1.5">
                    <Button
                      variant="danger"
                      size="sm"
                      fullWidth
                      onClick={handleDeleteSlide}
                    >
                      Confirm
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      fullWidth
                      onClick={() => setConfirmDelete(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => setConfirmDelete(true)}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  }
                >
                  Delete Slide
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Center: Dual Track Panels */}
      {activeSlide ? (
        <div className="flex-1 flex min-w-0">
          {/* Center-left: Learner View */}
          <div className="flex-1 min-w-0 p-4 overflow-hidden">
            <LearnerView docId={docId} slideId={activeSlide.id} />
          </div>

          {/* Center-right: Design Notes */}
          <div className="flex-1 min-w-0 p-4 overflow-hidden border-l border-surface-200">
            <DesignNotes docId={docId} slideId={activeSlide.id} />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-surface-400">
          <div className="text-center">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-3 text-surface-300"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
            <p className="text-sm font-medium text-surface-500 mb-1">No slides yet</p>
            <p className="text-xs text-surface-400 mb-3">
              Add your first slide to start building the design document.
            </p>
            <Button variant="primary" size="sm" onClick={handleAddSlide}>
              Add First Slide
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
