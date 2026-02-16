import { MaterialType } from './types';

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getMaterialTypeFromMime(mimeType: string, fileName: string): MaterialType {
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('wordprocessingml') || fileName.endsWith('.docx')) return 'docx';
  if (mimeType.includes('presentationml') || fileName.endsWith('.pptx')) return 'pptx';
  if (mimeType.includes('spreadsheetml') || fileName.endsWith('.xlsx')) return 'xlsx';
  if (mimeType === 'text/plain' || fileName.endsWith('.txt')) return 'txt';
  if (mimeType === 'text/markdown' || fileName.endsWith('.md')) return 'md';
  if (mimeType === 'text/rtf' || fileName.endsWith('.rtf')) return 'rtf';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('image/')) return 'image';
  return 'other';
}

export function getMaterialTypeIcon(type: MaterialType): string {
  const icons: Record<MaterialType, string> = {
    pdf: '📄',
    docx: '📝',
    pptx: '📊',
    xlsx: '📈',
    txt: '📃',
    md: '📋',
    rtf: '📃',
    video: '🎬',
    audio: '🎧',
    url: '🔗',
    scorm: '📦',
    image: '🖼️',
    other: '📎',
  };
  return icons[type];
}

export function getPhaseColor(phase: string): string {
  const colors: Record<string, string> = {
    analysis: 'bg-blue-100 text-blue-800',
    design: 'bg-purple-100 text-purple-800',
    development: 'bg-amber-100 text-amber-800',
    implementation: 'bg-green-100 text-green-800',
    evaluation: 'bg-rose-100 text-rose-800',
  };
  return colors[phase] || 'bg-gray-100 text-gray-800';
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

export function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
