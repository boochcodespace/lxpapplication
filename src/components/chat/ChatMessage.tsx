'use client';

import React from 'react';
import { ChatMessage as ChatMessageType } from '@/lib/types';
import { cn, formatRelativeTime } from '@/lib/utils';

interface ChatMessageProps {
  message: ChatMessageType;
}

/**
 * Parses simple markdown-like formatting into JSX.
 * Supports: **bold**, bullet lists (- or *), and newlines.
 */
function parseMessageContent(content: string): React.ReactNode {
  const lines = content.split('\n');

  return lines.map((line, lineIndex) => {
    const trimmed = line.trim();

    // Bullet list items: lines starting with - or *
    const bulletMatch = trimmed.match(/^[-*]\s+(.*)/);
    if (bulletMatch) {
      return (
        <div key={lineIndex} className="flex items-start gap-2 ml-2">
          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-50 shrink-0" />
          <span>{parseInlineFormatting(bulletMatch[1])}</span>
        </div>
      );
    }

    // Empty lines become spacing
    if (trimmed === '') {
      return <div key={lineIndex} className="h-2" />;
    }

    // Regular text line
    return (
      <div key={lineIndex}>{parseInlineFormatting(trimmed)}</div>
    );
  });
}

/**
 * Parses inline **bold** formatting within a string.
 */
function parseInlineFormatting(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, i) => {
    const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
    if (boldMatch) {
      return <strong key={i} className="font-semibold">{boldMatch[1]}</strong>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={cn(
        'flex items-end gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {/* Assistant avatar */}
      {isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center mb-5">
          <span className="text-xs font-bold text-brand-700">AI</span>
        </div>
      )}

      <div className={cn('flex flex-col max-w-[80%]', isUser ? 'items-end' : 'items-start')}>
        {/* Message bubble */}
        <div
          className={cn(
            'px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'bg-brand-600 text-white rounded-2xl rounded-br-md'
              : 'bg-white border border-surface-200 text-surface-900 rounded-2xl rounded-bl-md'
          )}
        >
          <div className="space-y-0.5">{parseMessageContent(message.content)}</div>
        </div>

        {/* Timestamp */}
        <span className="text-xs text-surface-500 mt-1 px-1">
          {formatRelativeTime(message.timestamp)}
        </span>
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-200 flex items-center justify-center mb-5">
          <span className="text-xs font-medium text-surface-600">You</span>
        </div>
      )}
    </div>
  );
}
