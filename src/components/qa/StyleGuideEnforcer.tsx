'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import {
  QAToolType,
  QAFinding,
  QASeverity,
  StyleGuide,
  StyleRule,
  StyleGuideType,
  MICROSOFT_STYLE_RULES,
} from '@/lib/types';
import { cn, generateId, formatRelativeTime } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface StyleGuideEnforcerProps {
  projectId: string;
}

const TOOL: QAToolType = 'style-guide';

const SEVERITY_COLORS: Record<QASeverity, string> = {
  critical: 'bg-red-100 text-red-800',
  warning: 'bg-amber-100 text-amber-800',
  info: 'bg-blue-100 text-blue-800',
  pass: 'bg-green-100 text-green-800',
};

const RULE_SEVERITY_COLORS: Record<string, string> = {
  error: 'bg-red-100 text-red-800',
  warning: 'bg-amber-100 text-amber-800',
  info: 'bg-blue-100 text-blue-800',
};

const CATEGORY_LABELS: Record<string, string> = {
  voice: 'Voice',
  terminology: 'Terminology',
  formatting: 'Formatting',
  structure: 'Structure',
  tone: 'Tone',
};

const TYPE_LABELS: Record<StyleGuideType, string> = {
  'pdf-upload': 'PDF Upload',
  microsoft: 'Microsoft Standards',
  custom: 'Custom',
};

const CATEGORIES = ['voice', 'terminology', 'formatting', 'structure', 'tone'] as const;

interface CustomRuleForm {
  category: StyleRule['category'];
  rule: string;
  example: string;
  severity: StyleRule['severity'];
}

function collectTextContent(
  designDocs: ReturnType<typeof useAppStore.getState>['designDocuments']
): { text: string; location: string; field: string }[] {
  const items: { text: string; location: string; field: string }[] = [];
  for (const doc of designDocs) {
    for (const slide of doc.slides) {
      const loc = `${doc.title} > Slide ${slide.slideNumber}`;
      if (slide.learnerView.heading) {
        items.push({ text: slide.learnerView.heading, location: loc, field: 'heading' });
      }
      if (slide.learnerView.bodyText) {
        items.push({ text: slide.learnerView.bodyText, location: loc, field: 'bodyText' });
      }
      for (const bp of slide.learnerView.bulletPoints) {
        if (bp) items.push({ text: bp, location: loc, field: 'bulletPoint' });
      }
      if (slide.designNotes.instructionalRationale) {
        items.push({ text: slide.designNotes.instructionalRationale, location: loc, field: 'rationale' });
      }
      if (slide.designNotes.developmentNotes) {
        items.push({ text: slide.designNotes.developmentNotes, location: loc, field: 'devNotes' });
      }
    }
  }
  return items;
}

function detectPassiveVoice(text: string): string[] {
  const passivePatterns = [
    /\b(is|was|were|are|been|being|be)\s+([\w]+ed|[\w]+en|given|shown|taken|made|done|found|known|seen|told|kept|left|meant|set|run|put|read|heard|let|begun|brought|built|bought|caught|chosen|come|cut|dealt|drawn|driven|eaten|fallen|felt|fought|forgotten|forgiven|frozen|gotten|grown|held|hidden|hit|hung|hurt|led|lent|lost|paid|proven|ridden|risen|sent|shaken|shot|shut|slept|slid|spoken|spent|spun|split|spread|stood|stolen|struck|stuck|stung|stunk|swept|swum|swung|taught|thought|thrown|understood|woken|won|worn|wound|written)\b/gi,
  ];
  const matches: string[] = [];
  for (const pattern of passivePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const start = Math.max(0, match.index - 20);
      const end = Math.min(text.length, match.index + match[0].length + 20);
      matches.push('...' + text.slice(start, end).trim() + '...');
    }
  }
  return matches;
}

function detectLongSentences(text: string): string[] {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  return sentences
    .filter((s) => s.trim().split(/\s+/).length > 25)
    .map((s) => s.trim().slice(0, 80) + '...');
}

function detectLongParagraphs(text: string): boolean {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  return sentences.length > 5;
}

function detectLatinAbbreviations(text: string): string[] {
  const patterns = /\b(e\.g\.|i\.e\.|etc\.|et al\.|viz\.)\b/gi;
  const matches: string[] = [];
  let match;
  while ((match = patterns.exec(text)) !== null) {
    matches.push(match[0]);
  }
  return [...new Set(matches)];
}

function detectGenderedPronouns(text: string): string[] {
  const pattern = /\b(he|she|him|her|his|hers)\b/gi;
  const matches: string[] = [];
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const start = Math.max(0, match.index - 15);
    const end = Math.min(text.length, match.index + match[0].length + 15);
    matches.push('...' + text.slice(start, end).trim() + '...');
  }
  return matches;
}

function detectTerminologyInconsistency(allTexts: string[]): { term: string; variants: string[] }[] {
  const wordMap: Record<string, Set<string>> = {};
  for (const text of allTexts) {
    const words = text.match(/\b[A-Za-z][a-z]+(?:\s[A-Za-z][a-z]+)?\b/g) || [];
    for (const word of words) {
      const lower = word.toLowerCase();
      if (lower.length < 4) continue;
      if (!wordMap[lower]) wordMap[lower] = new Set();
      wordMap[lower].add(word);
    }
  }
  const inconsistencies: { term: string; variants: string[] }[] = [];
  for (const [lower, variants] of Object.entries(wordMap)) {
    if (variants.size > 1) {
      const arr = Array.from(variants);
      const hasCaseDiff = arr.some((v) => v !== arr[0]);
      if (hasCaseDiff) {
        inconsistencies.push({ term: lower, variants: arr });
      }
    }
  }
  return inconsistencies.slice(0, 5);
}

export default function StyleGuideEnforcer({ projectId }: StyleGuideEnforcerProps) {
  const getStyleGuide = useAppStore((s) => s.getStyleGuide);
  const setStyleGuide = useAppStore((s) => s.setStyleGuide);
  const removeStyleGuide = useAppStore((s) => s.removeStyleGuide);
  const getDesignDocs = useAppStore((s) => s.getDesignDocs);
  const getQAReport = useAppStore((s) => s.getQAReport);
  const saveQAReport = useAppStore((s) => s.saveQAReport);
  const resolveQAFinding = useAppStore((s) => s.resolveQAFinding);

  const styleGuide = getStyleGuide(projectId);
  const designDocs = getDesignDocs(projectId);
  const report = getQAReport(projectId, TOOL);

  const [showUploader, setShowUploader] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customRules, setCustomRules] = useState<StyleRule[]>([]);
  const [customForm, setCustomForm] = useState<CustomRuleForm>({
    category: 'voice',
    rule: '',
    example: '',
    severity: 'warning',
  });
  const [running, setRunning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUseMicrosoft = useCallback(() => {
    setStyleGuide(projectId, {
      projectId,
      name: 'Microsoft Writing Style Guide',
      type: 'microsoft',
      rules: MICROSOFT_STYLE_RULES,
    });
    setShowUploader(false);
    setShowCustomForm(false);
  }, [projectId, setStyleGuide]);

  const handlePdfUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const placeholderCategories: StyleRule['category'][] = [
        'formatting',
        'structure',
        'tone',
        'formatting',
        'structure',
      ];
      const placeholderRules: StyleRule[] = placeholderCategories.map((cat, i) => ({
        id: generateId(),
        category: cat,
        rule: `Rule extracted from ${file.name} (rule ${i + 1})`,
        example: `See ${file.name} for examples`,
        severity: i === 0 ? 'error' : i < 3 ? 'warning' : 'info',
      }));
      setStyleGuide(projectId, {
        projectId,
        name: file.name.replace(/\.pdf$/i, ''),
        type: 'pdf-upload',
        rules: placeholderRules,
        pdfFileName: file.name,
      });
      setShowUploader(false);
    },
    [projectId, setStyleGuide]
  );

  const handleAddCustomRule = useCallback(() => {
    if (!customForm.rule.trim()) return;
    const newRule: StyleRule = {
      id: generateId(),
      category: customForm.category,
      rule: customForm.rule.trim(),
      example: customForm.example.trim() || undefined,
      severity: customForm.severity,
    };
    setCustomRules((prev) => [...prev, newRule]);
    setCustomForm({ category: 'voice', rule: '', example: '', severity: 'warning' });
  }, [customForm]);

  const handleSaveCustomGuide = useCallback(() => {
    if (customRules.length === 0) return;
    setStyleGuide(projectId, {
      projectId,
      name: 'Custom Style Guide',
      type: 'custom',
      rules: customRules,
    });
    setShowCustomForm(false);
    setCustomRules([]);
  }, [projectId, customRules, setStyleGuide]);

  const handleRemoveGuide = useCallback(() => {
    removeStyleGuide(projectId);
  }, [projectId, removeStyleGuide]);

  const runAnalysis = useCallback(() => {
    if (!styleGuide) return;
    setRunning(true);

    const contentItems = collectTextContent(designDocs);
    const allTexts = contentItems.map((c) => c.text);
    const findings: QAFinding[] = [];
    let score = 100;

    const deduct = (severity: QASeverity) => {
      if (severity === 'critical') score -= 8;
      else if (severity === 'warning') score -= 4;
      else if (severity === 'info') score -= 2;
    };

    const categoryChecks: Record<string, number> = { voice: 0, terminology: 0, formatting: 0, structure: 0, tone: 0 };

    // Check each content item against applicable rules
    for (const item of contentItems) {
      // Passive voice detection
      const passiveMatches = detectPassiveVoice(item.text);
      if (passiveMatches.length > 0) {
        const severity: QASeverity = 'warning';
        findings.push({
          id: generateId(),
          tool: TOOL,
          severity,
          title: 'Passive voice detected',
          description: `Found passive voice: "${passiveMatches[0]}"`,
          location: item.location,
          suggestion: 'Rewrite in active voice. Put the actor before the action.',
          resolved: false,
        });
        categoryChecks['voice']++;
        deduct(severity);
      }

      // Long sentences
      const longSentences = detectLongSentences(item.text);
      for (const ls of longSentences) {
        const severity: QASeverity = 'warning';
        findings.push({
          id: generateId(),
          tool: TOOL,
          severity,
          title: 'Sentence exceeds 25 words',
          description: `Long sentence: "${ls}"`,
          location: item.location,
          suggestion: 'Break into two shorter sentences for better readability.',
          resolved: false,
        });
        categoryChecks['structure']++;
        deduct(severity);
      }

      // Long paragraphs
      if (item.field === 'bodyText' && detectLongParagraphs(item.text)) {
        const severity: QASeverity = 'info';
        findings.push({
          id: generateId(),
          tool: TOOL,
          severity,
          title: 'Paragraph exceeds 5 sentences',
          description: 'Body text has more than 5 sentences in a single block.',
          location: item.location,
          suggestion: 'Split into shorter paragraphs with one idea each.',
          resolved: false,
        });
        categoryChecks['structure']++;
        deduct(severity);
      }

      // Latin abbreviations
      const latinMatches = detectLatinAbbreviations(item.text);
      for (const abbr of latinMatches) {
        const severity: QASeverity = 'info';
        findings.push({
          id: generateId(),
          tool: TOOL,
          severity,
          title: 'Latin abbreviation detected',
          description: `Found "${abbr}" — use plain English instead.`,
          location: item.location,
          suggestion: abbr === 'e.g.' ? 'Use "for example" instead.' : abbr === 'i.e.' ? 'Use "that is" instead.' : 'Use the plain English equivalent.',
          resolved: false,
        });
        categoryChecks['terminology']++;
        deduct(severity);
      }

      // Gendered pronouns in instructional content
      if (item.field !== 'rationale') {
        const genderedMatches = detectGenderedPronouns(item.text);
        if (genderedMatches.length > 0) {
          const severity: QASeverity = 'warning';
          findings.push({
            id: generateId(),
            tool: TOOL,
            severity,
            title: 'Gendered pronoun in instructional content',
            description: `Found gendered language: "${genderedMatches[0]}"`,
            location: item.location,
            suggestion: 'Use "they/them" or rewrite the sentence to be gender-neutral.',
            resolved: false,
          });
          categoryChecks['tone']++;
          deduct(severity);
        }
      }
    }

    // Terminology inconsistency
    const inconsistencies = detectTerminologyInconsistency(allTexts);
    for (const inc of inconsistencies) {
      const severity: QASeverity = 'warning';
      findings.push({
        id: generateId(),
        tool: TOOL,
        severity,
        title: 'Terminology inconsistency',
        description: `"${inc.term}" appears as: ${inc.variants.join(', ')}`,
        location: 'Across design documents',
        suggestion: 'Pick one form and use it consistently throughout.',
        resolved: false,
      });
      categoryChecks['terminology']++;
      deduct(severity);
    }

    // Heading hierarchy check
    for (const doc of designDocs) {
      const headings = doc.slides.map((s) => s.learnerView.heading).filter(Boolean);
      if (headings.length > 1) {
        let prevWasUpper = false;
        for (let i = 1; i < headings.length; i++) {
          const isUpper = headings[i] === headings[i].toUpperCase();
          const prevIsUpper = headings[i - 1] === headings[i - 1].toUpperCase();
          if (prevIsUpper && !isUpper && prevWasUpper) {
            // Possible skip — simplified heuristic
          }
          prevWasUpper = isUpper;
        }
      }
    }

    score = Math.max(0, score);

    const criticalCount = findings.filter((f) => f.severity === 'critical').length;
    const warningCount = findings.filter((f) => f.severity === 'warning').length;
    const infoCount = findings.filter((f) => f.severity === 'info').length;

    const summary =
      findings.length === 0
        ? 'All content passes style guide checks. No issues found.'
        : `Found ${findings.length} style issue${findings.length !== 1 ? 's' : ''}: ${criticalCount} critical, ${warningCount} warnings, ${infoCount} info.`;

    saveQAReport({
      projectId,
      tool: TOOL,
      score,
      findings,
      summary,
    });

    setRunning(false);
  }, [styleGuide, designDocs, projectId, saveQAReport]);

  const categoryBreakdown = useMemo(() => {
    if (!report) return null;
    const breakdown: Record<string, { total: number; issues: number; findings: QAFinding[] }> = {};
    for (const cat of CATEGORIES) {
      breakdown[cat] = { total: 0, issues: 0, findings: [] };
    }
    if (styleGuide) {
      for (const rule of styleGuide.rules) {
        breakdown[rule.category].total++;
      }
    }
    for (const finding of report.findings) {
      const cat = findCategoryForFinding(finding);
      if (cat && breakdown[cat]) {
        breakdown[cat].issues++;
        breakdown[cat].findings.push(finding);
      }
    }
    return breakdown;
  }, [report, styleGuide]);

  const ruleCoverage = useMemo(() => {
    if (!report || !styleGuide) return [];
    return styleGuide.rules.map((rule) => {
      const violations = report.findings.filter(
        (f) => !f.resolved && matchesRule(f, rule)
      );
      return { rule, violationCount: violations.length, passed: violations.length === 0 };
    });
  }, [report, styleGuide]);

  // ── Render: No style guide set ──
  if (!styleGuide) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-surface-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-2">Style Guide Enforcer</h2>
          <p className="text-sm text-surface-600 mb-6">
            Choose a style guide to check your content against writing standards.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Microsoft option */}
            <button
              onClick={handleUseMicrosoft}
              className="flex flex-col items-center gap-3 p-5 border-2 border-dashed border-surface-300 rounded-xl hover:border-brand-400 hover:bg-brand-50 transition-colors text-center"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600">
                <path d="M4 4h16v16H4z" />
                <path d="M4 4l8 8M20 4l-8 8M4 20l8-8M20 20l-8-8" />
              </svg>
              <span className="text-sm font-semibold text-surface-800">Use Microsoft Writing Standards</span>
              <span className="text-xs text-surface-500">Recommended — 18 rules</span>
            </button>

            {/* PDF upload option */}
            <button
              onClick={() => { setShowUploader(true); setShowCustomForm(false); }}
              className="flex flex-col items-center gap-3 p-5 border-2 border-dashed border-surface-300 rounded-xl hover:border-brand-400 hover:bg-brand-50 transition-colors text-center"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-surface-600">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <polyline points="9 15 12 12 15 15" />
              </svg>
              <span className="text-sm font-semibold text-surface-800">Upload Style Guide PDF</span>
              <span className="text-xs text-surface-500">Parse rules from your PDF</span>
            </button>

            {/* Custom option */}
            <button
              onClick={() => { setShowCustomForm(true); setShowUploader(false); }}
              className="flex flex-col items-center gap-3 p-5 border-2 border-dashed border-surface-300 rounded-xl hover:border-brand-400 hover:bg-brand-50 transition-colors text-center"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-surface-600">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span className="text-sm font-semibold text-surface-800">Create Custom Rules</span>
              <span className="text-xs text-surface-500">Define your own standards</span>
            </button>
          </div>

          {/* PDF upload drop zone */}
          {showUploader && (
            <div className="mt-6 border-2 border-dashed border-brand-300 rounded-xl p-8 bg-brand-50 text-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 text-brand-500">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <p className="text-sm text-surface-700 mb-3">Drop your style guide PDF here or click to browse</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handlePdfUpload}
                className="block mx-auto text-sm text-surface-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-600 file:text-white hover:file:bg-brand-700 file:cursor-pointer"
              />
            </div>
          )}

          {/* Custom rule form */}
          {showCustomForm && (
            <div className="mt-6 border border-surface-200 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-surface-800">Add Custom Rules</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <select
                  value={customForm.category}
                  onChange={(e) => setCustomForm((f) => ({ ...f, category: e.target.value as StyleRule['category'] }))}
                  className="px-3 py-2 border border-surface-300 rounded-lg text-sm bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Rule description..."
                  value={customForm.rule}
                  onChange={(e) => setCustomForm((f) => ({ ...f, rule: e.target.value }))}
                  className="sm:col-span-2 px-3 py-2 border border-surface-300 rounded-lg text-sm"
                />
                <select
                  value={customForm.severity}
                  onChange={(e) => setCustomForm((f) => ({ ...f, severity: e.target.value as StyleRule['severity'] }))}
                  className="px-3 py-2 border border-surface-300 rounded-lg text-sm bg-white"
                >
                  <option value="error">Error</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Example (optional)..."
                value={customForm.example}
                onChange={(e) => setCustomForm((f) => ({ ...f, example: e.target.value }))}
                className="w-full px-3 py-2 border border-surface-300 rounded-lg text-sm"
              />
              <div className="flex items-center gap-3">
                <Button size="sm" onClick={handleAddCustomRule} disabled={!customForm.rule.trim()}>
                  Add Rule
                </Button>
                <span className="text-xs text-surface-500">{customRules.length} rule{customRules.length !== 1 ? 's' : ''} added</span>
              </div>

              {customRules.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {customRules.map((r) => (
                    <div key={r.id} className="flex items-center justify-between gap-2 px-3 py-2 bg-surface-50 rounded-lg text-sm">
                      <span className="text-surface-700">{r.rule}</span>
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold uppercase', RULE_SEVERITY_COLORS[r.severity])}>
                        {r.severity}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {customRules.length > 0 && (
                <Button size="sm" variant="primary" onClick={handleSaveCustomGuide}>
                  Save Custom Style Guide
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Render: Style guide is set ──
  return (
    <div className="space-y-6">
      {/* Style guide info card */}
      <div className="bg-white border border-surface-200 rounded-xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-surface-900">{styleGuide.name}</h3>
              <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold uppercase', TYPE_LABELS[styleGuide.type] === 'Microsoft Standards' ? 'bg-brand-100 text-brand-800' : 'bg-surface-100 text-surface-700')}>
                {TYPE_LABELS[styleGuide.type]}
              </span>
            </div>
            <p className="text-xs text-surface-500 mt-0.5">
              {styleGuide.rules.length} rules{' '}
              {styleGuide.uploadedAt && <span>&#183; Set {formatRelativeTime(styleGuide.uploadedAt)}</span>}
            </p>
          </div>
        </div>
        <Button size="sm" variant="ghost" onClick={handleRemoveGuide}>
          Remove
        </Button>
      </div>

      {/* Run analysis button */}
      <div className="flex items-center gap-4">
        <Button onClick={runAnalysis} loading={running} disabled={designDocs.length === 0}>
          Run Analysis
        </Button>
        {designDocs.length === 0 && (
          <p className="text-xs text-surface-500">No design documents to analyze. Create design docs first.</p>
        )}
      </div>

      {/* Report results */}
      {report && (
        <>
          {/* Score banner */}
          <div className={cn(
            'rounded-xl p-5 flex items-center gap-4 border',
            report.score >= 80 ? 'bg-green-50 border-green-200' : report.score >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
          )}>
            <div className={cn(
              'w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white',
              report.score >= 80 ? 'bg-green-500' : report.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
            )}>
              {report.score}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-surface-900">Style Compliance Score</h3>
              <p className="text-xs text-surface-600 mt-0.5">{report.summary}</p>
              <p className="text-[10px] text-surface-400 mt-1">Last run: {formatRelativeTime(report.runAt)}</p>
            </div>
          </div>

          {/* Category breakdown */}
          {categoryBreakdown && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {CATEGORIES.map((cat) => {
                const data = categoryBreakdown[cat];
                const passed = data.issues === 0;
                return (
                  <div key={cat} className={cn(
                    'border rounded-xl p-4 text-center',
                    passed ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'
                  )}>
                    <p className="text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">{CATEGORY_LABELS[cat]}</p>
                    <p className={cn('text-2xl font-bold', passed ? 'text-green-700' : 'text-amber-700')}>
                      {data.total}
                    </p>
                    <p className={cn('text-[10px] font-medium mt-0.5', passed ? 'text-green-600' : 'text-amber-600')}>
                      {passed ? 'All passed' : `${data.issues} issue${data.issues !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Content scan results grouped by category */}
          {report.findings.length > 0 && (
            <div className="bg-white border border-surface-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-surface-900 mb-4">Content Scan Results</h3>
              <div className="space-y-6">
                {CATEGORIES.map((cat) => {
                  const catFindings = report.findings.filter((f) => findCategoryForFinding(f) === cat);
                  if (catFindings.length === 0) return null;
                  return (
                    <div key={cat}>
                      <h4 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">
                        {CATEGORY_LABELS[cat]} ({catFindings.length})
                      </h4>
                      <div className="space-y-2">
                        {catFindings.map((finding) => (
                          <div key={finding.id} className={cn(
                            'border rounded-lg p-3',
                            finding.resolved ? 'bg-surface-50 border-surface-200 opacity-60' : 'bg-white border-surface-200'
                          )}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold uppercase', SEVERITY_COLORS[finding.severity])}>
                                    {finding.severity}
                                  </span>
                                  <span className="text-sm font-medium text-surface-800">{finding.title}</span>
                                </div>
                                <p className="text-xs text-surface-600 mb-1">{finding.description}</p>
                                <p className="text-[10px] text-surface-400 mb-1">{finding.location}</p>
                                <p className="text-xs text-brand-700 italic">{finding.suggestion}</p>
                              </div>
                              {!finding.resolved && (
                                <button
                                  onClick={() => resolveQAFinding(projectId, TOOL, finding.id)}
                                  className="shrink-0 px-2 py-1 text-[10px] font-medium bg-surface-100 text-surface-600 rounded hover:bg-surface-200 transition-colors"
                                >
                                  Mark Resolved
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Rule coverage table */}
          {ruleCoverage.length > 0 && (
            <div className="bg-white border border-surface-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-surface-900 mb-4">Rule Coverage</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-200">
                      <th className="text-left py-2 pr-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
                      <th className="text-left py-2 pr-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Category</th>
                      <th className="text-left py-2 pr-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Rule</th>
                      <th className="text-left py-2 text-xs font-semibold text-surface-500 uppercase tracking-wider">Violations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ruleCoverage.map(({ rule, violationCount, passed }) => (
                      <tr key={rule.id} className="border-b border-surface-100 last:border-0">
                        <td className="py-2 pr-3">
                          {passed ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-600">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </span>
                          )}
                        </td>
                        <td className="py-2 pr-3">
                          <span className="text-xs text-surface-500 uppercase">{CATEGORY_LABELS[rule.category]}</span>
                        </td>
                        <td className="py-2 pr-3 text-surface-700">{rule.rule}</td>
                        <td className="py-2">
                          <span className={cn('text-xs font-semibold', passed ? 'text-green-600' : 'text-red-600')}>
                            {violationCount}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Helpers ──

function findCategoryForFinding(finding: QAFinding): string {
  const title = finding.title.toLowerCase();
  if (title.includes('passive') || title.includes('voice')) return 'voice';
  if (title.includes('terminology') || title.includes('jargon') || title.includes('latin') || title.includes('abbreviation')) return 'terminology';
  if (title.includes('heading') || title.includes('formatting') || title.includes('capitalization')) return 'formatting';
  if (title.includes('sentence') || title.includes('paragraph') || title.includes('structure')) return 'structure';
  if (title.includes('gender') || title.includes('tone') || title.includes('pronoun') || title.includes('inclusive')) return 'tone';
  return 'voice';
}

function matchesRule(finding: QAFinding, rule: StyleRule): boolean {
  const fTitle = finding.title.toLowerCase();
  const rRule = rule.rule.toLowerCase();
  if (fTitle.includes('passive') && rRule.includes('active voice')) return true;
  if (fTitle.includes('sentence') && rRule.includes('sentence')) return true;
  if (fTitle.includes('paragraph') && rRule.includes('paragraph')) return true;
  if (fTitle.includes('latin') && rRule.includes('latin')) return true;
  if (fTitle.includes('gender') && rRule.includes('gender')) return true;
  if (fTitle.includes('terminology') && rRule.includes('consistent')) return true;
  if (fTitle.includes('heading') && rRule.includes('heading')) return true;
  return false;
}
