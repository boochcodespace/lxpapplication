'use client';

import React, { useState, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import {
  QuickGenerateType,
  QuickGenerateResult,
  BloomLevel,
  BLOOM_LEVELS,
} from '@/lib/types';
import { cn, formatRelativeTime } from '@/lib/utils';
import Button from '@/components/ui/Button';

// ── Icons ──

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
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

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  );
}

function LightbulbIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
  );
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function PuzzleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.401.604-.401.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
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

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.375" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// ── Tool Definitions ──

interface ToolDef {
  type: QuickGenerateType;
  name: string;
  description: string;
  tag: string;
  icon: React.FC<{ className?: string }>;
  iconColor: string;
  inputs: ToolInput[];
}

interface ToolInput {
  key: string;
  label: string;
  type: 'text' | 'select' | 'number';
  placeholder?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  defaultValue?: string | number;
}

const TOOLS: ToolDef[] = [
  {
    type: 'objectives',
    name: '5 Learning Objectives',
    description: 'Generate 5 SMART learning objectives for a topic',
    tag: 'Generates in seconds',
    icon: TargetIcon,
    iconColor: 'text-brand-600',
    inputs: [
      { key: 'topic', label: 'Topic', type: 'text', placeholder: 'e.g., HIPAA compliance fundamentals' },
      {
        key: 'bloomLevel',
        label: "Bloom's Level",
        type: 'select',
        options: BLOOM_LEVELS.map((b) => ({ value: b.key, label: b.label })),
        defaultValue: 'apply',
      },
    ],
  },
  {
    type: 'questions',
    name: '10 Assessment Questions',
    description: 'Quickly generate 10 mixed-type questions',
    tag: 'Generates in seconds',
    icon: ClipboardIcon,
    iconColor: 'text-purple-600',
    inputs: [
      { key: 'topic', label: 'Topic', type: 'text', placeholder: 'e.g., Phishing awareness and prevention' },
    ],
  },
  {
    type: 'discussion-prompts',
    name: 'Discussion Prompts',
    description: 'Create 5 discussion questions for group learning',
    tag: 'Generates in seconds',
    icon: ChatIcon,
    iconColor: 'text-sky-600',
    inputs: [
      { key: 'topic', label: 'Topic', type: 'text', placeholder: 'e.g., Conflict resolution in teams' },
      { key: 'context', label: 'Course Context', type: 'text', placeholder: 'e.g., New manager leadership program' },
    ],
  },
  {
    type: 'reflection-questions',
    name: 'Reflection Questions',
    description: 'Generate end-of-module reflection prompts',
    tag: 'Generates in seconds',
    icon: LightbulbIcon,
    iconColor: 'text-amber-500',
    inputs: [
      { key: 'topic', label: 'Topic', type: 'text', placeholder: 'e.g., Active listening skills' },
      { key: 'count', label: 'Number of Questions (3–8)', type: 'number', min: 3, max: 8, defaultValue: 5 },
    ],
  },
  {
    type: 'case-study',
    name: 'Case Study',
    description: 'Create a realistic scenario-based case study',
    tag: 'Generates in seconds',
    icon: BriefcaseIcon,
    iconColor: 'text-teal-600',
    inputs: [
      { key: 'topic', label: 'Topic', type: 'text', placeholder: 'e.g., Data breach response' },
      { key: 'industry', label: 'Industry / Context', type: 'text', placeholder: 'e.g., Healthcare, Financial Services' },
      {
        key: 'complexity',
        label: 'Complexity',
        type: 'select',
        options: [
          { value: 'simple', label: 'Simple — straightforward scenario' },
          { value: 'complex', label: 'Complex — multiple stakeholders, ambiguity' },
        ],
        defaultValue: 'simple',
      },
    ],
  },
  {
    type: 'job-aid',
    name: 'Job Aid',
    description: 'Build a quick-reference job aid or checklist',
    tag: 'Generates in seconds',
    icon: DocumentIcon,
    iconColor: 'text-green-600',
    inputs: [
      { key: 'topic', label: 'Task / Process Name', type: 'text', placeholder: 'e.g., Incident reporting procedure' },
      {
        key: 'format',
        label: 'Format',
        type: 'select',
        options: [
          { value: 'checklist', label: 'Checklist' },
          { value: 'steps', label: 'Step-by-Step Guide' },
          { value: 'decision-tree', label: 'Decision Tree' },
        ],
        defaultValue: 'checklist',
      },
    ],
  },
  {
    type: 'activity-instructions',
    name: 'Activity Instructions',
    description: 'Write instructions for a learning activity',
    tag: 'Generates in seconds',
    icon: PuzzleIcon,
    iconColor: 'text-rose-600',
    inputs: [
      { key: 'topic', label: 'Topic', type: 'text', placeholder: 'e.g., Risk identification workshop' },
      { key: 'activityType', label: 'Activity Type', type: 'text', placeholder: 'e.g., Role-play, Case analysis, Brainstorm' },
      {
        key: 'duration',
        label: 'Duration (minutes)',
        type: 'select',
        options: [
          { value: '10', label: '10 minutes' },
          { value: '15', label: '15 minutes' },
          { value: '20', label: '20 minutes' },
          { value: '30', label: '30 minutes' },
          { value: '45', label: '45 minutes' },
          { value: '60', label: '60 minutes' },
        ],
        defaultValue: '20',
      },
      {
        key: 'grouping',
        label: 'Grouping',
        type: 'select',
        options: [
          { value: 'individual', label: 'Individual' },
          { value: 'pairs', label: 'Pairs' },
          { value: 'small-group', label: 'Small Group (3–5)' },
          { value: 'full-class', label: 'Full Class' },
        ],
        defaultValue: 'small-group',
      },
    ],
  },
];

// ── Content Generators ──

function generateObjectives(inputs: Record<string, string>): string {
  const { topic, bloomLevel } = inputs;
  const level = BLOOM_LEVELS.find((b) => b.key === bloomLevel);
  const verbs = level?.verbs ?? ['identify', 'explain', 'apply', 'analyze', 'evaluate'];
  const label = level?.label ?? 'Apply';

  return `# 5 Learning Objectives — ${topic}
Bloom's Level: ${label}

By the end of this module, learners will be able to:

1. **${capitalize(verbs[0])}** the key concepts and terminology associated with ${topic}.

2. **${capitalize(verbs[1])}** how ${topic} applies in a real-world professional context, using concrete examples from practice.

3. **${capitalize(verbs[2])}** the principles of ${topic} to resolve common workplace challenges or scenarios.

4. **${capitalize(verbs[3])}** the relationship between ${topic} and related policies, processes, or frameworks within the organization.

5. **${capitalize(verbs[4] ?? verbs[0])}** the effectiveness of different approaches to ${topic}, selecting the most appropriate strategy given specific constraints.

---
Design Notes:
- Objectives progress from foundational to applied cognition
- All 5 objectives are assessable via scenario-based questions or performance tasks
- Each objective can be mapped to a specific module lesson`;
}

function generateQuestions(inputs: Record<string, string>): string {
  const { topic } = inputs;

  return `# 10 Assessment Questions — ${topic}

## Multiple Choice (3 questions)

**Q1.** Which of the following best describes the primary purpose of ${topic}?
- A) To reduce administrative overhead
- B) To establish a structured approach to identifying and managing key challenges
- C) To replace existing organizational processes entirely
- D) To document team responsibilities for audit purposes
*Correct: B | Bloom's: Understand*

**Q2.** A practitioner is implementing ${topic} for the first time. What should be their first step?
- A) Select the tools and technologies to be used
- B) Conduct a needs assessment to identify gaps and requirements
- C) Communicate the rollout plan to all stakeholders
- D) Establish key performance indicators
*Correct: B | Bloom's: Apply*

**Q3.** Which scenario represents the most effective application of ${topic}?
- A) Applying a standard template without reviewing the organizational context
- B) Tailoring the approach based on a thorough analysis of learner needs and constraints
- C) Delegating the process entirely to external consultants
- D) Implementing the approach in phases based on team availability
*Correct: B | Bloom's: Evaluate*

---
## True / False (3 questions)

**Q4.** ${topic} can be applied without modifying existing workflows. *(False — integration with current workflows is essential for adoption)*

**Q5.** A needs assessment is a required first step before implementing ${topic}. *(True — skipping analysis leads to misaligned solutions)*

**Q6.** The outcomes of ${topic} are the same regardless of the organizational context. *(False — outcomes must be tailored to context, audience, and constraints)*

---
## Short Answer (2 questions)

**Q7.** In 2–3 sentences, explain why ${topic} is important to your role and how it connects to your day-to-day responsibilities.
*Expected: Learner articulates the relevance of the concept to their specific work context.*

**Q8.** List three factors that influence how ${topic} should be implemented in a given organization.
*Expected: Any 3 of: audience characteristics, resource constraints, organizational culture, regulatory requirements, timeline, stakeholder priorities.*

---
## Scenario-Based (2 questions)

**Q9.** You are leading a project to implement ${topic} for a team of 25 employees across three departments. Midway through the rollout, you discover that two departments have significantly different needs than anticipated. What steps would you take to adapt your approach?
*Rubric: Identifies the need to reassess → Engages stakeholders → Adjusts the plan → Communicates changes → Monitors outcomes*

**Q10.** A colleague argues that ${topic} is unnecessary overhead and proposes skipping it to save time. How would you respond, and what evidence would you use to support the value of the process?
*Rubric: Acknowledges concern → Provides evidence of value → Offers a middle-ground solution → Demonstrates understanding of trade-offs*`;
}

function generateDiscussionPrompts(inputs: Record<string, string>): string {
  const { topic, context } = inputs;
  const ctx = context || 'this course';

  return `# Discussion Prompts — ${topic}
Context: ${ctx}

---
**Prompt 1 — Personal Experience**
Think about a time when you encountered a situation related to ${topic} in your own work. What happened, how did you respond, and what would you do differently now with the knowledge you have gained?

*Facilitation Tip: Encourage learners to be specific. If they struggle, offer a hypothetical: "Imagine you were in X situation — how would you approach it?"*

---
**Prompt 2 — Real-World Application**
Looking at your current role or organization, where do you see the greatest opportunity to apply the principles of ${topic}? What barriers might you face, and how would you overcome them?

*Facilitation Tip: Push for concrete examples. Ask follow-up questions: "What would that look like in practice?" or "Who else would need to be involved?"*

---
**Prompt 3 — Challenging Assumptions**
Some practitioners argue that ${topic} is more theoretical than practical. Do you agree or disagree? What evidence from your own experience supports your position?

*Facilitation Tip: This prompt is designed to spark debate. Validate different perspectives while redirecting to evidence-based reasoning.*

---
**Prompt 4 — Cross-Functional Implications**
How does ${topic} affect people outside your immediate team? Consider the impact on other departments, customers, or external stakeholders. What responsibilities does this create for practitioners?

*Facilitation Tip: Encourage learners to think beyond their own role. A systems-thinking lens is valuable here.*

---
**Prompt 5 — Ethical Dimensions**
Are there ethical considerations involved in ${topic}? What responsibilities do you have to ensure that your approach is fair, inclusive, and respects the needs of all stakeholders?

*Facilitation Tip: This can be sensitive — create a safe space for reflection. Remind learners there are no "wrong" answers in reflective discussion.`;
}

function generateReflectionQuestions(inputs: Record<string, string>): string {
  const { topic, count } = inputs;
  const n = parseInt(count ?? '5', 10);

  const allQuestions = [
    { q: `What was the most surprising or counterintuitive thing you learned about ${topic}?`, j: 'Write for 3–5 minutes without stopping. Let your thoughts flow.' },
    { q: `How has your understanding of ${topic} changed since the beginning of this module?`, j: 'Compare your thinking "before" and "after." Be specific about what shifted.' },
    { q: `Which concept or principle from ${topic} do you find most immediately useful in your current role? Why?`, j: 'Ground your response in a real task or challenge you face at work.' },
    { q: `What questions do you still have about ${topic} that you want to explore further?`, j: 'Unanswered questions are a sign of deep learning. Write down at least 2.' },
    { q: `If you were explaining ${topic} to a colleague who had no prior knowledge, how would you describe it in plain language?`, j: 'Try writing your explanation as if composing a brief email to a teammate.' },
    { q: `Where do you anticipate challenges when applying what you have learned about ${topic}? How might you overcome them?`, j: 'Be honest about potential barriers — resources, time, culture, confidence.' },
    { q: `What additional support, tools, or information would help you apply ${topic} more effectively?`, j: 'Identify 1–2 specific resources or types of support that would be helpful.' },
    { q: `How does ${topic} connect to broader goals in your organization or profession?`, j: `Think about the "big picture." How does this fit into your organization's mission or strategy?` },
  ];

  const selected = allQuestions.slice(0, Math.min(n, allQuestions.length));

  const lines = [`# Reflection Questions — ${topic}\n`];
  selected.forEach((item, i) => {
    lines.push(`**Reflection ${i + 1}**`);
    lines.push(item.q);
    lines.push(`*Journaling Prompt: ${item.j}*\n`);
  });

  lines.push('---');
  lines.push('*Facilitator Note: Allow 5–10 minutes for silent reflection before opening for sharing. Reinforce that these are personal — learners are never required to share.*');

  return lines.join('\n');
}

function generateCaseStudy(inputs: Record<string, string>): string {
  const { topic, industry, complexity } = inputs;
  const ind = industry || 'a mid-sized organization';
  const isComplex = complexity === 'complex';

  return `# Case Study — ${topic}
Industry: ${ind} | Complexity: ${isComplex ? 'Complex' : 'Simple'}

---
## Background

Meridian ${ind} is a ${isComplex ? 'multinational organization with 4,200 employees across 12 locations' : 'regional organization with 180 employees'}. Over the past ${isComplex ? 'three years' : 'twelve months'}, leadership has identified a critical gap in how the organization manages ${topic}.${isComplex ? ' The challenge is compounded by differences in local regulations, departmental cultures, and varying levels of staff expertise.' : ''}

---
## The Situation

${isComplex
  ? `Jordan, a senior manager, has been tasked with leading an organization-wide initiative to improve ${topic}. Jordan must coordinate with HR, Operations, Legal, and IT — each of whom has a different perspective on the problem and competing priorities. Recent audit findings have created urgency, but budget constraints limit the scope of possible solutions. To complicate matters, two departments have already implemented their own informal approaches, creating inconsistency across the organization.`
  : `Alex, a team lead, has been asked to improve how the team handles ${topic}. The current process is inconsistent, and recent feedback from staff suggests confusion about expectations. Alex has two weeks to propose a solution before the next department meeting.`
}

---
## Key Facts

- Current state: ${isComplex ? 'Inconsistent practices across 12 locations; no standardized process; 3 recent compliance incidents' : 'Ad-hoc approach; no documented process; staff unsure of responsibilities'}
- Desired state: ${isComplex ? 'Organization-wide standardization, measurable compliance, 90% staff competency within 6 months' : 'Clear, documented process; staff confident in their roles; no repeat errors'}
- Constraints: ${isComplex ? 'Budget of $80,000; must not disrupt Q3 operations; legal must approve all changes' : 'Limited budget; 2-week timeline; team is already at capacity'}
- Stakeholders: ${isComplex ? 'Executive leadership, HR director, 12 site managers, Legal counsel, IT security team, front-line employees' : 'Team lead, 3 direct reports, department manager'}

---
## Discussion Questions

1. What are the root causes of the problem described in this case? How would you distinguish between symptoms and underlying issues?

2. ${isComplex ? 'Jordan faces conflicting priorities from different stakeholders. How should stakeholder needs be balanced when designing a solution?' : 'Alex has limited time and resources. What criteria would you use to prioritize your actions?'}

3. What approach to ${topic} would you recommend in this scenario? Justify your recommendation with at least two principles from this course.

4. What risks does your recommended approach carry? How would you mitigate them?

5. How would you measure success? Define at least two specific, measurable indicators that would tell you the solution is working.

---
## Teaching Notes

**Key Learning Points:**
- Root cause analysis before jumping to solutions
- Stakeholder engagement and communication planning
- Applying course principles to messy, real-world situations
- Trade-off analysis under constraints

**Facilitation Approach:**
- Allow 10–15 minutes for individual/group reading
- Small group discussion (15–20 minutes)
- Full-group debrief focusing on question 3 and 4
- Avoid giving "the answer" — focus on quality of reasoning

**Common Misconceptions to Address:**
- Assuming there is one correct solution
- Underestimating the importance of stakeholder communication
- Focusing only on the technical fix without addressing the human/organizational dimension`;
}

function generateJobAid(inputs: Record<string, string>): string {
  const { topic, format } = inputs;

  if (format === 'steps') {
    return `# Step-by-Step Guide — ${topic}

**When to use this guide:** Refer to this guide whenever you need to complete ${topic} correctly and consistently.

---
## Step 1: Prepare

Before you begin, confirm you have:
- [ ] Required access, credentials, or permissions
- [ ] All supporting documentation or information
- [ ] Notified relevant stakeholders (if required)

## Step 2: Review Requirements

- Identify the specific requirements or standards that apply to this task
- Confirm any deadlines or time-sensitive constraints
- Check for any exceptions or special circumstances

## Step 3: Execute

- Follow the standard procedure from beginning to end
- Document each action as you complete it
- If you encounter an error or unexpected situation, stop and refer to the Escalation section

## Step 4: Verify

- Review your completed work against the acceptance criteria
- Confirm all required fields, signatures, or approvals are in place
- Perform a final quality check before submitting or closing

## Step 5: Document and Close

- Record the completion in the appropriate system or log
- Notify relevant parties that the task is complete
- File documentation according to your organization's retention policy

---
## Escalation

If you encounter an issue you cannot resolve:
1. Stop the process at the current step
2. Document what happened and where
3. Contact your supervisor or the designated point of contact
4. Do not proceed until you have received guidance

---
*Quick Reference Card | Version 1.0 | Review annually*`;
  }

  if (format === 'decision-tree') {
    return `# Decision Tree — ${topic}

**Use this guide to determine the correct course of action.**

---
## START HERE

**Does this situation involve ${topic}?**
- YES → Continue to Step A
- NO → Standard operating procedure applies. No further action required.

---
## Step A: Assess Urgency

**Is this situation time-sensitive (required within 24 hours)?**
- YES → Escalate immediately to your supervisor. Use the emergency contact list.
- NO → Continue to Step B.

---
## Step B: Determine Scope

**Does this affect more than one person, team, or system?**
- YES → Coordinate with all affected parties before proceeding. Continue to Step C.
- NO → You may proceed independently. Continue to Step C.

---
## Step C: Verify Authority

**Do you have the authority and resources to resolve this yourself?**
- YES → Proceed with the standard process. Document your actions. Go to Step D.
- NO → Submit a request to the appropriate team or approver. Track the request. Go to Step D.

---
## Step D: Document and Close

- Record what action was taken and the outcome
- Notify relevant stakeholders
- Archive documentation per retention policy

---
## Need Help?

| Situation | Contact |
|---|---|
| Urgent / After hours | Emergency Contact List |
| Policy questions | HR or Legal |
| Technical issues | IT Help Desk |
| All other questions | Your direct supervisor |

---
*Quick Reference Card | Version 1.0 | Review annually*`;
  }

  // Default: checklist
  return `# Checklist — ${topic}

**Instructions:** Complete each item in order. Check the box when done. Do not skip steps.

---
## Before You Begin

- [ ] Confirm you have the authority to complete this task
- [ ] Gather all required information and supporting documents
- [ ] Notify stakeholders who need to be informed

---
## During Execution

- [ ] Review applicable policies or standards before starting
- [ ] Follow the approved procedure step by step
- [ ] Document each action as you complete it
- [ ] Verify your work against acceptance criteria at each stage
- [ ] Flag any deviations or exceptions immediately to your supervisor

---
## Quality Check

- [ ] Review the completed work from beginning to end
- [ ] Confirm all required approvals or signatures are in place
- [ ] Ensure nothing has been skipped or left incomplete

---
## Completion

- [ ] Record the completion in the appropriate system or log
- [ ] Notify relevant parties that the task is complete
- [ ] File all documentation according to retention policy
- [ ] Note any process improvements for future reference

---
## If Something Goes Wrong

- [ ] Stop the process at the current step
- [ ] Document exactly what occurred and where
- [ ] Contact your supervisor or designated escalation contact
- [ ] Do not proceed until guidance is received

---
*Quick Reference Checklist | Version 1.0 | Review annually*`;
}

function generateActivityInstructions(inputs: Record<string, string>): string {
  const { topic, activityType, duration, grouping } = inputs;
  const dur = duration || '20';
  const grp = grouping || 'small-group';
  const act = activityType || 'collaborative activity';

  const groupLabel =
    grp === 'individual' ? 'Individual' :
    grp === 'pairs' ? 'Pairs' :
    grp === 'small-group' ? 'Small groups of 3–5' :
    'Full class';

  return `# Activity Instructions — ${topic}
Type: ${act} | Duration: ${dur} minutes | Grouping: ${groupLabel}

---
## Overview

In this activity, learners will engage directly with the concepts covered in the module by applying what they have learned about ${topic} to a structured ${act.toLowerCase()} experience. This activity targets the Apply level of Bloom's Taxonomy.

---
## Learning Objectives Addressed

- Apply the core principles of ${topic} to a realistic scenario
- Practice decision-making under realistic constraints
- Receive and provide constructive peer feedback

---
## Materials Needed

- Activity scenario handout (see below)
- Pen/paper or digital note-taking tool
- Timer
${grp !== 'individual' ? '- Whiteboard or shared workspace for group output' : ''}

---
## Facilitator Setup (5 minutes before activity)

1. ${grp === 'individual' ? 'Ensure learners have their materials and are seated comfortably.' : `Divide learners into ${groupLabel.toLowerCase()}. Assign a role in each group: Facilitator, Recorder, and Presenter.`}
2. Cue up the timer for ${dur} minutes.
3. Brief the group: explain the purpose and the expected output.
4. Address any questions before starting the clock.

---
## Activity Steps

**Phase 1 — Read and Understand (${Math.round(parseInt(dur) * 0.2)} minutes)**
${grp === 'individual' ? 'Read the scenario independently.' : 'Read the scenario as a group. The Facilitator reads aloud while others follow along.'}
Identify: What is the core problem? Who are the key stakeholders? What information do you have?

**Phase 2 — ${grp === 'individual' ? 'Analyze and Respond' : 'Discuss and Decide'} (${Math.round(parseInt(dur) * 0.5)} minutes)**
Apply the principles of ${topic} to develop your response.
Consider: What approach would you take? What are the trade-offs? What are the risks?
${grp !== 'individual' ? 'The Recorder should capture the group\'s reasoning, not just the conclusion.' : 'Write out your reasoning, not just your answer.'}

**Phase 3 — Capture Output (${Math.round(parseInt(dur) * 0.2)} minutes)**
Summarize your ${grp === 'individual' ? 'response' : 'group\'s recommendation'} in 3–5 bullet points.
Be prepared to share your reasoning with the full group.

**Phase 4 — Debrief Preparation (${Math.round(parseInt(dur) * 0.1)} minutes)**
${grp !== 'individual' ? 'The Presenter prepares to share the group\'s key takeaways (2 minutes max).' : 'Prepare one insight you want to share with the class.'}

---
## Debrief Questions (Facilitator-Led, after activity)

1. What was the most challenging aspect of applying ${topic} to this scenario?
2. Did your group disagree at any point? How did you resolve the disagreement?
3. What would you do differently if you faced this situation at work?
4. What principle from this module was most useful in guiding your decision?

---
## Assessment Connection

The output from this activity can serve as a formative check. Facilitators should look for:
- Accurate application of core concepts
- Evidence of reasoning, not just conclusions
- Awareness of trade-offs and constraints
- Connection to real-world context

---
*Estimated Total Time: ${dur} minutes | Modalities: Kinesthetic, Read/Write, Auditory*`;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateContent(tool: ToolDef, inputs: Record<string, string>): string {
  switch (tool.type) {
    case 'objectives': return generateObjectives(inputs);
    case 'questions': return generateQuestions(inputs);
    case 'discussion-prompts': return generateDiscussionPrompts(inputs);
    case 'reflection-questions': return generateReflectionQuestions(inputs);
    case 'case-study': return generateCaseStudy(inputs);
    case 'job-aid': return generateJobAid(inputs);
    case 'activity-instructions': return generateActivityInstructions(inputs);
    default: return '# Generated Content\n\nContent generated successfully.';
  }
}

// ── Type Badge ──

const TYPE_LABELS: Record<QuickGenerateType, string> = {
  objectives: 'Objectives',
  questions: 'Questions',
  'discussion-prompts': 'Discussion',
  'reflection-questions': 'Reflection',
  'case-study': 'Case Study',
  'job-aid': 'Job Aid',
  'activity-instructions': 'Activity',
};

const TYPE_COLORS: Record<QuickGenerateType, string> = {
  objectives: 'bg-brand-100 text-brand-800',
  questions: 'bg-purple-100 text-purple-800',
  'discussion-prompts': 'bg-sky-100 text-sky-800',
  'reflection-questions': 'bg-amber-100 text-amber-800',
  'case-study': 'bg-teal-100 text-teal-800',
  'job-aid': 'bg-green-100 text-green-800',
  'activity-instructions': 'bg-rose-100 text-rose-800',
};

function TypeBadge({ type }: { type: QuickGenerateType }) {
  return (
    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', TYPE_COLORS[type])}>
      {TYPE_LABELS[type]}
    </span>
  );
}

// ── Tool Card ──

function ToolCard({ tool, onClick }: { tool: ToolDef; onClick: () => void }) {
  const Icon = tool.icon;
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl border border-surface-200 p-4 hover:shadow-md hover:border-brand-200 transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-surface-50 rounded-lg group-hover:bg-brand-50 transition-colors">
          <Icon className={cn('w-6 h-6', tool.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-surface-900 mb-1">{tool.name}</h3>
          <p className="text-xs text-surface-600 mb-2">{tool.description}</p>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {tool.tag}
          </span>
        </div>
      </div>
    </button>
  );
}

// ── Generation Panel (Modal) ──

function GenerationPanel({
  tool,
  projectId,
  onClose,
  onSave,
}: {
  tool: ToolDef;
  projectId: string;
  onClose: () => void;
  onSave: (result: QuickGenerateResult) => void;
}) {
  const [inputs, setInputs] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    tool.inputs.forEach((inp) => {
      if (inp.defaultValue !== undefined) defaults[inp.key] = String(inp.defaultValue);
    });
    return defaults;
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { addQuickGenerateResult } = useAppStore();

  const Icon = tool.icon;

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setResult(null);
    await new Promise((resolve) => setTimeout(resolve, 400));
    const content = generateContent(tool, inputs);
    setResult(content);
    setIsGenerating(false);
  }, [tool, inputs]);

  const handleCopy = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }, [result]);

  const handleSave = useCallback(() => {
    if (!result) return;
    const topic = inputs.topic || 'Untitled';
    const bloomLevel = (inputs.bloomLevel as BloomLevel) || undefined;
    const saved = addQuickGenerateResult({
      projectId,
      type: tool.type,
      topic,
      bloomLevel,
      content: result,
    });
    onSave(saved);
  }, [result, inputs, addQuickGenerateResult, projectId, tool.type, onSave]);

  const setInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-50 rounded-lg">
              <Icon className={cn('w-5 h-5', tool.iconColor)} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-surface-900">{tool.name}</h2>
              <p className="text-xs text-surface-500">{tool.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Inputs */}
          <div className="space-y-3">
            {tool.inputs.map((input) => (
              <div key={input.key}>
                <label className="block text-xs font-medium text-surface-700 mb-1">
                  {input.label}
                </label>
                {input.type === 'text' && (
                  <input
                    type="text"
                    placeholder={input.placeholder}
                    value={inputs[input.key] ?? ''}
                    onChange={(e) => setInput(input.key, e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent placeholder:text-surface-400"
                  />
                )}
                {input.type === 'select' && (
                  <select
                    value={inputs[input.key] ?? (input.defaultValue ? String(input.defaultValue) : '')}
                    onChange={(e) => setInput(input.key, e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white"
                  >
                    {input.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                )}
                {input.type === 'number' && (
                  <input
                    type="number"
                    min={input.min}
                    max={input.max}
                    value={inputs[input.key] ?? (input.defaultValue ? String(input.defaultValue) : '')}
                    onChange={(e) => setInput(input.key, e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                  />
                )}
              </div>
            ))}
          </div>

          <Button
            variant="primary"
            fullWidth
            onClick={handleGenerate}
            loading={isGenerating}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </Button>

          {/* Result */}
          {result && (
            <div className="border border-surface-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-surface-50 border-b border-surface-200">
                <span className="text-xs font-semibold text-surface-600 uppercase tracking-wide">
                  Generated Output
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 text-xs font-medium text-surface-600 hover:text-brand-700 px-2 py-1 rounded hover:bg-brand-50 transition-colors"
                  >
                    <CopyIcon className="w-3.5 h-3.5" />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="bg-surface-50 p-4 overflow-x-auto max-h-64 overflow-y-auto">
                <pre className="text-xs text-surface-800 whitespace-pre-wrap font-mono leading-relaxed">
                  {result}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {result && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-200 bg-surface-50">
            <Button variant="secondary" onClick={onClose} size="sm">
              Close
            </Button>
            <Button variant="primary" onClick={handleSave} size="sm">
              Save to History
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Result Row ──

function ResultRow({
  result,
  onDelete,
}: {
  result: QuickGenerateResult;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="bg-white border border-surface-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <TypeBadge type={result.type} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-surface-900 truncate">{result.topic}</p>
          {!expanded && (
            <p className="text-xs text-surface-500 mt-0.5 truncate">
              {result.content.slice(0, 100)}...
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[11px] text-surface-400 hidden sm:block">
            {formatRelativeTime(result.createdAt)}
          </span>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded text-surface-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
            title="Copy"
          >
            <CopyIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className={cn(
              'p-1.5 rounded text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-all',
              expanded && 'rotate-180'
            )}
            title="Expand"
          >
            <ChevronDownIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded text-surface-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      {copied && (
        <div className="px-4 pb-2">
          <span className="text-[11px] text-green-600 font-medium">Copied to clipboard!</span>
        </div>
      )}
      {expanded && (
        <div className="border-t border-surface-200 bg-surface-50 p-4">
          <pre className="text-xs text-surface-800 whitespace-pre-wrap font-mono leading-relaxed max-h-80 overflow-y-auto">
            {result.content}
          </pre>
        </div>
      )}
    </div>
  );
}

// ── Main Component ──

export default function QuickGenerate({ projectId }: { projectId: string }) {
  const [activeTool, setActiveTool] = useState<ToolDef | null>(null);
  const [localResults, setLocalResults] = useState<QuickGenerateResult[]>([]);

  const { getDevToolData } = useAppStore();
  const { quickResults } = getDevToolData(projectId);

  const allResults = [
    ...localResults,
    ...quickResults.filter((r) => !localResults.find((lr) => lr.id === r.id)),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleSave = useCallback((result: QuickGenerateResult) => {
    setLocalResults((prev) => {
      if (prev.find((r) => r.id === result.id)) return prev;
      return [result, ...prev];
    });
    setActiveTool(null);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setLocalResults((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Tool Cards */}
      <div className="p-6 border-b border-surface-200">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-surface-900">Quick Generate</h2>
          <p className="text-sm text-surface-500 mt-1">
            Template-based tools that generate instructional design artifacts in seconds.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TOOLS.map((tool) => (
            <ToolCard
              key={tool.type}
              tool={tool}
              onClick={() => setActiveTool(tool)}
            />
          ))}
        </div>
      </div>

      {/* Results History */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-surface-900">Generated Content</h3>
          {allResults.length > 0 && (
            <span className="text-xs text-surface-500 bg-surface-100 px-2.5 py-1 rounded-full">
              {allResults.length} item{allResults.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {allResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 bg-surface-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-surface-600">No content generated yet</p>
            <p className="text-xs text-surface-400 mt-1">
              Click any tool above to generate instructional design artifacts instantly.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {allResults.map((result) => (
              <ResultRow
                key={result.id}
                result={result}
                onDelete={() => handleDelete(result.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Generation Panel Modal */}
      {activeTool && (
        <GenerationPanel
          tool={activeTool}
          projectId={projectId}
          onClose={() => setActiveTool(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
