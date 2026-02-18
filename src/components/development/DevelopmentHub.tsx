'use client';

import React from 'react';

interface DevelopmentHubProps {
  projectId: string;
}

export default function DevelopmentHub({ projectId }: DevelopmentHubProps) {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-surface-900">Development Support</h1>
      <p className="text-sm text-surface-600 mt-1">
        Tools and resources to support the development phase of your course.
      </p>
    </div>
  );
}
