'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface QuickGenerateProps {
  projectId: string;
}

export default function QuickGenerate({ projectId }: QuickGenerateProps) {
  const setActiveDevTool = useAppStore((s) => s.setActiveDevTool);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-surface-900 mb-2">Quick Generate</h2>
      <p className="text-surface-500 mb-6 max-w-sm">Full implementation coming in next update.</p>
      <Button variant="secondary" onClick={() => setActiveDevTool(null)}>Back</Button>
    </div>
  );
}
