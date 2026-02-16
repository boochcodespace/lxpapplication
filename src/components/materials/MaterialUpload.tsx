'use client';

import React, { useCallback, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { MaterialCategory } from '@/lib/types';
import { cn, getMaterialTypeFromMime } from '@/lib/utils';

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
  'text/rtf': ['.rtf'],
  'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'],
};

interface MaterialUploadProps {
  projectId?: string;
  onUploadComplete?: () => void;
}

export default function MaterialUpload({ projectId, onUploadComplete }: MaterialUploadProps) {
  const addMaterial = useAppStore((s) => s.addMaterial);
  const [dragOver, setDragOver] = useState(false);
  const [category, setCategory] = useState<MaterialCategory>('reference');
  const [uploading, setUploading] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setUploading(true);

      for (const file of Array.from(files)) {
        const materialType = getMaterialTypeFromMime(file.type, file.name);
        addMaterial({
          name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          originalName: file.name,
          type: materialType,
          category,
          size: file.size,
          mimeType: file.type || 'application/octet-stream',
          tags: [],
          notes: '',
          projectIds: projectId ? [projectId] : [],
          collectionIds: [],
          filePath: `/uploads/${file.name}`,
        });
      }

      setUploading(false);
      onUploadComplete?.();
    },
    [addMaterial, category, projectId, onUploadComplete]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div className="space-y-3">
      {/* Category selector */}
      <div>
        <label htmlFor="upload-category" className="block text-xs font-medium text-surface-600 mb-1">
          Material Category
        </label>
        <select
          id="upload-category"
          value={category}
          onChange={(e) => setCategory(e.target.value as MaterialCategory)}
          className="w-full rounded-lg border border-surface-300 px-3 py-1.5 text-sm bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
        >
          <option value="sme-content">SME Content</option>
          <option value="existing-course">Existing Course</option>
          <option value="reference">Reference Material</option>
          <option value="media-asset">Media Asset</option>
          <option value="template">Template</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-200 cursor-pointer',
          dragOver ? 'border-brand-400 bg-brand-50' : 'border-surface-300 hover:border-surface-400',
          uploading && 'pointer-events-none opacity-60'
        )}
        onClick={() => document.getElementById('file-upload-input')?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            document.getElementById('file-upload-input')?.click();
          }
        }}
      >
        <input
          id="file-upload-input"
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
          accept=".pdf,.docx,.pptx,.xlsx,.txt,.md,.rtf,.png,.jpg,.jpeg,.gif,.svg,.webp"
        />

        <svg
          className="mx-auto h-10 w-10 text-surface-400 mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>

        {uploading ? (
          <p className="text-sm text-surface-600">Uploading...</p>
        ) : (
          <>
            <p className="text-sm text-surface-700 font-medium">
              Drop files here or click to browse
            </p>
            <p className="text-xs text-surface-500 mt-1">
              PDF, DOCX, PPTX, XLSX, TXT, MD, RTF, Images
            </p>
          </>
        )}
      </div>
    </div>
  );
}
