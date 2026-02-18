'use client';

import React, { useState, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import {
  BLOOM_LEVELS,
  BloomLevel,
  RubricLevel,
  RubricCriterion,
  GeneratedRubric,
} from '@/lib/types';
import { cn, formatDate, generateId } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface RubricBuilderProps {
  projectId: string;
}

// ── Types for local editor state ──

type AssessmentTypeOption =
  | 'Essay'
  | 'Performance Task'
  | 'Project'
  | 'Oral Presentation'
  | 'Portfolio'
  | 'Group Work';

const ASSESSMENT_TYPES: AssessmentTypeOption[] = [
  'Essay',
  'Performance Task',
  'Project',
  'Oral Presentation',
  'Portfolio',
  'Group Work',
];

const DEFAULT_LEVEL_LABELS = ['Exemplary', 'Proficient', 'Developing', 'Beginning'];

// ── Auto-generate criteria templates ──

type CriteriaTemplate = { name: string; descriptors: Record<string, string[]> };

const CRITERIA_TEMPLATES: Partial<Record<string, CriteriaTemplate[]>> = {
  'essay-evaluate': [
    {
      name: 'Thesis & Argument',
      descriptors: {
        Exemplary:   ['Clear, compelling thesis that is consistently supported throughout.'],
        Proficient:  ['Thesis is clear and generally supported with logical arguments.'],
        Developing:  ['Thesis present but inconsistently supported; some logical gaps.'],
        Beginning:   ['Thesis absent or unclear; arguments are weak or unsupported.'],
      },
    },
    {
      name: 'Evidence & Support',
      descriptors: {
        Exemplary:   ['Evidence is relevant, credible, and skillfully integrated.'],
        Proficient:  ['Evidence is mostly relevant and supports claims adequately.'],
        Developing:  ['Evidence present but sometimes irrelevant or poorly integrated.'],
        Beginning:   ['Little or no relevant evidence; assertions unsupported.'],
      },
    },
    {
      name: 'Analysis Depth',
      descriptors: {
        Exemplary:   ['Insightful analysis that reveals sophisticated understanding.'],
        Proficient:  ['Analysis is adequate and demonstrates solid understanding.'],
        Developing:  ['Analysis is superficial or incomplete.'],
        Beginning:   ['Little analysis; content is mostly descriptive or inaccurate.'],
      },
    },
    {
      name: 'Writing Quality',
      descriptors: {
        Exemplary:   ['Excellent clarity, grammar, and style; professional voice.'],
        Proficient:  ['Clear writing with minor grammatical issues; appropriate tone.'],
        Developing:  ['Writing unclear in places; noticeable grammar issues.'],
        Beginning:   ['Frequent errors impede understanding; tone inappropriate.'],
      },
    },
  ],
  'performance task-apply': [
    {
      name: 'Process Execution',
      descriptors: {
        Exemplary:   ['Follows all steps correctly and efficiently with no errors.'],
        Proficient:  ['Follows most steps correctly with minor deviations.'],
        Developing:  ['Follows some steps; several procedural errors observed.'],
        Beginning:   ['Significant difficulty following the required process.'],
      },
    },
    {
      name: 'Accuracy',
      descriptors: {
        Exemplary:   ['Output is fully accurate and meets all specifications.'],
        Proficient:  ['Output is mostly accurate with minor discrepancies.'],
        Developing:  ['Output contains notable inaccuracies affecting usability.'],
        Beginning:   ['Output is largely inaccurate or incomplete.'],
      },
    },
    {
      name: 'Problem-Solving',
      descriptors: {
        Exemplary:   ['Identifies and resolves challenges creatively and independently.'],
        Proficient:  ['Resolves most challenges with minimal guidance.'],
        Developing:  ['Recognizes problems but requires significant support.'],
        Beginning:   ['Unable to identify or address problems without extensive help.'],
      },
    },
    {
      name: 'Presentation',
      descriptors: {
        Exemplary:   ['Final product is polished, professional, and well-organized.'],
        Proficient:  ['Final product is organized and meets presentation requirements.'],
        Developing:  ['Final product lacks organization or has presentation gaps.'],
        Beginning:   ['Final product is incomplete or does not meet requirements.'],
      },
    },
  ],
  'project-create': [
    {
      name: 'Originality & Innovation',
      descriptors: {
        Exemplary:   ['Highly original approach; demonstrates creative and novel thinking.'],
        Proficient:  ['Shows originality in approach with some creative elements.'],
        Developing:  ['Mostly derivative; limited evidence of original thinking.'],
        Beginning:   ['Little to no original contribution; largely copied or generic.'],
      },
    },
    {
      name: 'Completeness',
      descriptors: {
        Exemplary:   ['All required components fully addressed and exceeds expectations.'],
        Proficient:  ['All required components addressed; meets expectations.'],
        Developing:  ['Some required components missing or insufficiently addressed.'],
        Beginning:   ['Major components missing; significantly incomplete.'],
      },
    },
    {
      name: 'Technical Quality',
      descriptors: {
        Exemplary:   ['Technically flawless; demonstrates mastery of relevant tools/methods.'],
        Proficient:  ['Technically sound with only minor issues.'],
        Developing:  ['Several technical issues that impact quality.'],
        Beginning:   ['Significant technical deficiencies throughout.'],
      },
    },
    {
      name: 'Reflection',
      descriptors: {
        Exemplary:   ['Insightful reflection that demonstrates deep self-awareness and growth.'],
        Proficient:  ['Reflection demonstrates adequate self-assessment and learning.'],
        Developing:  ['Reflection is superficial or misses key learning moments.'],
        Beginning:   ['Little or no meaningful reflection provided.'],
      },
    },
  ],
};

function getTemplateKey(assessmentType: string, bloomLevel: BloomLevel): string {
  return `${assessmentType.toLowerCase()}-${bloomLevel}`;
}

function getDefaultCriteria(assessmentType: string, bloomLevel: BloomLevel, levelLabels: string[]): CriteriaTemplate[] {
  const key = getTemplateKey(assessmentType, bloomLevel);
  return (CRITERIA_TEMPLATES[key] ?? CRITERIA_TEMPLATES['essay-evaluate'] ?? []);
}

// ── Bloom level badge colors ──
const bloomColors: Record<BloomLevel, string> = {
  remember:  'bg-slate-100 text-slate-700',
  understand: 'bg-blue-100 text-blue-700',
  apply:     'bg-amber-100 text-amber-700',
  analyze:   'bg-purple-100 text-purple-700',
  evaluate:  'bg-rose-100 text-rose-700',
  create:    'bg-emerald-100 text-emerald-700',
};

// ── Helper: build default rubric levels from label list ──
function buildLevels(labels: string[]): RubricLevel[] {
  return labels.map((label, i) => ({
    id: generateId(),
    label,
    points: labels.length - i,
    descriptor: '',
  }));
}

// ── Helper: rubric to markdown ──
function rubricToMarkdown(rubric: GeneratedRubric): string {
  const header = `# ${rubric.title}\n\n**Assessment Type:** ${rubric.assessmentType}  \n**Bloom's Level:** ${rubric.bloomLevel.charAt(0).toUpperCase() + rubric.bloomLevel.slice(1)}  \n**Total Points:** ${rubric.totalPoints}\n\n`;

  if (!rubric.criteria.length) return header + '_No criteria defined._';

  const levelLabels = rubric.criteria[0].levels.map((l) => l.label);
  const levelPoints = rubric.criteria[0].levels.map((l) => l.points);

  // Table header
  const colHeaders = ['Criteria', 'Weight', ...levelLabels].join(' | ');
  const colSep = ['---', '---', ...levelLabels.map(() => '---')].join(' | ');
  const pointsRow = ['**Points**', '', ...levelPoints.map(String)].join(' | ');

  const rows = rubric.criteria.map((c) => {
    const cells = [c.name, `${c.weight}%`, ...c.levels.map((l) => l.descriptor || '-')];
    return cells.join(' | ');
  });

  return header + `| ${colHeaders} |\n| ${colSep} |\n| ${pointsRow} |\n` + rows.map((r) => `| ${r} |`).join('\n');
}

// ── Sub-component: Criterion row ──
interface CriterionRowProps {
  criterion: RubricCriterion;
  levelLabels: string[];
  onChange: (updated: RubricCriterion) => void;
  onRemove: () => void;
}

function CriterionRow({ criterion, levelLabels, onChange, onRemove }: CriterionRowProps) {
  function updateField(field: keyof RubricCriterion, value: string | number) {
    onChange({ ...criterion, [field]: value });
  }

  function updateLevelDescriptor(levelId: string, descriptor: string) {
    onChange({
      ...criterion,
      levels: criterion.levels.map((l) => (l.id === levelId ? { ...l, descriptor } : l)),
    });
  }

  return (
    <div className="bg-white border border-surface-200 rounded-xl p-4 space-y-3">
      {/* Criterion header row */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={criterion.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Criterion name"
            className="w-full text-sm font-medium text-surface-900 border border-surface-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <label className="text-xs text-surface-500 whitespace-nowrap">Weight %</label>
          <input
            type="number"
            min={0}
            max={100}
            value={criterion.weight}
            onChange={(e) => updateField('weight', Number(e.target.value))}
            className="w-16 text-sm border border-surface-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <button
          onClick={onRemove}
          className="text-surface-400 hover:text-red-500 transition-colors p-1 rounded"
          aria-label="Remove criterion"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Descriptor textareas for each level */}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${criterion.levels.length}, 1fr)` }}>
        {criterion.levels.map((level, i) => (
          <div key={level.id} className="space-y-1">
            <p className="text-xs font-medium text-surface-600">
              {level.label} <span className="text-surface-400">({level.points} pts)</span>
            </p>
            <textarea
              value={level.descriptor}
              onChange={(e) => updateLevelDescriptor(level.id, e.target.value)}
              placeholder={`Descriptor for ${level.label}...`}
              rows={3}
              className="w-full text-xs text-surface-700 border border-surface-200 rounded-lg px-2 py-1.5 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Sub-component: Rubric preview table ──
function RubricPreview({ criteria, levelLabels }: { criteria: RubricCriterion[]; levelLabels: string[] }) {
  if (!criteria.length) {
    return <p className="text-sm text-surface-400 text-center py-8">No criteria yet. Add criteria above.</p>;
  }

  const levels = criteria[0]?.levels ?? [];

  return (
    <div className="overflow-x-auto rounded-xl border border-surface-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface-50 border-b border-surface-200">
            <th className="text-left px-4 py-3 font-semibold text-surface-700 w-40">Criteria</th>
            <th className="text-center px-3 py-3 font-semibold text-surface-700 w-16">Weight</th>
            {levels.map((l) => (
              <th key={l.id} className="text-center px-3 py-3 font-semibold text-surface-700">
                <span className="block">{l.label}</span>
                <span className="text-xs font-normal text-surface-500">{l.points} pts</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {criteria.map((c, i) => (
            <tr key={c.id} className={cn('border-b border-surface-100', i % 2 === 0 ? 'bg-white' : 'bg-surface-50/50')}>
              <td className="px-4 py-3 font-medium text-surface-800">{c.name}</td>
              <td className="px-3 py-3 text-center text-surface-600">{c.weight}%</td>
              {c.levels.map((l) => (
                <td key={l.id} className="px-3 py-3 text-surface-600 text-xs leading-relaxed">
                  {l.descriptor || <span className="text-surface-300 italic">—</span>}
                </td>
              ))}
            </tr>
          ))}
          {/* Total row */}
          <tr className="bg-surface-100 font-semibold text-surface-800">
            <td className="px-4 py-3">Total</td>
            <td className="px-3 py-3 text-center">
              {criteria.reduce((sum, c) => sum + c.weight, 0)}%
            </td>
            {levels.map((l) => (
              <td key={l.id} className="px-3 py-3 text-center">{l.points} pts</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ── Saved rubric card ──
interface SavedRubricCardProps {
  rubric: GeneratedRubric;
  onView: () => void;
  onCopy: () => void;
  onDelete: () => void;
}

function SavedRubricCard({ rubric, onView, onCopy, onDelete }: SavedRubricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-surface-200 p-4 space-y-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-surface-900 truncate">{rubric.title}</p>
          <p className="text-xs text-surface-500 mt-0.5">{rubric.assessmentType}</p>
        </div>
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize shrink-0', bloomColors[rubric.bloomLevel])}>
          {rubric.bloomLevel}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-surface-500">
        <span>{rubric.criteria.length} criteria</span>
        <span>{rubric.totalPoints} max pts</span>
        <span>{formatDate(rubric.createdAt)}</span>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={onView}
          className="text-xs font-medium text-brand-600 hover:text-brand-800 transition-colors"
        >
          View
        </button>
        <span className="text-surface-300">|</span>
        <button
          onClick={onCopy}
          className="text-xs font-medium text-surface-600 hover:text-surface-800 transition-colors"
        >
          Copy as Markdown
        </button>
        <span className="text-surface-300">|</span>
        <button
          onClick={onDelete}
          className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

// ── View modal ──
function RubricViewModal({ rubric, onClose }: { rubric: GeneratedRubric; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-surface-900">{rubric.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-surface-500">{rubric.assessmentType}</span>
              <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize', bloomColors[rubric.bloomLevel])}>
                {rubric.bloomLevel}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-surface-400 hover:text-surface-700 transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <RubricPreview criteria={rubric.criteria} levelLabels={rubric.criteria[0]?.levels.map((l) => l.label) ?? []} />
        </div>
      </div>
    </div>
  );
}

// ── Main component ──
export default function RubricBuilder({ projectId }: RubricBuilderProps) {
  const addGeneratedRubric = useAppStore((s) => s.addGeneratedRubric);
  const deleteGeneratedRubric = useAppStore((s) => s.deleteGeneratedRubric);
  const getDevToolData = useAppStore((s) => s.getDevToolData);
  const getCourseOutline = useAppStore((s) => s.getCourseOutline);

  const { rubrics } = getDevToolData(projectId);
  const outline = getCourseOutline(projectId);

  // Build objective options from course outline
  const objectiveOptions: { id: string; label: string }[] = [];
  if (outline) {
    outline.modules.forEach((mod) => {
      mod.objectives.forEach((obj) => {
        objectiveOptions.push({ id: obj.id, label: obj.text });
      });
      mod.lessons.forEach((les) => {
        les.objectives.forEach((obj) => {
          objectiveOptions.push({ id: obj.id, label: obj.text });
        });
      });
    });
  }

  // ── Editor state ──
  const [isEditing, setIsEditing] = useState(false);
  const [viewingRubric, setViewingRubric] = useState<GeneratedRubric | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Step 1 fields
  const [title, setTitle] = useState('');
  const [assessmentType, setAssessmentType] = useState<AssessmentTypeOption>('Essay');
  const [bloomLevel, setBloomLevel] = useState<BloomLevel>('evaluate');
  const [objectiveRef, setObjectiveRef] = useState('');
  const [levelLabels, setLevelLabels] = useState<string[]>([...DEFAULT_LEVEL_LABELS]);
  const [levelPoints, setLevelPoints] = useState<number[]>([4, 3, 2, 1]);

  // Step 2: criteria
  const [criteria, setCriteria] = useState<RubricCriterion[]>([]);

  // Weight validation
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  const weightValid = criteria.length === 0 || totalWeight === 100;

  // ── Helpers ──
  function resetEditor() {
    setTitle('');
    setAssessmentType('Essay');
    setBloomLevel('evaluate');
    setObjectiveRef('');
    setLevelLabels([...DEFAULT_LEVEL_LABELS]);
    setLevelPoints([4, 3, 2, 1]);
    setCriteria([]);
    setIsEditing(false);
  }

  function addLevel() {
    const newLabel = `Level ${levelLabels.length + 1}`;
    setLevelLabels((prev) => [newLabel, ...prev]);
    setLevelPoints((prev) => [prev.length + 1, ...prev.map((p) => (p > 1 ? p - 0 : p))]);
    setCriteria((prev) =>
      prev.map((c) => ({
        ...c,
        levels: [
          { id: generateId(), label: newLabel, points: levelLabels.length + 1, descriptor: '' },
          ...c.levels,
        ],
      }))
    );
  }

  function removeLevel(idx: number) {
    if (levelLabels.length <= 2) return;
    const removedLabel = levelLabels[idx];
    setLevelLabels((prev) => prev.filter((_, i) => i !== idx));
    setLevelPoints((prev) => prev.filter((_, i) => i !== idx));
    setCriteria((prev) =>
      prev.map((c) => ({
        ...c,
        levels: c.levels.filter((l) => l.label !== removedLabel),
      }))
    );
  }

  function updateLevelLabel(idx: number, newLabel: string) {
    const oldLabel = levelLabels[idx];
    setLevelLabels((prev) => prev.map((l, i) => (i === idx ? newLabel : l)));
    setCriteria((prev) =>
      prev.map((c) => ({
        ...c,
        levels: c.levels.map((l) => (l.label === oldLabel ? { ...l, label: newLabel } : l)),
      }))
    );
  }

  function updateLevelPoints(idx: number, points: number) {
    setLevelPoints((prev) => prev.map((p, i) => (i === idx ? points : p)));
    const label = levelLabels[idx];
    setCriteria((prev) =>
      prev.map((c) => ({
        ...c,
        levels: c.levels.map((l) => (l.label === label ? { ...l, points } : l)),
      }))
    );
  }

  function addCriterion() {
    const newCriterion: RubricCriterion = {
      id: generateId(),
      name: 'New Criterion',
      description: '',
      weight: 0,
      levels: levelLabels.map((label, i) => ({
        id: generateId(),
        label,
        points: levelPoints[i] ?? levelLabels.length - i,
        descriptor: '',
      })),
    };
    setCriteria((prev) => [...prev, newCriterion]);
  }

  function generateCriteria() {
    const templates = getDefaultCriteria(assessmentType, bloomLevel, levelLabels);
    if (!templates.length) return;
    const evenWeight = Math.floor(100 / templates.length);
    const remainder = 100 - evenWeight * templates.length;
    const generated: RubricCriterion[] = templates.map((t, i) => ({
      id: generateId(),
      name: t.name,
      description: '',
      weight: i === 0 ? evenWeight + remainder : evenWeight,
      levels: levelLabels.map((label, li) => ({
        id: generateId(),
        label,
        points: levelPoints[li] ?? levelLabels.length - li,
        descriptor: (t.descriptors[label] ?? [''])[0] ?? '',
      })),
    }));
    setCriteria(generated);
  }

  function updateCriterion(id: string, updated: RubricCriterion) {
    setCriteria((prev) => prev.map((c) => (c.id === id ? updated : c)));
  }

  function removeCriterion(id: string) {
    setCriteria((prev) => prev.filter((c) => c.id !== id));
  }

  function saveRubric() {
    if (!title.trim()) return;
    const maxPoints = Math.max(...(criteria[0]?.levels.map((l) => l.points) ?? [0]));
    addGeneratedRubric({
      projectId,
      title: title.trim(),
      assessmentType,
      bloomLevel,
      totalPoints: maxPoints * criteria.length,
      criteria,
      objectiveRef: objectiveRef || undefined,
    });
    resetEditor();
  }

  function handleCopyMarkdown(rubric: GeneratedRubric) {
    const md = rubricToMarkdown(rubric);
    navigator.clipboard.writeText(md).then(() => {
      setCopiedId(rubric.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  // ── Render ──
  return (
    <div className="space-y-6">
      {/* Zone 1: Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-surface-900">Rubric Builder</h2>
          <p className="text-sm text-surface-500 mt-0.5">Create scoring rubrics for subjective assessments</p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            }
          >
            New Rubric
          </Button>
        )}
      </div>

      {/* Zone 2: Editor */}
      {isEditing && (
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
          {/* Editor header */}
          <div className="flex items-center justify-between px-6 py-4 bg-surface-50 border-b border-surface-200">
            <h3 className="font-semibold text-surface-900">New Rubric</h3>
            <button
              onClick={resetEditor}
              className="text-surface-400 hover:text-surface-700 transition-colors"
              aria-label="Close editor"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* ── Step 1: Rubric Setup ── */}
            <section className="space-y-5">
              <h4 className="text-sm font-semibold text-surface-700 uppercase tracking-wide">Step 1 — Rubric Setup</h4>

              {/* Title + Assessment type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-surface-600">Assessment Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Module 3 Final Essay"
                    className="w-full border border-surface-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-surface-600">Assessment Type</label>
                  <select
                    value={assessmentType}
                    onChange={(e) => setAssessmentType(e.target.value as AssessmentTypeOption)}
                    className="w-full border border-surface-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    {ASSESSMENT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bloom's level pills */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-surface-600">Bloom&apos;s Level</label>
                <div className="flex flex-wrap gap-2">
                  {BLOOM_LEVELS.map((b) => (
                    <button
                      key={b.key}
                      onClick={() => setBloomLevel(b.key)}
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                        bloomLevel === b.key
                          ? cn(bloomColors[b.key], 'border-transparent')
                          : 'bg-white text-surface-600 border-surface-300 hover:border-surface-400'
                      )}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Objective ref dropdown */}
              {objectiveOptions.length > 0 && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-surface-600">Link to Learning Objective (optional)</label>
                  <select
                    value={objectiveRef}
                    onChange={(e) => setObjectiveRef(e.target.value)}
                    className="w-full border border-surface-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="">— None —</option>
                    {objectiveOptions.map((o) => (
                      <option key={o.id} value={o.id}>{o.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Performance levels config */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-surface-600">Performance Levels</label>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={addLevel}
                    icon={
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    }
                  >
                    Add Level
                  </Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {levelLabels.map((label, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 bg-surface-50 border border-surface-200 rounded-lg px-2 py-1.5">
                      <input
                        type="text"
                        value={label}
                        onChange={(e) => updateLevelLabel(idx, e.target.value)}
                        className="w-24 text-xs font-medium bg-transparent focus:outline-none"
                      />
                      <input
                        type="number"
                        value={levelPoints[idx] ?? 0}
                        onChange={(e) => updateLevelPoints(idx, Number(e.target.value))}
                        className="w-10 text-xs text-surface-500 bg-transparent text-center focus:outline-none border-l border-surface-200 pl-1"
                        title="Points"
                      />
                      {levelLabels.length > 2 && (
                        <button
                          onClick={() => removeLevel(idx)}
                          className="text-surface-300 hover:text-red-500 ml-0.5"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Step 2: Criteria Editor ── */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-surface-700 uppercase tracking-wide">Step 2 — Criteria</h4>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={generateCriteria}>
                    Generate Criteria
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={addCriterion}
                    icon={
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    }
                  >
                    Add Criterion
                  </Button>
                </div>
              </div>

              {/* Weight validation */}
              {criteria.length > 0 && (
                <div className={cn('flex items-center gap-2 text-xs px-3 py-2 rounded-lg', weightValid ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700')}>
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {weightValid
                      ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      : <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    }
                  </svg>
                  {weightValid
                    ? 'Weights sum to 100% — good to go!'
                    : `Weights sum to ${totalWeight}% — must equal exactly 100%.`
                  }
                </div>
              )}

              {criteria.length === 0 ? (
                <div className="border-2 border-dashed border-surface-200 rounded-xl py-10 text-center">
                  <p className="text-sm text-surface-400">No criteria yet.</p>
                  <p className="text-xs text-surface-400 mt-1">Click &quot;Generate Criteria&quot; or &quot;Add Criterion&quot; to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {criteria.map((c) => (
                    <CriterionRow
                      key={c.id}
                      criterion={c}
                      levelLabels={levelLabels}
                      onChange={(updated) => updateCriterion(c.id, updated)}
                      onRemove={() => removeCriterion(c.id)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* ── Step 3: Preview ── */}
            <section className="space-y-4">
              <h4 className="text-sm font-semibold text-surface-700 uppercase tracking-wide">Step 3 — Preview</h4>
              <RubricPreview criteria={criteria} levelLabels={levelLabels} />
            </section>

            {/* Save */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={resetEditor}>Cancel</Button>
              <Button
                onClick={saveRubric}
                disabled={!title.trim() || criteria.length === 0 || !weightValid}
              >
                Save Rubric
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Zone 3: Saved rubrics list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-surface-900">Saved Rubrics</h3>
          <span className="text-sm text-surface-500">{rubrics.length} rubric{rubrics.length !== 1 ? 's' : ''}</span>
        </div>

        {rubrics.length === 0 ? (
          <div className="bg-white rounded-xl border border-surface-200 py-14 text-center">
            <div className="w-12 h-12 rounded-xl bg-surface-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </div>
            <p className="text-sm text-surface-500">No rubrics yet.</p>
            <p className="text-xs text-surface-400 mt-1">Click &quot;New Rubric&quot; to build your first scoring rubric.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rubrics.map((rubric) => (
              <SavedRubricCard
                key={rubric.id}
                rubric={rubric}
                onView={() => setViewingRubric(rubric)}
                onCopy={() => handleCopyMarkdown(rubric)}
                onDelete={() => deleteGeneratedRubric(projectId, rubric.id)}
              />
            ))}
          </div>
        )}

        {/* Copied toast */}
        {copiedId && (
          <div className="fixed bottom-6 right-6 bg-surface-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
            Copied to clipboard as Markdown!
          </div>
        )}
      </div>

      {/* View modal */}
      {viewingRubric && (
        <RubricViewModal rubric={viewingRubric} onClose={() => setViewingRubric(null)} />
      )}
    </div>
  );
}
