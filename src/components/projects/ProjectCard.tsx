'use client';

import React from 'react';
import { Project } from '@/lib/types';
import { cn, formatRelativeTime, getPhaseColor, truncate } from '@/lib/utils';
import ADDIEProgress from './ADDIEProgress';

interface ProjectCardProps {
  project: Project;
  onSelect: (id: string) => void;
  isActive?: boolean;
}

export default function ProjectCard({ project, onSelect, isActive = false }: ProjectCardProps) {
  const courseTypeLabels: Record<string, string> = {
    ilt: 'ILT',
    'self-paced': 'Self-Paced',
    blended: 'Blended',
    'micro-learning': 'Micro',
    bootcamp: 'Bootcamp',
    certification: 'Certification',
    'performance-support': 'Performance',
    'job-aid': 'Job Aid',
  };

  return (
    <button
      onClick={() => onSelect(project.id)}
      className={cn(
        'w-full text-left p-5 rounded-xl border transition-all duration-200 hover:shadow-md',
        isActive
          ? 'border-brand-300 bg-brand-50 shadow-sm'
          : 'border-surface-200 bg-white hover:border-surface-300'
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-semibold text-surface-900 leading-tight">
          {truncate(project.title, 50)}
        </h3>
        <span className={cn('text-xs px-2 py-0.5 rounded-full shrink-0', getPhaseColor(project.currentPhase))}>
          {project.currentPhase.charAt(0).toUpperCase() + project.currentPhase.slice(1)}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-surface-600 mb-3 line-clamp-2">{project.description}</p>

      {/* ADDIE progress bar */}
      <ADDIEProgress phaseProgress={project.phaseProgress} currentPhase={project.currentPhase} compact />

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-surface-500">
            {courseTypeLabels[project.courseType] || project.courseType}
          </span>
          <span className="text-surface-300">|</span>
          <span className="text-xs text-surface-500">{project.industry}</span>
        </div>
        <span className="text-xs text-surface-400">{formatRelativeTime(project.updatedAt)}</span>
      </div>

      {/* Tags */}
      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {project.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-surface-100 text-surface-600">
              {tag}
            </span>
          ))}
          {project.tags.length > 4 && (
            <span className="text-xs text-surface-400">+{project.tags.length - 4}</span>
          )}
        </div>
      )}
    </button>
  );
}
