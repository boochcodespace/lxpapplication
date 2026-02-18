'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

// ── Icons ──

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function ChevronUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.375" />
    </svg>
  );
}

function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CheckboxIcon({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center w-4 h-4 rounded border shrink-0 mt-0.5',
        checked
          ? 'bg-brand-600 border-brand-600'
          : 'border-surface-400 bg-white'
      )}
    >
      {checked && <CheckIcon className="w-3 h-3 text-white" />}
    </span>
  );
}

// ── Category Icons ──

function ADDIEIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
    </svg>
  );
}

function BloomIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function LayersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
    </svg>
  );
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.499z" />
    </svg>
  );
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

// ── Types ──

interface Category {
  id: string;
  title: string;
  icon: React.FC<{ className?: string }>;
  keywords: string[];
}

const CATEGORIES: Category[] = [
  { id: 'addie', title: 'ADDIE Methodology', icon: ADDIEIcon, keywords: ['addie', 'analysis', 'design', 'development', 'implementation', 'evaluation', 'phases'] },
  { id: 'blooms', title: "Bloom's Taxonomy", icon: BloomIcon, keywords: ['bloom', 'taxonomy', 'remember', 'understand', 'apply', 'analyze', 'evaluate', 'create', 'verbs', 'cognitive'] },
  { id: 'andragogy', title: 'Adult Learning Principles', icon: UsersIcon, keywords: ['adult', 'andragogy', 'knowles', 'self-directed', 'experience', 'relevance', 'motivation'] },
  { id: 'vark', title: 'Multimodal Learning (VARK)', icon: LayersIcon, keywords: ['vark', 'visual', 'auditory', 'read', 'write', 'kinesthetic', 'multimodal', 'modality'] },
  { id: 'zpd', title: 'Zone of Proximal Development', icon: TargetIcon, keywords: ['zpd', 'zone', 'proximal', 'vygotsky', 'scaffolding', 'mko', 'gradual', 'release'] },
  { id: 'interactivity', title: 'Meaningful Interactivity', icon: ZapIcon, keywords: ['interactivity', 'interactive', 'engagement', 'scenario', 'branching', 'feedback', 'fake'] },
  { id: 'accessibility', title: 'Accessibility (WCAG 2.0)', icon: EyeIcon, keywords: ['accessibility', 'wcag', 'pour', 'perceivable', 'operable', 'understandable', 'robust', 'captions', 'contrast', 'alt text'] },
  { id: 'best-practices', title: 'Best Practices', icon: StarIcon, keywords: ['best', 'practices', 'smart', 'objectives', 'sequencing', 'chunking', 'udl', 'universal'] },
  { id: 'assessment', title: 'Assessment Principles', icon: ClipboardIcon, keywords: ['assessment', 'multiple choice', 'rubric', 'question', 'formative', 'summative', 'difficulty', 'blueprint'] },
  { id: 'course-types', title: 'Course Types Guide', icon: BookIcon, keywords: ['course', 'type', 'ilt', 'elearning', 'blended', 'micro', 'bootcamp', 'certification', 'performance', 'job aid'] },
];

const QUICK_REFS = [
  { label: "Bloom's Verbs", categoryId: 'blooms' },
  { label: 'WCAG Checklist', categoryId: 'accessibility' },
  { label: 'Question Types', categoryId: 'assessment' },
  { label: 'Chunk Sizes', categoryId: 'best-practices' },
];

// ── Callout Box ──

type CalloutVariant = 'tip' | 'warning' | 'note';

function Callout({ variant, children }: { variant: CalloutVariant; children: React.ReactNode }) {
  const styles: Record<CalloutVariant, { bg: string; border: string; icon: string; label: string }> = {
    tip: { bg: 'bg-brand-50', border: 'border-brand-200', icon: 'text-brand-600', label: 'Tip' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600', label: 'Warning' },
    note: { bg: 'bg-sky-50', border: 'border-sky-200', icon: 'text-sky-600', label: 'Note' },
  };
  const s = styles[variant];
  return (
    <div className={cn('rounded-xl border p-4 my-4', s.bg, s.border)}>
      <div className="flex items-start gap-3">
        <span className={cn('text-xs font-bold uppercase tracking-wide mt-0.5 shrink-0', s.icon)}>
          {s.label}
        </span>
        <div className="text-sm text-surface-700 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

// ── Styled Table ──

interface TableProps {
  headers: string[];
  rows: (string | React.ReactNode)[][];
}

function StyledTable({ headers, rows }: TableProps) {
  return (
    <div className="overflow-x-auto my-4 rounded-xl border border-surface-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface-50 border-b border-surface-200">
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-surface-600 uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={cn('border-b border-surface-100 last:border-0', ri % 2 === 0 ? 'bg-white' : 'bg-surface-50/50')}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-3 text-surface-700 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Expandable Section ──

function Expandable({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-surface-200 rounded-xl overflow-hidden my-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-surface-50 hover:bg-surface-100 transition-colors text-left"
      >
        <span className="text-sm font-semibold text-surface-800">{title}</span>
        {open ? <ChevronUpIcon className="w-4 h-4 text-surface-500" /> : <ChevronDownIcon className="w-4 h-4 text-surface-500" />}
      </button>
      {open && (
        <div className="px-4 py-4 border-t border-surface-200 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Interactive Checklist ──

function InteractiveChecklist({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const toggle = (i: number) => setChecked((prev) => ({ ...prev, [i]: !prev[i] }));
  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="space-y-2 my-4">
      {checkedCount > 0 && (
        <p className="text-xs text-brand-600 font-medium mb-3">
          {checkedCount} of {items.length} completed
        </p>
      )}
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => toggle(i)}
          className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-50 transition-colors text-left"
        >
          <CheckboxIcon checked={!!checked[i]} />
          <span className={cn('text-sm text-surface-700 leading-relaxed', checked[i] && 'line-through text-surface-400')}>
            {item}
          </span>
        </button>
      ))}
    </div>
  );
}

// ── Highlight helper ──

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 text-surface-900 rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ══════════════════════════════════════════════════════
// ARTICLE CONTENT COMPONENTS
// ══════════════════════════════════════════════════════

function ArticleADDIE({ searchQuery }: { searchQuery: string }) {
  const markdownContent = `# ADDIE Methodology

## Overview

ADDIE is the foundational framework for instructional design. It provides a systematic, five-phase process that ensures every course development project is grounded in evidence, properly structured, and continuously improved.

## Phases

| Phase | Purpose | Key Deliverables |
|---|---|---|
| Analysis | Identify learners, needs, and constraints | Learner persona, needs assessment, gap analysis |
| Design | Architect the learning experience | Learning objectives, course outline, assessment strategy |
| Development | Build all content, activities, and assessments | Lesson content, media assets, interactive activities |
| Implementation | Deliver the course and support facilitators | Facilitator guide, LMS configuration, pilot feedback |
| Evaluation | Measure effectiveness and iterate | Kirkpatrick levels 1–4, analytics, revision plan |`;

  return (
    <div>
      <h2 className="text-xl font-bold text-surface-900 mb-2">ADDIE Methodology</h2>
      <p className="text-sm text-surface-600 mb-4 leading-relaxed">
        ADDIE is the foundational framework for instructional design. It provides a systematic, five-phase process
        that ensures every course development project is grounded in evidence, properly structured, and continuously improved.
      </p>

      <StyledTable
        headers={['Phase', 'Purpose', 'Key Deliverables']}
        rows={[
          ['Analysis', 'Identify who the learners are, what they need, and what constraints exist', 'Learner persona, needs assessment, gap analysis, environmental scan'],
          ['Design', 'Architect the learning experience — objectives, structure, strategy', 'Learning objectives, course outline, assessment strategy, storyboard'],
          ['Development', 'Build all content, activities, and assessments', 'Lesson content, media assets, interactive activities, assessments'],
          ['Implementation', 'Deliver the course and support facilitators and learners', 'Facilitator guide, LMS configuration, pilot feedback'],
          ['Evaluation', 'Measure effectiveness and iterate', 'Kirkpatrick levels 1–4, learner analytics, revision plan'],
        ]}
      />

      <Callout variant="warning">
        Never skip Analysis. Designing without understanding the audience produces content that is technically
        accurate but pedagogically ineffective.
      </Callout>

      <h3 className="text-base font-semibold text-surface-800 mt-5 mb-3">Critical Design Principles</h3>
      <ul className="space-y-2 text-sm text-surface-700">
        <li className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
          <span><strong>Alignment is non-negotiable:</strong> Objectives, content, and assessments must form a coherent chain.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
          <span><strong>Performance outcomes</strong> over information delivery — ask "What will the learner do differently?"</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
          <span><strong>Scenario-based and experiential learning</strong> over passive knowledge transfer.</span>
        </li>
      </ul>

      <div className="mt-6">
        <CopyAsMarkdown content={markdownContent} />
      </div>
    </div>
  );
}

const BLOOM_COLORS: Record<string, string> = {
  Remember: 'bg-gray-100 text-gray-700',
  Understand: 'bg-blue-100 text-blue-800',
  Apply: 'bg-green-100 text-green-800',
  Analyze: 'bg-purple-100 text-purple-800',
  Evaluate: 'bg-amber-100 text-amber-800',
  Create: 'bg-rose-100 text-rose-800',
};

const BLOOM_DATA = [
  { level: 'Remember', definition: 'Retrieve relevant knowledge from long-term memory', verbs: ['define', 'list', 'recall', 'identify', 'name', 'recognize'] },
  { level: 'Understand', definition: 'Construct meaning from instructional messages', verbs: ['explain', 'summarize', 'paraphrase', 'classify', 'compare', 'describe'] },
  { level: 'Apply', definition: 'Carry out or use a procedure in a given situation', verbs: ['execute', 'implement', 'solve', 'demonstrate', 'use', 'apply'] },
  { level: 'Analyze', definition: 'Break material into parts and detect relationships', verbs: ['differentiate', 'organize', 'attribute', 'compare', 'deconstruct', 'examine'] },
  { level: 'Evaluate', definition: 'Make judgments based on criteria and standards', verbs: ['critique', 'judge', 'justify', 'assess', 'defend', 'prioritize'] },
  { level: 'Create', definition: 'Put elements together to form a novel, coherent whole', verbs: ['design', 'construct', 'produce', 'plan', 'compose', 'invent'] },
];

function ArticleBlooms() {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const selected = BLOOM_DATA.find((b) => b.level === selectedLevel);

  const markdownContent = `# Bloom's Taxonomy (Revised)

## Overview

Bloom's Taxonomy provides a hierarchical model of cognitive learning objectives. Use it to write learning objectives and calibrate assessment difficulty.

## Levels

| Level | Definition | Action Verbs |
|---|---|---|
| Remember | Retrieve relevant knowledge from long-term memory | define, list, recall, identify, name |
| Understand | Construct meaning from instructional messages | explain, summarize, paraphrase, classify |
| Apply | Carry out or use a procedure in a given situation | execute, implement, solve, demonstrate |
| Analyze | Break material into parts and detect relationships | differentiate, organize, compare, deconstruct |
| Evaluate | Make judgments based on criteria and standards | critique, judge, justify, assess, defend |
| Create | Put elements together to form a novel, coherent whole | design, construct, produce, plan, compose |`;

  return (
    <div>
      <h2 className="text-xl font-bold text-surface-900 mb-2">Bloom's Taxonomy (Revised)</h2>
      <p className="text-sm text-surface-600 mb-4 leading-relaxed">
        Bloom's Taxonomy provides a hierarchical model of cognitive learning objectives — from basic recall
        to complex creation. Use it to write learning objectives, design assessments, and calibrate difficulty.
      </p>

      <StyledTable
        headers={['Level', 'Definition', 'Action Verbs']}
        rows={BLOOM_DATA.map((b) => [
          <span key={b.level} className={cn('text-xs font-semibold px-2 py-1 rounded-full', BLOOM_COLORS[b.level])}>
            {b.level}
          </span>,
          b.definition,
          b.verbs.slice(0, 4).join(', '),
        ])}
      />

      <Callout variant="note">
        Most professional training should target Apply or above. Reserve Remember and Understand for
        prerequisite knowledge checks only.
      </Callout>

      <h3 className="text-base font-semibold text-surface-800 mt-5 mb-3">Interactive Verb Picker</h3>
      <p className="text-xs text-surface-500 mb-3">Click a level to explore its action verbs:</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {BLOOM_DATA.map((b) => (
          <button
            key={b.level}
            onClick={() => setSelectedLevel(selectedLevel === b.level ? null : b.level)}
            className={cn(
              'text-sm font-medium px-4 py-2 rounded-lg border transition-all',
              selectedLevel === b.level
                ? 'border-brand-400 ring-2 ring-brand-200 ' + BLOOM_COLORS[b.level]
                : 'border-surface-200 bg-white hover:border-brand-300 hover:bg-brand-50 text-surface-700'
            )}
          >
            {b.level}
          </button>
        ))}
      </div>
      {selected && (
        <div className={cn('rounded-xl p-4 border', BLOOM_COLORS[selected.level], 'border-current/20')}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2">{selected.level} — Action Verbs</p>
          <div className="flex flex-wrap gap-2">
            {selected.verbs.map((verb) => (
              <span key={verb} className="text-sm font-medium bg-white/70 border border-current/20 px-3 py-1 rounded-full">
                {verb}
              </span>
            ))}
          </div>
          <p className="text-xs mt-3 opacity-75">{selected.definition}</p>
        </div>
      )}

      <div className="mt-6">
        <CopyAsMarkdown content={markdownContent} />
      </div>
    </div>
  );
}

const ANDRAGOGY_PRINCIPLES = [
  {
    icon: '🧭',
    name: 'Self-Directed',
    description: 'Adults want control over their learning path. Offer choices, not mandates.',
    tip: 'Design pathways with optional modules, learner-controlled pacing, and varied content formats.',
  },
  {
    icon: '🏗️',
    name: 'Experience-Based',
    description: 'Adults bring prior knowledge. Build on it; do not ignore it.',
    tip: 'Use pre-assessments to surface prior knowledge. Connect new content to what learners already know.',
  },
  {
    icon: '🎯',
    name: 'Relevance-Oriented',
    description: 'Adults need to know why something matters to their role. Connect every concept to real-world application.',
    tip: 'Open every module with "Why This Matters" — a direct connection to the learner\'s job responsibilities.',
  },
  {
    icon: '🔍',
    name: 'Problem-Centered',
    description: 'Adults prefer learning organized around problems, not subjects. Use case studies and scenarios.',
    tip: 'Structure modules around workplace problems, not content categories. Ask: "What problem does this solve?"',
  },
  {
    icon: '💪',
    name: 'Internally Motivated',
    description: 'Intrinsic motivators (mastery, autonomy, purpose) outperform extrinsic ones for sustained learning.',
    tip: 'Avoid overloading on badges and points. Instead, connect learning to career growth and real impact.',
  },
  {
    icon: '🤝',
    name: 'Respect',
    description: 'Adults need to feel their time and intelligence are respected. Avoid patronizing content.',
    tip: 'Write at the learner\'s level, skip obvious explanations, and provide meaningful — not busy — activities.',
  },
];

function ArticleAndragogy() {
  const markdownContent = `# Adult Learning Principles (Andragogy — Knowles)

Adults learn differently from children. Respect these six principles when designing for adult learners:

1. **Self-directed** — Adults want control over their learning path. Offer choices, not mandates.
2. **Experience-based** — Adults bring prior knowledge. Build on it; don't ignore it.
3. **Relevance-oriented** — Adults need to know why something matters to their role. Connect every concept to real-world application.
4. **Problem-centered** — Adults prefer learning organized around problems, not subjects. Use case studies and scenarios.
5. **Internally motivated** — Intrinsic motivators (mastery, autonomy, purpose) outperform extrinsic ones for sustained learning.
6. **Respect** — Adults need to feel their time and intelligence are respected. Avoid patronizing content.`;

  return (
    <div>
      <h2 className="text-xl font-bold text-surface-900 mb-2">Adult Learning Principles (Andragogy)</h2>
      <p className="text-sm text-surface-600 mb-5 leading-relaxed">
        Andragogy, developed by Malcolm Knowles, describes how adults learn differently from children.
        These six principles should inform every decision in course design.
      </p>

      <div className="space-y-3">
        {ANDRAGOGY_PRINCIPLES.map((p) => (
          <Expandable key={p.name} title={`${p.icon}  ${p.name}`}>
            <p className="text-sm text-surface-700 mb-3">{p.description}</p>
            <div className="flex items-start gap-2 bg-brand-50 rounded-lg px-3 py-2 border border-brand-100">
              <span className="text-xs font-semibold text-brand-600 shrink-0 mt-0.5">Application:</span>
              <p className="text-xs text-brand-800">{p.tip}</p>
            </div>
          </Expandable>
        ))}
      </div>

      <div className="mt-6">
        <CopyAsMarkdown content={markdownContent} />
      </div>
    </div>
  );
}

const VARK_DATA = [
  {
    modality: 'Visual (V)',
    color: 'bg-blue-100 text-blue-800',
    description: 'Learning through seeing',
    examples: 'Charts, diagrams, infographics, videos, flowcharts, step-by-step demonstrations, color-coding, mind maps',
  },
  {
    modality: 'Auditory (A)',
    color: 'bg-purple-100 text-purple-800',
    description: 'Learning through hearing',
    examples: 'Narration, discussions, podcasts, verbal explanations, audio summaries, think-aloud walkthroughs, group dialogue',
  },
  {
    modality: 'Read/Write (R)',
    color: 'bg-green-100 text-green-800',
    description: 'Learning through text',
    examples: 'Written content, articles, instructions, note-taking opportunities, glossaries, written case studies, journaling',
  },
  {
    modality: 'Kinesthetic (K)',
    color: 'bg-orange-100 text-orange-800',
    description: 'Learning through doing',
    examples: 'Hands-on activities, simulations, role-playing, interactive practice, drag-and-drop exercises, lab work, projects',
  },
];

function ArticleVARK() {
  const markdownContent = `# Multimodal Learning (VARK Framework)

Research shows 66% of learners prefer multimodal approaches. Engaging multiple sensory channels improves retention and comprehension.

## The Four Modalities

| Modality | Description | Content Examples |
|---|---|---|
| Visual (V) | Learning through seeing | Charts, diagrams, infographics, videos, flowcharts |
| Auditory (A) | Learning through hearing | Narration, discussions, podcasts, verbal explanations |
| Read/Write (R) | Learning through text | Written content, articles, instructions, note-taking |
| Kinesthetic (K) | Learning through doing | Hands-on activities, simulations, role-playing |

## Design Rules

1. Include elements from at least 2–3 modalities in each learning experience.
2. Lead with the modality that best fits the content type.
3. Provide alternatives, not duplicates.
4. Label modality types in design documents.`;

  return (
    <div>
      <h2 className="text-xl font-bold text-surface-900 mb-2">Multimodal Learning (VARK)</h2>
      <p className="text-sm text-surface-600 mb-4 leading-relaxed">
        Research shows 66% of learners prefer multimodal approaches. Engaging multiple sensory channels improves
        retention, comprehension, and transfer.
      </p>

      <StyledTable
        headers={['Modality', 'Description', 'Content Examples']}
        rows={VARK_DATA.map((v) => [
          <span key={v.modality} className={cn('text-xs font-semibold px-2 py-1 rounded-full', v.color)}>
            {v.modality}
          </span>,
          v.description,
          v.examples,
        ])}
      />

      <Callout variant="tip">
        Include elements from at least 2–3 modalities in each learning experience. No module should rely on a single modality.
      </Callout>

      <h3 className="text-base font-semibold text-surface-800 mt-5 mb-3">Multimodal Design Rules</h3>
      <ol className="space-y-2 text-sm text-surface-700 list-none">
        {[
          'Include elements from at least 2–3 modalities per learning experience.',
          'Lead with the modality that best fits the content type: procedural tasks → Kinesthetic + Visual; conceptual understanding → Visual + Read/Write; soft skills → Auditory + Kinesthetic.',
          'Provide alternatives, not duplicates. A transcript is an alternative to audio. A video of the same text read aloud adds no new channel.',
          'Label modality types in design documents so developers and reviewers can verify coverage.',
        ].map((rule, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-600 text-white text-xs font-bold shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span>{rule}</span>
          </li>
        ))}
      </ol>

      <div className="mt-6">
        <CopyAsMarkdown content={markdownContent} />
      </div>
    </div>
  );
}

function ArticleZPD() {
  const markdownContent = `# Zone of Proximal Development (ZPD)

Vygotsky's ZPD defines the space between what a learner can do independently and what they cannot do even with help. Effective instruction targets this zone.

## Three Zones

| Zone | Description | Instructional Use |
|---|---|---|
| Comfort Zone | Tasks learners can do independently | Use for warm-up and confidence building |
| Learning Zone (ZPD) | Achievable with appropriate scaffolding | TARGET THIS ZONE — where growth happens |
| Frustration Zone | Too difficult even with help | Avoid, or provide extensive modeling first |

## Scaffolding Strategies

- Worked examples
- Partial completion
- Hints and prompts
- Checklists and job aids
- Peer support
- Chunking

## Gradual Release: "I do, We do, You do"

1. I do (Modeling): Instructor demonstrates while thinking aloud
2. We do (Guided Practice): Learners attempt with instructor support
3. You do (Independent Practice): Learners perform independently`;

  return (
    <div>
      <h2 className="text-xl font-bold text-surface-900 mb-2">Zone of Proximal Development (ZPD)</h2>
      <p className="text-sm text-surface-600 mb-4 leading-relaxed">
        Vygotsky's ZPD defines the space between what a learner can do independently and what they cannot do even
        with help. Effective instruction targets the learning zone with appropriate scaffolding.
      </p>

      <StyledTable
        headers={['Zone', 'Description', 'Instructional Use']}
        rows={[
          ['Comfort Zone (below ZPD)', 'Tasks learners can do independently', 'Use for warm-up, review, and confidence building. Do not spend significant time here.'],
          [
            <span key="learning" className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
              Learning Zone (within ZPD)
            </span>,
            'Achievable with appropriate scaffolding',
            'TARGET THIS ZONE. This is where growth happens.',
          ],
          ['Frustration Zone (beyond ZPD)', 'Too difficult even with help', 'Avoid, or provide extensive modeling and worked examples before attempting.'],
        ]}
      />

      <h3 className="text-base font-semibold text-surface-800 mt-5 mb-3">Scaffolding Strategies</h3>
      <InteractiveChecklist
        items={[
          'Worked examples — Show complete solutions before asking learners to solve independently',
          'Partial completion — Provide partially completed work for learners to finish',
          'Hints and prompts — Offer graduated hints rather than full answers',
          'Checklists and job aids — External memory supports that fade over time',
          'Peer support — Pair less experienced learners with more experienced ones',
          'Chunking — Break complex tasks into smaller, manageable steps',
        ]}
      />

      <h3 className="text-base font-semibold text-surface-800 mt-5 mb-3">Gradual Release of Responsibility</h3>
      <div className="grid grid-cols-3 gap-3 my-4">
        {[
          { step: 'I Do', subtitle: 'Modeling', desc: 'Instructor demonstrates while thinking aloud', color: 'bg-brand-50 border-brand-200' },
          { step: 'We Do', subtitle: 'Guided Practice', desc: 'Learners attempt with instructor support and feedback', color: 'bg-purple-50 border-purple-200' },
          { step: 'You Do', subtitle: 'Independent Practice', desc: 'Learners perform independently with minimal support', color: 'bg-green-50 border-green-200' },
        ].map((item) => (
          <div key={item.step} className={cn('rounded-xl border p-4 text-center', item.color)}>
            <p className="text-lg font-bold text-surface-800">{item.step}</p>
            <p className="text-xs font-semibold text-surface-600 mb-1">{item.subtitle}</p>
            <p className="text-xs text-surface-600">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <CopyAsMarkdown content={markdownContent} />
      </div>
    </div>
  );
}

function ArticleInteractivity() {
  const markdownContent = `# Meaningful Interactivity Standards

Not all interactivity is created equal. The goal is cognitive engagement, not mouse clicks.

## Criteria for Meaningful Interactivity

| Criterion | Description |
|---|---|
| Decisions with real consequences | The learner's choice changes what happens next |
| Trade-offs under constraints | The learner must prioritize — forcing critical thinking |
| Explanatory feedback | Feedback explains why, not just "Correct!" |
| Scenario branching | Choices lead to different paths and outcomes |
| Real-world ambiguity | Practice mirrors the messiness of actual work |
| Reflection + revision | Learners get opportunities to reflect and revise |

## The Interactivity Litmus Test

Ask: "Does this interaction reveal something the learner didn't see before?"
- YES → Keep it.
- NO → Redesign or remove it.

## What to Avoid: "Fake Interactivity"

- Clicking "Next" to advance
- Cosmetic drag-and-drop with no consequence
- Hidden text in accordions (click-to-reveal with no decision)
- Hover effects that just display definitions
- Mandatory video watching with no task attached
- Knowledge checks with obvious correct answers`;

  return (
    <div>
      <h2 className="text-xl font-bold text-surface-900 mb-2">Meaningful Interactivity Standards</h2>
      <p className="text-sm text-surface-600 mb-4 leading-relaxed">
        Not all interactivity is created equal. The goal is cognitive engagement, not mouse clicks.
        Every interactive element must challenge the learner to think.
      </p>

      <StyledTable
        headers={['Criterion', 'Description']}
        rows={[
          ['Decisions with real consequences', "The learner's choice changes what happens next. A wrong decision leads to a realistic negative outcome, not just a 'try again' message."],
          ['Trade-offs under constraints', 'The learner must prioritize — they cannot have everything. This forces critical thinking.'],
          ['Explanatory feedback', 'Feedback explains why an answer is correct or incorrect, not just "Correct!" or "Incorrect."'],
          ['Scenario branching', 'Choices lead to different paths, outcomes, or consequences.'],
          ['Real-world ambiguity', 'Practice mirrors the messiness of actual work — incomplete information, competing priorities, gray areas.'],
          ['Reflection + revision', 'Learners get opportunities to reflect on their choices and revise their approach.'],
        ]}
      />

      <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 my-4">
        <p className="text-sm font-semibold text-brand-800 mb-1">The Interactivity Litmus Test</p>
        <p className="text-sm text-brand-700">
          Ask: <em>"Does this interaction reveal something the learner did not see before?"</em>
        </p>
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
            <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs">Y</span>
            YES — Keep it.
          </div>
          <div className="flex items-center gap-2 text-sm text-red-700 font-medium">
            <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-xs">N</span>
            NO — Redesign or remove it.
          </div>
        </div>
      </div>

      <Callout variant="warning">
        <strong>Avoid "Fake Interactivity":</strong> Clicking Next to advance, cosmetic drag-and-drop,
        click-to-reveal accordions without decisions, hover-only definitions, mandatory videos with no task
        attached, and knowledge checks with obviously correct answers.
      </Callout>

      <div className="mt-6">
        <CopyAsMarkdown content={markdownContent} />
      </div>
    </div>
  );
}

function ArticleAccessibility() {
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  const checklistItems = [
    'All images have descriptive alt text',
    'All videos have accurate captions and transcripts',
    'Color contrast meets AA minimums (4.5:1 for normal text, 3:1 for large text)',
    'No information is conveyed by color alone',
    'All interactive elements are keyboard accessible',
    'Reading level is appropriate for the audience',
    'Content structure uses proper heading hierarchy (H1 → H2 → H3)',
    'Links have descriptive text (not "click here")',
    'Tables have proper headers and scope attributes',
    'Forms have associated labels',
    'Error messages are clear and suggest corrections',
  ];

  const toggle = (i: number) => setCheckedItems((prev) => ({ ...prev, [i]: !prev[i] }));
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  const markdownContent = `# Accessibility Standards (WCAG 2.0 — Level AA)

Accessibility is not an afterthought. Design for universal access from the start.

## Four Core Principles (POUR)

### Perceivable
- Text alternatives for non-text content (alt text, descriptions)
- Captions and transcripts for all audio/video
- Minimum color contrast: 4.5:1 for normal text, 3:1 for large text
- Never use color as the sole means of conveying information

### Operable
- All functionality available via keyboard alone
- Users can adjust or extend time limits
- No content flashing more than 3 times per second
- Clear headings, skip navigation links, logical tab order

### Understandable
- Write at appropriate reading level; define technical terms
- Consistent navigation, no unexpected context changes
- Clear labels, error messages, and error prevention

### Robust
- Semantic HTML, ARIA labels where needed
- Clean, well-structured markup
- Roles, states, and properties are programmatically determinable`;

  const pourSections = [
    {
      label: 'Perceivable',
      color: 'bg-blue-50 border-blue-200',
      items: [
        'Text alternatives for non-text content (alt text, descriptions for complex visuals)',
        'Captions and transcripts for all audio and video content',
        'Content can be presented in different ways without losing meaning',
        'Minimum 4.5:1 color contrast for normal text, 3:1 for large text (18pt+ or 14pt+ bold)',
        'Never use color as the sole means of conveying information',
      ],
    },
    {
      label: 'Operable',
      color: 'bg-green-50 border-green-200',
      items: [
        'All functionality available via keyboard alone',
        'Users can adjust or extend time limits',
        'No content flashing more than 3 times per second',
        'Clear headings, skip navigation links, logical tab order',
        'Visible keyboard focus on all interactive elements',
      ],
    },
    {
      label: 'Understandable',
      color: 'bg-purple-50 border-purple-200',
      items: [
        'Write at appropriate reading level for audience; define technical terms',
        'Consistent navigation; no unexpected context changes',
        'Clear labels, error messages, and error prevention',
        'Use simple sentence structures; avoid unnecessary jargon',
      ],
    },
    {
      label: 'Robust',
      color: 'bg-amber-50 border-amber-200',
      items: [
        'Semantic HTML, ARIA labels where needed',
        'Clean, well-structured markup',
        'Roles, states, and properties are programmatically determinable',
      ],
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-surface-900 mb-2">Accessibility Standards (WCAG 2.0)</h2>
      <p className="text-sm text-surface-600 mb-4 leading-relaxed">
        Accessibility is not an afterthought. Target WCAG 2.0 Level AA compliance. Design for universal
        access from the start — retrofitting is costly and often incomplete.
      </p>

      <h3 className="text-base font-semibold text-surface-800 mb-3">Four Core Principles (POUR)</h3>
      <div className="space-y-2">
        {pourSections.map((section) => (
          <Expandable key={section.label} title={section.label}>
            <ul className="space-y-1.5">
              {section.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-surface-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </Expandable>
        ))}
      </div>

      <h3 className="text-base font-semibold text-surface-800 mt-6 mb-2">
        Accessibility Checklist
        {checkedCount > 0 && (
          <span className="ml-2 text-xs font-normal text-brand-600">
            {checkedCount}/{checklistItems.length} completed
          </span>
        )}
      </h3>
      <div className="space-y-2">
        {checklistItems.map((item, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-50 transition-colors text-left border border-transparent hover:border-surface-200"
          >
            <CheckboxIcon checked={!!checkedItems[i]} />
            <span className={cn('text-sm text-surface-700 leading-relaxed', checkedItems[i] && 'line-through text-surface-400')}>
              {item}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6">
        <CopyAsMarkdown content={markdownContent} />
      </div>
    </div>
  );
}

function ArticleBestPractices() {
  const markdownContent = `# Best Practices

## SMART Learning Objectives

Formula: "By the end of this [module/course], learners will be able to [action verb] + [object] + [condition/criteria]."

- Weak: "Understand project management."
- Strong: "Given a project brief, create a work breakdown structure that identifies all deliverables, dependencies, and milestones."

## Content Sequencing

1. Build conceptual understanding before procedural steps
2. Move from simple to complex (scaffolding)
3. Move from concrete to abstract
4. Place foundational skills before dependent skills
5. Interleave practice with instruction — don't front-load all content

## Content Chunking

| Format | Duration | Use Case |
|---|---|---|
| Micro-learning | 5–15 minutes | Just-in-time learning, reinforcement |
| Traditional module | 20–45 minutes | Structured courses, certification prep |
| Deep-dive session | 45–90 minutes | Complex topics with practice |`;

  return (
    <div>
      <h2 className="text-xl font-bold text-surface-900 mb-2">Best Practices</h2>
      <p className="text-sm text-surface-600 mb-5 leading-relaxed">
        These guidelines apply across all course types and phases. Internalizing them produces consistently stronger learning experiences.
      </p>

      <h3 className="text-base font-semibold text-surface-800 mb-3">SMART Learning Objectives</h3>
      <p className="text-sm text-surface-600 mb-3">
        Every learning objective should be Specific, Measurable, Achievable, Relevant, and Time-bound.
      </p>
      <div className="bg-surface-50 border border-surface-200 rounded-xl p-4 my-4 font-mono text-sm">
        <p className="text-surface-500 text-xs mb-1">FORMULA</p>
        <p className="text-surface-800">
          "By the end of this [module/course], learners will be able to{' '}
          <span className="text-brand-600 font-semibold">[action verb]</span> +{' '}
          <span className="text-purple-600 font-semibold">[object]</span> +{' '}
          <span className="text-green-600 font-semibold">[condition/criteria]</span>."
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-red-700 mb-1">Weak Objective</p>
          <p className="text-sm text-red-800">"Understand project management."</p>
          <p className="text-xs text-red-600 mt-2">Not measurable, no action verb, no context.</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-green-700 mb-1">Strong Objective</p>
          <p className="text-sm text-green-800">"Given a project brief, create a work breakdown structure that identifies all deliverables, dependencies, and milestones."</p>
        </div>
      </div>

      <h3 className="text-base font-semibold text-surface-800 mt-6 mb-3">Content Sequencing</h3>
      <ol className="space-y-2">
        {[
          'Build conceptual understanding before procedural steps',
          'Move from simple to complex (scaffolding)',
          'Move from concrete to abstract',
          'Place foundational skills before dependent skills',
          'Interleave practice with instruction — do not front-load all content',
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-surface-700">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold shrink-0 mt-0.5">
              {i + 1}
            </span>
            {item}
          </li>
        ))}
      </ol>

      <h3 className="text-base font-semibold text-surface-800 mt-6 mb-3">Content Chunking</h3>
      <StyledTable
        headers={['Format', 'Duration', 'Use Case']}
        rows={[
          ['Micro-learning', '5–15 minutes', 'Just-in-time learning, reinforcement, quick reference'],
          ['Traditional Module', '20–45 minutes', 'Structured courses, certification prep'],
          ['Deep-Dive Session', '45–90 minutes', 'Complex topics with practice (include breaks)'],
        ]}
      />
      <Callout variant="warning">
        If a module exceeds 45 minutes without interaction, redesign it.
      </Callout>

      <h3 className="text-base font-semibold text-surface-800 mt-6 mb-3">Assessment Placement</h3>
      <ul className="space-y-2 text-sm text-surface-700">
        <li className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
          <span><strong>Formative assessments throughout</strong> — Check understanding as you go. Low-stakes and diagnostic.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
          <span><strong>Summative assessments at milestones</strong> — Higher-stakes evaluations at the end of modules or courses.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
          <span><strong>Never rely solely on end-of-course assessments.</strong> By then it is too late to correct misunderstandings.</span>
        </li>
      </ul>

      <div className="mt-6">
        <CopyAsMarkdown content={markdownContent} />
      </div>
    </div>
  );
}

function ArticleAssessment() {
  const markdownContent = `# Assessment Principles

## Question Types

| Type | Best For | Bloom's Level |
|---|---|---|
| Multiple Choice | Recall and comprehension | Remember, Understand |
| Multiple Select | Nuanced understanding | Understand, Analyze |
| Short Answer | Recall without cues | Remember, Understand |
| Scenario-Based | Application in realistic contexts | Apply, Analyze, Evaluate |
| Performance Task | Creating or executing in realistic conditions | Apply, Create |
| Essay / Open Response | Synthesis, evaluation, argumentation | Evaluate, Create |
| Matching | Associations and classifications | Remember, Understand |
| Ordering / Sequencing | Procedural knowledge | Understand, Apply |

## Difficulty Balance

| Course Level | Remember/Understand | Apply | Analyze+ |
|---|---|---|---|
| Foundational | ~40% | ~40% | ~20% |
| Intermediate | ~20% | ~40% | ~40% |
| Advanced | ~10% | ~30% | ~60% |`;

  return (
    <div>
      <h2 className="text-xl font-bold text-surface-900 mb-2">Assessment Principles</h2>
      <p className="text-sm text-surface-600 mb-5 leading-relaxed">
        Assessments are learning tools, not just measurement instruments. Well-designed assessments
        reinforce learning, reveal gaps, and guide next steps.
      </p>

      <h3 className="text-base font-semibold text-surface-800 mb-3">Question Types and When to Use Them</h3>
      <StyledTable
        headers={['Type', 'Best For', "Bloom's Level"]}
        rows={[
          ['Multiple Choice', 'Testing recall and comprehension; quick formative checks', 'Remember, Understand'],
          ['Multiple Select', 'Testing nuanced understanding (more than one correct answer)', 'Understand, Analyze'],
          ['Short Answer', 'Testing recall without cues; checking terminology', 'Remember, Understand'],
          ['Scenario-Based', 'Testing application and analysis in realistic contexts', 'Apply, Analyze, Evaluate'],
          ['Performance Task', 'Testing ability to create or execute in realistic conditions', 'Apply, Create'],
          ['Essay / Open Response', 'Testing synthesis, evaluation, and argumentation', 'Evaluate, Create'],
          ['Matching', 'Testing associations and classifications', 'Remember, Understand'],
          ['Ordering / Sequencing', 'Testing procedural knowledge', 'Understand, Apply'],
        ]}
      />

      <h3 className="text-base font-semibold text-surface-800 mt-6 mb-3">Multiple Choice Best Practices</h3>
      <ul className="space-y-2 text-sm text-surface-700">
        {[
          'Stem: Clear, concise question or incomplete statement. Contains enough context to answer without reading options.',
          'Correct answer: Unambiguously correct.',
          'Distractors: Represent common misconceptions, not obviously wrong answers.',
          'Avoid: "All of the above," "None of the above," double negatives, trick questions.',
          'Standard number of options: 4 (1 correct + 3 distractors).',
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
            {item}
          </li>
        ))}
      </ul>

      <h3 className="text-base font-semibold text-surface-800 mt-6 mb-3">Difficulty Balance by Course Level</h3>
      <StyledTable
        headers={['Course Level', 'Remember / Understand', 'Apply', 'Analyze +']}
        rows={[
          ['Foundational', '~40%', '~40%', '~20%'],
          ['Intermediate', '~20%', '~40%', '~40%'],
          ['Advanced', '~10%', '~30%', '~60%'],
        ]}
      />

      <Callout variant="tip">
        Answer keys must include: the correct answer, why it is correct, why each distractor is incorrect,
        the learning objective aligned to each question, and the Bloom's level being assessed.
      </Callout>

      <div className="mt-6">
        <CopyAsMarkdown content={markdownContent} />
      </div>
    </div>
  );
}

const COURSE_TYPES_DATA = [
  { type: 'Instructor-Led Training (ILT)', desc: 'Live, synchronous instruction with a facilitator', considerations: 'Facilitator guide, timing, group activities, discussion prompts, room/tech setup' },
  { type: 'Self-Paced E-Learning', desc: 'Asynchronous digital modules completed independently', considerations: 'Clear navigation, built-in feedback, no assumption of live support, engaging media' },
  { type: 'Blended Learning', desc: 'Combination of ILT and e-learning components', considerations: 'Clear delineation of online vs. in-person, seamless transitions, consistent experience' },
  { type: 'Micro-Learning Modules', desc: 'Short, focused learning units (5–15 min)', considerations: 'Single objective per module, mobile-friendly, standalone but linkable to curriculum' },
  { type: 'Bootcamp / Intensive Workshop', desc: 'Compressed, high-intensity learning programs', considerations: 'Heavy practice component, rapid feedback loops, progressive complexity, stamina management' },
  { type: 'Certification Programs', desc: 'Structured paths leading to formal certification', considerations: 'Rigorous assessment, clear competency standards, study guides, practice exams' },
  { type: 'Performance Support Tools', desc: 'Just-in-time resources used during actual work', considerations: 'Searchable, task-oriented, minimal scrolling, accessible from workflow' },
  { type: 'Job Aids / Reference Materials', desc: 'Quick-reference documents for specific tasks', considerations: 'Visual, step-by-step, laminated/printable, minimal text, decision trees' },
];

function ArticleCourseTypes() {
  const markdownContent = `# Course Types Guide

## Type Definitions

| Course Type | Description | Key Design Considerations |
|---|---|---|
| ILT | Live, synchronous instruction with a facilitator | Facilitator guide, timing, group activities |
| Self-Paced E-Learning | Asynchronous digital modules | Clear navigation, built-in feedback |
| Blended Learning | Combination of ILT and e-learning | Seamless transitions, consistent experience |
| Micro-Learning | Short, focused units (5–15 min) | Single objective, mobile-friendly |
| Bootcamp | Compressed, high-intensity programs | Heavy practice, rapid feedback loops |
| Certification | Paths leading to formal certification | Rigorous assessment, competency standards |
| Performance Support | Just-in-time resources during work | Searchable, task-oriented, minimal scrolling |
| Job Aids | Quick-reference documents | Visual, step-by-step, minimal text |

## Format Selection Criteria

Choose format based on:
1. Learning objectives complexity
2. Audience size and distribution
3. Content volatility (how often it changes)
4. Budget and timeline
5. Required interaction level
6. Compliance and tracking requirements`;

  return (
    <div>
      <h2 className="text-xl font-bold text-surface-900 mb-2">Course Types Guide</h2>
      <p className="text-sm text-surface-600 mb-5 leading-relaxed">
        Choosing the right delivery format is one of the most consequential design decisions. Each format
        has distinct strengths, constraints, and design requirements.
      </p>

      <StyledTable
        headers={['Course Type', 'Description', 'Key Design Considerations']}
        rows={COURSE_TYPES_DATA.map((ct) => [ct.type, ct.desc, ct.considerations])}
      />

      <h3 className="text-base font-semibold text-surface-800 mt-6 mb-3">Delivery Format Selection Guide</h3>
      <p className="text-sm text-surface-600 mb-3">Choose format based on:</p>
      <ol className="space-y-2">
        {[
          { label: 'Learning objectives complexity', note: 'Higher complexity favors ILT or blended formats' },
          { label: 'Audience size and distribution', note: 'Large or distributed audiences favor e-learning' },
          { label: 'Content volatility', note: 'Frequently changing content favors digital or micro-learning' },
          { label: 'Budget and timeline', note: 'Constraints may favor simpler formats' },
          { label: 'Required interaction level', note: 'High interaction favors ILT or blended' },
          { label: 'Compliance requirements', note: 'Regulatory training may require specific tracking (SCORM, xAPI)' },
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span>
              <span className="font-medium text-surface-800">{item.label}</span>
              <span className="text-surface-500"> — {item.note}</span>
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-6">
        <CopyAsMarkdown content={markdownContent} />
      </div>
    </div>
  );
}

// ── Copy as Markdown ──

function CopyAsMarkdown({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-surface-500 hover:text-brand-700 hover:bg-brand-50 px-3 py-1.5 rounded-lg border border-surface-200 hover:border-brand-200 transition-colors"
    >
      <CopyIcon className="w-3.5 h-3.5" />
      {copied ? 'Copied!' : 'Copy as Markdown'}
    </button>
  );
}

// ── Article renderer ──

const ARTICLE_COMPONENTS: Record<string, React.FC<{ searchQuery: string }>> = {
  addie: ArticleADDIE,
  blooms: ({ searchQuery }) => <ArticleBlooms />,
  andragogy: ({ searchQuery }) => <ArticleAndragogy />,
  vark: ({ searchQuery }) => <ArticleVARK />,
  zpd: ({ searchQuery }) => <ArticleZPD />,
  interactivity: ({ searchQuery }) => <ArticleInteractivity />,
  accessibility: ({ searchQuery }) => <ArticleAccessibility />,
  'best-practices': ({ searchQuery }) => <ArticleBestPractices />,
  assessment: ({ searchQuery }) => <ArticleAssessment />,
  'course-types': ({ searchQuery }) => <ArticleCourseTypes />,
};

// ── Main Component ──

export default function KnowledgeBase() {
  const [activeCategory, setActiveCategory] = useState<string>('addie');
  const [searchQuery, setSearchQuery] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return CATEGORIES;
    const q = searchQuery.toLowerCase();
    return CATEGORIES.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.keywords.some((kw) => kw.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const scrollToTop = useCallback(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const ActiveArticle = ARTICLE_COMPONENTS[activeCategory];
  const activeCategory_ = CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <div className="flex h-full bg-surface-50">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-white border-r border-surface-200 flex flex-col">
        {/* Search */}
        <div className="p-4 border-b border-surface-200">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search knowledge base..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent placeholder:text-surface-400"
            />
          </div>
        </div>

        {/* Category List */}
        <nav className="flex-1 overflow-y-auto p-2">
          <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wide px-3 py-2">
            Topics
          </p>
          {filteredCategories.length === 0 && (
            <div className="px-3 py-4 text-center">
              <p className="text-xs text-surface-500">No topics match your search.</p>
            </div>
          )}
          {filteredCategories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  scrollToTop();
                }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-sm transition-colors mb-0.5',
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-surface-700 hover:bg-surface-100 hover:text-surface-900'
                )}
              >
                <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-brand-100' : 'text-surface-500')} />
                <span className="font-medium leading-tight">{cat.title}</span>
              </button>
            );
          })}

          {/* Quick Reference */}
          <div className="mt-4">
            <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wide px-3 py-2">
              Quick Reference
            </p>
            <div className="px-2 flex flex-wrap gap-1.5">
              {QUICK_REFS.map((ref) => (
                <button
                  key={ref.label}
                  onClick={() => {
                    setActiveCategory(ref.categoryId);
                    scrollToTop();
                  }}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-surface-100 hover:bg-brand-100 hover:text-brand-800 text-surface-600 transition-colors border border-surface-200 hover:border-brand-300"
                >
                  {ref.label}
                </button>
              ))}
            </div>
          </div>
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-surface-200 bg-white">
          <span className="text-xs text-surface-400">Knowledge Base</span>
          <svg className="w-3 h-3 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-xs font-medium text-surface-700">{activeCategory_?.title}</span>
        </div>

        {/* Article */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto px-8 py-6 relative"
        >
          {ActiveArticle ? (
            <div className="max-w-3xl">
              <ActiveArticle searchQuery={searchQuery} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-surface-500">Select a topic from the sidebar.</p>
            </div>
          )}

          {/* Back to top */}
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 w-10 h-10 bg-brand-600 hover:bg-brand-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
            title="Back to top"
          >
            <ArrowUpIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
