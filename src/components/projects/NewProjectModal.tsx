'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { COURSE_TYPES, CourseType } from '@/lib/types';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface NewProjectModalProps {
  open: boolean;
  onClose: () => void;
}

export default function NewProjectModal({ open, onClose }: NewProjectModalProps) {
  const addProject = useAppStore((s) => s.addProject);
  const setActiveProject = useAppStore((s) => s.setActiveProject);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseType, setCourseType] = useState<CourseType>('self-paced');
  const [targetAudience, setTargetAudience] = useState('');
  const [industry, setIndustry] = useState('');
  const [tags, setTags] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const project = addProject({
      title: title.trim(),
      description: description.trim(),
      courseType,
      targetAudience: targetAudience.trim(),
      industry: industry.trim(),
      currentPhase: 'analysis',
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });

    setActiveProject(project.id);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCourseType('self-paced');
    setTargetAudience('');
    setIndustry('');
    setTags('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="New Course Project"
      className="max-w-xl"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            Create Project
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="np-title" className="block text-sm font-medium text-surface-700 mb-1">
            Course Title *
          </label>
          <input
            id="np-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Cybersecurity Fundamentals for Healthcare"
            className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-colors"
            required
          />
        </div>

        <div>
          <label htmlFor="np-desc" className="block text-sm font-medium text-surface-700 mb-1">
            Description
          </label>
          <textarea
            id="np-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the course goals and scope"
            rows={2}
            className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-colors resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="np-type" className="block text-sm font-medium text-surface-700 mb-1">
              Course Type
            </label>
            <select
              id="np-type"
              value={courseType}
              onChange={(e) => setCourseType(e.target.value as CourseType)}
              className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-colors bg-white"
            >
              {COURSE_TYPES.map((ct) => (
                <option key={ct.key} value={ct.key}>
                  {ct.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="np-industry" className="block text-sm font-medium text-surface-700 mb-1">
              Industry
            </label>
            <input
              id="np-industry"
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g., Healthcare, Finance"
              className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label htmlFor="np-audience" className="block text-sm font-medium text-surface-700 mb-1">
            Target Audience
          </label>
          <input
            id="np-audience"
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="e.g., New managers with 0-2 years experience"
            className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="np-tags" className="block text-sm font-medium text-surface-700 mb-1">
            Tags (comma-separated)
          </label>
          <input
            id="np-tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g., compliance, healthcare, blended"
            className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-colors"
          />
        </div>
      </form>
    </Modal>
  );
}
