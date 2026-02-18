'use client';

import React, { useState, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import {
  AssessmentQuestion,
  AssessmentQuestionType,
  ASSESSMENT_QUESTION_TYPES,
  BloomLevel,
  BLOOM_LEVELS,
  QuestionDifficulty,
  AnswerChoice,
  MatchingPair,
} from '@/lib/types';
import { cn, generateId } from '@/lib/utils';
import Button from '@/components/ui/Button';

// ── Color helpers ──

function bloomColor(level: BloomLevel): string {
  switch (level) {
    case 'remember':   return 'bg-gray-100 text-gray-700 border-gray-300';
    case 'understand': return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'apply':      return 'bg-green-100 text-green-700 border-green-300';
    case 'analyze':    return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'evaluate':   return 'bg-orange-100 text-orange-700 border-orange-300';
    case 'create':     return 'bg-purple-100 text-purple-700 border-purple-300';
  }
}

function bloomPillActive(level: BloomLevel): string {
  switch (level) {
    case 'remember':   return 'bg-gray-600 text-white border-gray-600';
    case 'understand': return 'bg-blue-600 text-white border-blue-600';
    case 'apply':      return 'bg-green-600 text-white border-green-600';
    case 'analyze':    return 'bg-yellow-500 text-white border-yellow-500';
    case 'evaluate':   return 'bg-orange-500 text-white border-orange-500';
    case 'create':     return 'bg-purple-600 text-white border-purple-600';
  }
}

function difficultyColor(d: QuestionDifficulty): string {
  switch (d) {
    case 'foundational':  return 'bg-green-100 text-green-700';
    case 'intermediate':  return 'bg-yellow-100 text-yellow-700';
    case 'advanced':      return 'bg-red-100 text-red-700';
  }
}

function typeColor(t: AssessmentQuestionType): string {
  switch (t) {
    case 'multiple-choice':  return 'bg-brand-100 text-brand-700';
    case 'true-false':       return 'bg-teal-100 text-teal-700';
    case 'matching':         return 'bg-indigo-100 text-indigo-700';
    case 'short-answer':     return 'bg-cyan-100 text-cyan-700';
    case 'essay':            return 'bg-rose-100 text-rose-700';
    case 'scenario-based':   return 'bg-amber-100 text-amber-700';
    case 'ordering':         return 'bg-violet-100 text-violet-700';
  }
}

function estimatedTimeForType(t: AssessmentQuestionType): number {
  switch (t) {
    case 'multiple-choice':  return 1;
    case 'true-false':       return 0.5;
    case 'matching':         return 2;
    case 'short-answer':     return 3;
    case 'essay':            return 10;
    case 'scenario-based':   return 3;
    case 'ordering':         return 2;
  }
}

// ── Question Generation Logic ──

const MC_TEMPLATES = [
  {
    stem: (t: string) => `Which of the following BEST describes ${t}?`,
    choices: (t: string): AnswerChoice[] => [
      { id: generateId(), text: `A systematic approach to understanding and applying ${t} principles`, isCorrect: true, explanation: `This is correct because it accurately captures the core nature of ${t} as a structured, principle-based practice.` },
      { id: generateId(), text: `An informal method of working with ${t} without defined guidelines`, isCorrect: false, explanation: `Incorrect. ${t} relies on defined principles and structured approaches, not informal methods.` },
      { id: generateId(), text: `A one-time activity that produces immediate results without ongoing effort`, isCorrect: false, explanation: `Incorrect. ${t} is an ongoing practice that requires consistent application, not a one-time activity.` },
      { id: generateId(), text: `A technology-only solution that eliminates the need for human judgment`, isCorrect: false, explanation: `Incorrect. While tools may support ${t}, human judgment and decision-making remain essential.` },
    ],
  },
  {
    stem: (t: string) => `A professional encounters a challenge related to ${t}. What is the MOST appropriate first step?`,
    choices: (t: string): AnswerChoice[] => [
      { id: generateId(), text: `Assess the situation and gather relevant information before taking action`, isCorrect: true, explanation: `Correct. Sound practice in ${t} begins with a thorough assessment to ensure any action is informed and appropriate.` },
      { id: generateId(), text: `Immediately implement the most common solution used for ${t} problems`, isCorrect: false, explanation: `Incorrect. Applying a generic solution without assessment may address the wrong issue.` },
      { id: generateId(), text: `Delegate the problem to someone with less experience in ${t}`, isCorrect: false, explanation: `Incorrect. Delegation without proper context could worsen the situation.` },
      { id: generateId(), text: `Document the problem and wait for it to resolve on its own`, isCorrect: false, explanation: `Incorrect. Waiting without action is rarely appropriate and may allow the problem to escalate.` },
    ],
  },
  {
    stem: (t: string) => `Which statement about ${t} is MOST accurate?`,
    choices: (t: string): AnswerChoice[] => [
      { id: generateId(), text: `${t} requires both theoretical knowledge and practical application to be effective`, isCorrect: true, explanation: `Correct. Combining conceptual understanding with hands-on application is fundamental to ${t}.` },
      { id: generateId(), text: `${t} can be fully mastered from reading about it, without any practice`, isCorrect: false, explanation: `Incorrect. Practical application is essential — theoretical knowledge alone is insufficient.` },
      { id: generateId(), text: `${t} applies only in highly specialized contexts and has limited general utility`, isCorrect: false, explanation: `Incorrect. ${t} has broad applicability across many contexts.` },
      { id: generateId(), text: `${t} is primarily a concern for senior professionals, not those early in their careers`, isCorrect: false, explanation: `Incorrect. Understanding ${t} is valuable at every career stage.` },
    ],
  },
  {
    stem: (t: string) => `When implementing ${t} in a team environment, which approach is MOST effective?`,
    choices: (t: string): AnswerChoice[] => [
      { id: generateId(), text: `Establish shared understanding and consistent practices across all team members`, isCorrect: true, explanation: `Correct. Team alignment on ${t} ensures consistent outcomes and reduces errors from inconsistent application.` },
      { id: generateId(), text: `Allow each team member to independently develop their own approach to ${t}`, isCorrect: false, explanation: `Incorrect. Inconsistent approaches across a team typically create coordination problems and uneven results.` },
      { id: generateId(), text: `Assign one expert to manage all ${t} activities while others focus on other tasks`, isCorrect: false, explanation: `Incorrect. Creating a single point of dependency is a risk. Broader competency across the team is more resilient.` },
      { id: generateId(), text: `Implement ${t} only when problems arise, rather than proactively`, isCorrect: false, explanation: `Incorrect. Reactive-only approaches to ${t} are less effective than proactive application.` },
    ],
  },
  {
    stem: (t: string) => `Which of the following is a COMMON misconception about ${t}?`,
    choices: (t: string): AnswerChoice[] => [
      { id: generateId(), text: `That ${t} is a fixed, one-size-fits-all process that never requires adaptation`, isCorrect: true, explanation: `Correct. This IS a misconception. Effective ${t} requires adaptation to context, audience, and goals.` },
      { id: generateId(), text: `That ${t} involves continuous improvement and iterative refinement`, isCorrect: false, explanation: `Incorrect. This is actually TRUE about ${t}, not a misconception.` },
      { id: generateId(), text: `That ${t} benefits from stakeholder input and collaboration`, isCorrect: false, explanation: `Incorrect. Collaboration and stakeholder input genuinely improve ${t} outcomes.` },
      { id: generateId(), text: `That ${t} requires regular evaluation to remain effective`, isCorrect: false, explanation: `Incorrect. Ongoing evaluation is a genuine best practice in ${t}.` },
    ],
  },
];

const TF_TEMPLATES = [
  {
    stem: (t: string) => `${t} is most effective when it is adapted to the specific context and needs of the audience.`,
    correctAnswer: 'True',
    explanation: (t: string) => `True. Context-sensitivity is a core principle of effective ${t}. Rigid, unadapted approaches typically produce inferior outcomes.`,
  },
  {
    stem: (t: string) => `Mastering ${t} requires only reading about the topic, without hands-on application or practice.`,
    correctAnswer: 'False',
    explanation: (t: string) => `False. While foundational knowledge is important, ${t} competency requires practical application. Passive reading alone is insufficient.`,
  },
  {
    stem: (t: string) => `Regular evaluation and reflection are important components of effective ${t} practice.`,
    correctAnswer: 'True',
    explanation: (t: string) => `True. Ongoing evaluation helps practitioners identify what is working, what needs improvement, and how to adapt ${t} over time.`,
  },
  {
    stem: (t: string) => `${t} applies identically in all contexts and requires no adjustment based on situation.`,
    correctAnswer: 'False',
    explanation: (t: string) => `False. Skilled practitioners of ${t} adapt their approach based on context, audience, constraints, and goals.`,
  },
  {
    stem: (t: string) => `Collaboration with stakeholders can improve the quality and effectiveness of ${t} outcomes.`,
    correctAnswer: 'True',
    explanation: (t: string) => `True. Stakeholder input brings valuable perspectives and ensures ${t} efforts align with real-world needs and expectations.`,
  },
  {
    stem: (t: string) => `The foundational principles of ${t} are irrelevant for advanced practitioners who have years of experience.`,
    correctAnswer: 'False',
    explanation: (t: string) => `False. Foundational principles remain relevant regardless of experience level. Experienced practitioners apply them with greater nuance, not less.`,
  },
];

const MATCHING_TEMPLATES = [
  {
    stem: (t: string) => `Match each ${t} concept with its correct description.`,
    pairs: (t: string): MatchingPair[] => [
      { id: generateId(), prompt: `Core principle of ${t}`, match: `The foundational rule that governs how ${t} is applied effectively` },
      { id: generateId(), prompt: `${t} assessment`, match: `A systematic evaluation of how well ${t} objectives are being met` },
      { id: generateId(), prompt: `${t} implementation`, match: `The process of putting ${t} concepts into practice in a real context` },
      { id: generateId(), prompt: `${t} evaluation`, match: `Measuring outcomes and identifying opportunities to improve ${t} performance` },
    ],
  },
  {
    stem: (t: string) => `Match each ${t} term with the correct example.`,
    pairs: (t: string): MatchingPair[] => [
      { id: generateId(), prompt: `${t} planning`, match: `Identifying goals, resources, and timelines before beginning ${t} work` },
      { id: generateId(), prompt: `${t} execution`, match: `Carrying out the planned ${t} activities with fidelity to the design` },
      { id: generateId(), prompt: `${t} monitoring`, match: `Tracking progress against ${t} goals and making adjustments as needed` },
      { id: generateId(), prompt: `${t} documentation`, match: `Recording decisions, rationale, and outcomes related to ${t} work` },
    ],
  },
];

const SA_TEMPLATES = [
  {
    stem: (t: string) => `In your own words, define ${t} and explain why it matters in a professional context.`,
    correctAnswer: (t: string) => `A strong response should define ${t} clearly using precise terminology, explain the core purpose or function it serves, and connect it to meaningful professional outcomes. The response should demonstrate conceptual understanding rather than simply restating a memorized definition.`,
  },
  {
    stem: (t: string) => `List three key characteristics of ${t} and briefly explain each.`,
    correctAnswer: (t: string) => `Responses should identify three distinct, substantive characteristics of ${t}. Each characteristic should be clearly named and accompanied by a brief explanation of why it is significant. Vague or redundant characteristics should not receive full credit.`,
  },
  {
    stem: (t: string) => `Describe one situation where applying ${t} would be critical. What would happen if it were ignored?`,
    correctAnswer: (t: string) => `A strong response should describe a realistic, specific scenario where ${t} applies. The consequence of ignoring ${t} should be concrete and logical. Generic or implausible scenarios receive partial credit.`,
  },
];

const ESSAY_TEMPLATES = [
  {
    stem: (t: string) => `Evaluate the role of ${t} in a professional or organizational context. Support your analysis with specific examples and criteria. Your response should demonstrate higher-order thinking beyond basic recall.`,
    rubricPoints: (t: string): string[] => [
      `Accurately and completely defines ${t} with appropriate terminology (20%)`,
      `Evaluates the significance of ${t} using clear criteria and reasoning (25%)`,
      `Provides at least two specific, relevant examples that illustrate the concept (25%)`,
      `Identifies at least one limitation or challenge associated with ${t} (15%)`,
      `Writing is clear, organized, and uses appropriate professional language (15%)`,
    ],
  },
  {
    stem: (t: string) => `Design an approach for implementing ${t} in a new team or organization. Justify your design decisions using principles covered in the course.`,
    rubricPoints: (t: string): string[] => [
      `Proposes a coherent, logically organized implementation approach for ${t} (25%)`,
      `Justifies each design decision with reference to relevant principles (25%)`,
      `Addresses potential obstacles and how they would be handled (20%)`,
      `Connects the approach to measurable outcomes or success criteria (20%)`,
      `Demonstrates synthesis of course content, not just recall (10%)`,
    ],
  },
];

const SCENARIO_TEMPLATES = [
  {
    scenario: (t: string) => `Jordan is a mid-level professional who has just been assigned responsibility for ${t} on a major project. The team has limited prior experience with ${t}, and stakeholders have conflicting expectations about what success looks like. Jordan has two weeks to deliver an initial plan.`,
    stem: (t: string) => `What should Jordan do FIRST to set the project up for success?`,
    choices: (t: string): AnswerChoice[] => [
      { id: generateId(), text: `Conduct a stakeholder alignment session to establish shared expectations and define success criteria`, isCorrect: true, explanation: `Correct. Aligning stakeholders early on success criteria prevents rework and conflicting requirements downstream — a critical first step for any ${t} initiative.` },
      { id: generateId(), text: `Begin implementation immediately using a proven ${t} template from a previous project`, isCorrect: false, explanation: `Incorrect. Applying a template without understanding this project's specific needs risks building the wrong solution. Context matters in ${t}.` },
      { id: generateId(), text: `Request more time and delay starting until all uncertainties are resolved`, isCorrect: false, explanation: `Incorrect. Waiting for complete certainty is rarely feasible. Strong ${t} practice involves managing ambiguity, not waiting for it to disappear.` },
      { id: generateId(), text: `Delegate the planning to a team member and focus on managing stakeholder relationships only`, isCorrect: false, explanation: `Incorrect. While relationship management is important, delegating the planning without ownership creates accountability gaps.` },
    ],
  },
  {
    scenario: (t: string) => `A team has been using their current approach to ${t} for two years. A recent evaluation revealed that outcomes are below target and learner satisfaction scores have dropped. The team lead believes the issue is a lack of resources, but the data suggests the approach itself may need to change.`,
    stem: (t: string) => `Which response to this situation reflects BEST practice in ${t}?`,
    choices: (t: string): AnswerChoice[] => [
      { id: generateId(), text: `Conduct a root cause analysis before drawing conclusions, examining both the resource hypothesis and the approach hypothesis`, isCorrect: true, explanation: `Correct. Effective ${t} requires evidence-based decision-making. Testing competing hypotheses before acting prevents misallocating resources on the wrong solution.` },
      { id: generateId(), text: `Accept the team lead's diagnosis and immediately request additional budget`, isCorrect: false, explanation: `Incorrect. Acting on an untested hypothesis — even from a leader — risks solving the wrong problem. The data suggesting an approach issue should be investigated first.` },
      { id: generateId(), text: `Dismiss the evaluation results and continue with the current approach for another cycle`, isCorrect: false, explanation: `Incorrect. Ignoring evaluation data is contrary to evidence-based practice and will perpetuate underperformance.` },
      { id: generateId(), text: `Replace the entire ${t} approach immediately without further analysis`, isCorrect: false, explanation: `Incorrect. Wholesale replacement without diagnosis may discard what is working and introduce new problems.` },
    ],
  },
  {
    scenario: (t: string) => `A learner has just completed a training module on ${t} and passed the knowledge check with a perfect score. However, when asked to apply ${t} in a simulated task, they make several critical errors. Their manager is unsure how to interpret this discrepancy.`,
    stem: (t: string) => `What does this situation most likely indicate about the assessment design for ${t}?`,
    choices: (t: string): AnswerChoice[] => [
      { id: generateId(), text: `The knowledge check assessed recall but not application — the assessment was not aligned to performance outcomes`, isCorrect: true, explanation: `Correct. A gap between knowledge check scores and performance tasks indicates the assessment measured lower-order recall rather than the ability to apply ${t} in practice.` },
      { id: generateId(), text: `The learner performed poorly in the simulation because they were nervous, not because of a knowledge gap`, isCorrect: false, explanation: `Incorrect. While performance anxiety exists, a systematic pattern of errors in application suggests a substantive gap between knowing and doing.` },
      { id: generateId(), text: `The simulation was too difficult and should be replaced with another knowledge check`, isCorrect: false, explanation: `Incorrect. The simulation is likely the more valid measure of real competency. Replacing it with another recall check would make the problem worse.` },
      { id: generateId(), text: `The learner needs to retake the knowledge check until they can demonstrate consistency`, isCorrect: false, explanation: `Incorrect. Repeating the same type of assessment that already showed a ceiling score will not address the application gap.` },
    ],
  },
];

const ORDERING_TEMPLATES = [
  {
    stem: (t: string) => `Place the following phases of the ${t} process in the correct sequence, from first to last.`,
    orderItems: (t: string): string[] => [
      `Define the goals and scope of the ${t} initiative`,
      `Gather information and assess the current state related to ${t}`,
      `Design the approach and create a detailed ${t} plan`,
      `Implement the ${t} plan with appropriate monitoring`,
      `Evaluate outcomes and identify improvements to the ${t} process`,
    ],
  },
  {
    stem: (t: string) => `Arrange these steps for troubleshooting a ${t} problem in the correct order.`,
    orderItems: (t: string): string[] => [
      `Identify the symptoms and gather initial information about the ${t} issue`,
      `Formulate hypotheses about the root cause of the ${t} problem`,
      `Test each hypothesis systematically using appropriate methods`,
      `Implement the solution that addresses the confirmed root cause`,
      `Verify that the ${t} problem is resolved and document the resolution`,
    ],
  },
];

// ── Generation config ──

interface GenerationConfig {
  topic: string;
  selectedTypes: AssessmentQuestionType[];
  selectedBlooms: BloomLevel[];
  difficulty: QuestionDifficulty;
  count: number;
  objectiveRef?: string;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function bloomLevelForType(type: AssessmentQuestionType, selectedBlooms: BloomLevel[]): BloomLevel {
  const typeInfo = ASSESSMENT_QUESTION_TYPES.find(t => t.key === type);
  if (!typeInfo) return selectedBlooms[0] || 'understand';
  const compatible = selectedBlooms.filter(b => typeInfo.bloomLevels.includes(b));
  if (compatible.length > 0) return pickRandom(compatible);
  return typeInfo.bloomLevels[0] as BloomLevel;
}

function generateSingleQuestion(
  type: AssessmentQuestionType,
  topic: string,
  bloomLevel: BloomLevel,
  difficulty: QuestionDifficulty,
  objectiveRef?: string
): AssessmentQuestion {
  const id = generateId();
  const tags = [topic.toLowerCase().replace(/\s+/g, '-'), type, bloomLevel, difficulty];

  switch (type) {
    case 'multiple-choice': {
      const tpl = pickRandom(MC_TEMPLATES);
      return {
        id, type, topic, bloomLevel, difficulty,
        stem: tpl.stem(topic),
        choices: tpl.choices(topic),
        explanation: `This question assesses ${bloomLevel}-level thinking about ${topic}. The correct answer reflects the core principle, while distractors represent common misconceptions.`,
        estimatedTime: estimatedTimeForType(type),
        tags,
        objectiveRef,
      };
    }
    case 'true-false': {
      const tpl = pickRandom(TF_TEMPLATES);
      return {
        id, type, topic, bloomLevel, difficulty,
        stem: tpl.stem(topic),
        correctAnswer: tpl.correctAnswer,
        explanation: tpl.explanation(topic),
        estimatedTime: estimatedTimeForType(type),
        tags,
        objectiveRef,
      };
    }
    case 'matching': {
      const tpl = pickRandom(MATCHING_TEMPLATES);
      return {
        id, type, topic, bloomLevel, difficulty,
        stem: tpl.stem(topic),
        matchingPairs: tpl.pairs(topic),
        explanation: `This matching activity reinforces key ${topic} concepts and their associated definitions or examples. Each pair tests a distinct aspect of ${topic} knowledge.`,
        estimatedTime: estimatedTimeForType(type),
        tags,
        objectiveRef,
      };
    }
    case 'short-answer': {
      const tpl = pickRandom(SA_TEMPLATES);
      return {
        id, type, topic, bloomLevel, difficulty,
        stem: tpl.stem(topic),
        correctAnswer: tpl.correctAnswer(topic),
        explanation: `Short answer questions for ${topic} assess the learner's ability to articulate understanding in their own words, revealing depth of comprehension.`,
        estimatedTime: estimatedTimeForType(type),
        tags,
        objectiveRef,
      };
    }
    case 'essay': {
      const tpl = pickRandom(ESSAY_TEMPLATES);
      return {
        id, type, topic, bloomLevel, difficulty,
        stem: tpl.stem(topic),
        rubricPoints: tpl.rubricPoints(topic),
        explanation: `This essay prompt targets higher-order thinking (${bloomLevel}) and assesses the learner's ability to synthesize and evaluate ${topic} in depth.`,
        estimatedTime: estimatedTimeForType(type),
        tags,
        objectiveRef,
      };
    }
    case 'scenario-based': {
      const tpl = pickRandom(SCENARIO_TEMPLATES);
      return {
        id, type, topic, bloomLevel, difficulty,
        scenario: tpl.scenario(topic),
        stem: tpl.stem(topic),
        choices: tpl.choices(topic),
        explanation: `Scenario-based questions for ${topic} mirror real-world decision-making, requiring learners to apply and analyze rather than simply recall information.`,
        estimatedTime: estimatedTimeForType(type),
        tags,
        objectiveRef,
      };
    }
    case 'ordering': {
      const tpl = pickRandom(ORDERING_TEMPLATES);
      return {
        id, type, topic, bloomLevel, difficulty,
        stem: tpl.stem(topic),
        orderItems: tpl.orderItems(topic),
        explanation: `Sequencing questions test procedural knowledge of ${topic}, ensuring learners understand not just individual steps but how they connect in order.`,
        estimatedTime: estimatedTimeForType(type),
        tags,
        objectiveRef,
      };
    }
  }
}

function generateQuestions(config: GenerationConfig): AssessmentQuestion[] {
  const { topic, selectedTypes, selectedBlooms, difficulty, count, objectiveRef } = config;
  if (!selectedTypes.length || !selectedBlooms.length) return [];

  const questions: AssessmentQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const type = pickRandom(selectedTypes);
    const bloom = bloomLevelForType(type, selectedBlooms);
    questions.push(generateSingleQuestion(type, topic, bloom, difficulty, objectiveRef));
  }
  return questions;
}

// ── Question to Markdown ──

function questionToMarkdown(q: AssessmentQuestion, idx: number): string {
  const lines: string[] = [];
  const label = ASSESSMENT_QUESTION_TYPES.find(t => t.key === q.type)?.label ?? q.type;
  lines.push(`### Question ${idx + 1} [${label} | ${q.bloomLevel} | ${q.difficulty}]`);
  lines.push('');
  if (q.scenario) {
    lines.push(`**Scenario:**`);
    lines.push(q.scenario);
    lines.push('');
  }
  lines.push(`**${q.stem}**`);
  lines.push('');
  if (q.choices) {
    q.choices.forEach((c, ci) => {
      const letter = String.fromCharCode(65 + ci);
      lines.push(`${letter}. ${c.text}${c.isCorrect ? ' ✓' : ''}`);
    });
    lines.push('');
    lines.push('**Answer Explanations:**');
    q.choices.forEach((c, ci) => {
      const letter = String.fromCharCode(65 + ci);
      lines.push(`- ${letter}: ${c.explanation}`);
    });
  }
  if (q.correctAnswer && q.type === 'true-false') {
    lines.push(`**Correct Answer:** ${q.correctAnswer}`);
  }
  if (q.matchingPairs) {
    lines.push('**Matching Pairs:**');
    q.matchingPairs.forEach(p => lines.push(`- ${p.prompt} → ${p.match}`));
  }
  if (q.correctAnswer && q.type === 'short-answer') {
    lines.push(`**Sample Answer:** ${q.correctAnswer}`);
  }
  if (q.rubricPoints) {
    lines.push('**Rubric:**');
    q.rubricPoints.forEach(r => lines.push(`- ${r}`));
  }
  if (q.orderItems) {
    lines.push('**Correct Sequence:**');
    q.orderItems.forEach((item, oi) => lines.push(`${oi + 1}. ${item}`));
  }
  lines.push('');
  lines.push(`**Explanation:** ${q.explanation}`);
  if (q.objectiveRef) lines.push(`**Objective:** ${q.objectiveRef}`);
  lines.push(`**Estimated Time:** ${q.estimatedTime} min`);
  lines.push('');
  lines.push('---');
  lines.push('');
  return lines.join('\n');
}

// ── UI Sub-components ──

function TypeBadge({ type }: { type: AssessmentQuestionType }) {
  const label = ASSESSMENT_QUESTION_TYPES.find(t => t.key === type)?.label ?? type;
  return <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full', typeColor(type))}>{label}</span>;
}

function BloomBadge({ level }: { level: BloomLevel }) {
  const label = BLOOM_LEVELS.find(b => b.key === level)?.label ?? level;
  return <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full border', bloomColor(level))}>{label}</span>;
}

function DifficultyBadge({ difficulty }: { difficulty: QuestionDifficulty }) {
  const labels: Record<QuestionDifficulty, string> = {
    foundational: 'Foundational',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  };
  return <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full', difficultyColor(difficulty))}>{labels[difficulty]}</span>;
}

// ── Question Card ──

function QuestionCard({
  question,
  index,
  onDelete,
}: {
  question: AssessmentQuestion;
  index: number;
  onDelete: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const md = questionToMarkdown(question, index);
    navigator.clipboard.writeText(md).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [question, index]);

  return (
    <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-surface-50 border-b border-surface-200">
        <span className="text-xs font-bold text-surface-500 shrink-0">Q{index + 1}</span>
        <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
          <TypeBadge type={question.type} />
          <DifficultyBadge difficulty={question.difficulty} />
          <BloomBadge level={question.bloomLevel} />
          <span className="text-[11px] text-surface-500 flex items-center gap-0.5">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {question.estimatedTime} min
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {/* Copy button */}
          <button
            onClick={handleCopy}
            title="Copy as Markdown"
            className="p-1.5 text-surface-400 hover:text-surface-700 hover:bg-surface-200 rounded transition-colors"
          >
            {copied ? (
              <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.696a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
              </svg>
            )}
          </button>
          {/* Delete button */}
          <button
            onClick={onDelete}
            title="Delete question"
            className="p-1.5 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand' : 'Collapse'}
            className="p-1.5 text-surface-400 hover:text-surface-700 hover:bg-surface-200 rounded transition-colors"
          >
            <svg className={cn('w-3.5 h-3.5 transition-transform', collapsed && '-rotate-90')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Card body */}
      {!collapsed && (
        <div className="p-4 space-y-3">
          {/* Scenario */}
          {question.scenario && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Scenario</p>
              <p className="text-sm text-amber-900 leading-relaxed">{question.scenario}</p>
            </div>
          )}

          {/* Stem */}
          <p className="text-sm font-semibold text-surface-900 leading-relaxed">{question.stem}</p>

          {/* Multiple Choice / Scenario choices */}
          {question.choices && (
            <div className="space-y-2">
              {question.choices.map((choice, ci) => (
                <div key={choice.id} className={cn('flex items-start gap-2.5 p-2.5 rounded-lg border text-sm', choice.isCorrect ? 'bg-green-50 border-green-300' : 'bg-surface-50 border-surface-200')}>
                  <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold', choice.isCorrect ? 'border-green-500 bg-green-500 text-white' : 'border-surface-300 text-surface-500')}>
                    {choice.isCorrect ? (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : String.fromCharCode(65 + ci)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm', choice.isCorrect ? 'text-green-800 font-medium' : 'text-surface-700')}>{choice.text}</p>
                    <p className="text-xs text-surface-500 mt-0.5 italic">{choice.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* True/False */}
          {question.type === 'true-false' && question.correctAnswer && (
            <div className="flex gap-3">
              {['True', 'False'].map(opt => (
                <div key={opt} className={cn('flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium', question.correctAnswer === opt ? 'bg-green-50 border-green-400 text-green-800' : 'bg-surface-50 border-surface-200 text-surface-500')}>
                  {question.correctAnswer === opt && (
                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                  {opt}
                </div>
              ))}
            </div>
          )}

          {/* Matching */}
          {question.matchingPairs && (
            <div className="space-y-1.5">
              {question.matchingPairs.map(pair => (
                <div key={pair.id} className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2 text-indigo-800 font-medium">{pair.prompt}</div>
                  <div className="bg-surface-50 border border-surface-200 rounded-lg px-3 py-2 text-surface-700">{pair.match}</div>
                </div>
              ))}
            </div>
          )}

          {/* Short Answer */}
          {question.type === 'short-answer' && question.correctAnswer && (
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-cyan-700 uppercase tracking-wide mb-1">Sample Answer Criteria</p>
              <p className="text-sm text-cyan-900">{question.correctAnswer}</p>
            </div>
          )}

          {/* Essay rubric */}
          {question.rubricPoints && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-rose-700 uppercase tracking-wide mb-2">Scoring Rubric</p>
              <ul className="space-y-1">
                {question.rubricPoints.map((point, pi) => (
                  <li key={pi} className="flex items-start gap-2 text-sm text-rose-800">
                    <svg className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Ordering */}
          {question.orderItems && (
            <div className="space-y-1.5">
              {question.orderItems.map((item, oi) => (
                <div key={oi} className="flex items-start gap-2.5 text-sm">
                  <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">{oi + 1}</span>
                  <span className="text-surface-700">{item}</span>
                </div>
              ))}
            </div>
          )}

          {/* Objective ref */}
          {question.objectiveRef && (
            <p className="text-xs text-surface-500">
              <span className="font-semibold">Objective:</span> {question.objectiveRef}
            </p>
          )}

          {/* Expandable explanation */}
          <div>
            <button
              onClick={() => setShowExplanation(s => !s)}
              className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              <svg className={cn('w-3.5 h-3.5 transition-transform', showExplanation && 'rotate-90')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
              {showExplanation ? 'Hide' : 'Show'} Explanation
            </button>
            {showExplanation && (
              <div className="mt-2 bg-brand-50 border border-brand-100 rounded-lg p-3">
                <p className="text-xs text-brand-800 leading-relaxed">{question.explanation}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Empty State ──

function EmptyState({ onQuickStart }: { onQuickStart: (preset: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8 py-16">
      {/* SVG illustration */}
      <svg className="w-32 h-32 text-surface-300 mb-6" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="30" y="20" width="140" height="160" rx="12" fill="currentColor" opacity="0.08" />
        <rect x="30" y="20" width="140" height="160" rx="12" stroke="currentColor" strokeWidth="3" opacity="0.2" />
        <rect x="50" y="50" width="100" height="8" rx="4" fill="currentColor" opacity="0.25" />
        <rect x="50" y="68" width="80" height="8" rx="4" fill="currentColor" opacity="0.18" />
        <rect x="50" y="95" width="100" height="8" rx="4" fill="currentColor" opacity="0.25" />
        <rect x="50" y="113" width="60" height="8" rx="4" fill="currentColor" opacity="0.18" />
        <rect x="50" y="140" width="100" height="8" rx="4" fill="currentColor" opacity="0.25" />
        <rect x="50" y="158" width="70" height="8" rx="4" fill="currentColor" opacity="0.18" />
        <circle cx="155" cy="155" r="30" fill="#4c6ef5" opacity="0.15" />
        <path d="M147 155l6 6 12-14" stroke="#4c6ef5" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      </svg>
      <h3 className="text-base font-semibold text-surface-700 mb-2">No questions generated yet</h3>
      <p className="text-sm text-surface-500 max-w-xs mb-8">
        Configure your question settings on the left and click Generate Questions to build your assessment.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => onQuickStart('5mc')}
          className="px-4 py-2 rounded-lg border border-brand-200 bg-brand-50 text-brand-700 text-sm font-medium hover:bg-brand-100 transition-colors"
        >
          5 MC Questions
        </button>
        <button
          onClick={() => onQuickStart('3scenario')}
          className="px-4 py-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-sm font-medium hover:bg-amber-100 transition-colors"
        >
          3 Scenario Questions
        </button>
        <button
          onClick={() => onQuickStart('mix8')}
          className="px-4 py-2 rounded-lg border border-surface-300 bg-surface-50 text-surface-700 text-sm font-medium hover:bg-surface-100 transition-colors"
        >
          Mix of 8
        </button>
      </div>
    </div>
  );
}

// ── Main Component ──

interface Props {
  projectId: string;
}

export default function AssessmentGenerator({ projectId }: Props) {
  const { addGeneratedQuestions, clearGeneratedQuestions, generatedQuestions, courseOutlines } = useAppStore();

  const questions = generatedQuestions[projectId] ?? [];
  const outline = courseOutlines[projectId];
  const allObjectives = outline?.modules.flatMap(m => m.objectives) ?? [];

  // Config state
  const [topic, setTopic] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<AssessmentQuestionType[]>(['multiple-choice']);
  const [selectedBlooms, setSelectedBlooms] = useState<BloomLevel[]>(['remember', 'understand']);
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('foundational');
  const [count, setCount] = useState(5);
  const [objectiveRef, setObjectiveRef] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const toggleType = useCallback((t: AssessmentQuestionType) => {
    setSelectedTypes(prev => prev.includes(t) ? (prev.length > 1 ? prev.filter(x => x !== t) : prev) : [...prev, t]);
  }, []);

  const toggleBloom = useCallback((b: BloomLevel) => {
    setSelectedBlooms(prev => prev.includes(b) ? (prev.length > 1 ? prev.filter(x => x !== b) : prev) : [...prev, b]);
  }, []);

  const handleGenerate = useCallback((overrides?: Partial<GenerationConfig>) => {
    const cfg: GenerationConfig = {
      topic: overrides?.topic ?? topic,
      selectedTypes: overrides?.selectedTypes ?? selectedTypes,
      selectedBlooms: overrides?.selectedBlooms ?? selectedBlooms,
      difficulty: overrides?.difficulty ?? difficulty,
      count: overrides?.count ?? count,
      objectiveRef: overrides?.objectiveRef ?? (objectiveRef || undefined),
    };

    if (!cfg.topic.trim()) {
      // Use a default topic if empty
      cfg.topic = 'the course topic';
    }

    setIsGenerating(true);
    setTimeout(() => {
      const generated = generateQuestions(cfg);
      addGeneratedQuestions(projectId, generated);
      setIsGenerating(false);
    }, 800);
  }, [topic, selectedTypes, selectedBlooms, difficulty, count, objectiveRef, addGeneratedQuestions, projectId]);

  const handleQuickStart = useCallback((preset: string) => {
    const effectiveTopic = topic.trim() || 'the course topic';
    if (preset === '5mc') {
      setTopic(effectiveTopic);
      setSelectedTypes(['multiple-choice']);
      setSelectedBlooms(['remember', 'understand']);
      setDifficulty('foundational');
      setCount(5);
      handleGenerate({ topic: effectiveTopic, selectedTypes: ['multiple-choice'], selectedBlooms: ['remember', 'understand'], difficulty: 'foundational', count: 5 });
    } else if (preset === '3scenario') {
      setTopic(effectiveTopic);
      setSelectedTypes(['scenario-based']);
      setSelectedBlooms(['apply', 'analyze']);
      setDifficulty('intermediate');
      setCount(3);
      handleGenerate({ topic: effectiveTopic, selectedTypes: ['scenario-based'], selectedBlooms: ['apply', 'analyze'], difficulty: 'intermediate', count: 3 });
    } else if (preset === 'mix8') {
      setTopic(effectiveTopic);
      setSelectedTypes(['multiple-choice', 'true-false', 'short-answer', 'scenario-based']);
      setSelectedBlooms(['remember', 'understand', 'apply', 'analyze']);
      setDifficulty('intermediate');
      setCount(8);
      handleGenerate({ topic: effectiveTopic, selectedTypes: ['multiple-choice', 'true-false', 'short-answer', 'scenario-based'], selectedBlooms: ['remember', 'understand', 'apply', 'analyze'], difficulty: 'intermediate', count: 8 });
    }
  }, [topic, handleGenerate]);

  const handleDeleteQuestion = useCallback((qId: string) => {
    const updated = questions.filter(q => q.id !== qId);
    clearGeneratedQuestions(projectId);
    if (updated.length > 0) addGeneratedQuestions(projectId, updated);
  }, [questions, clearGeneratedQuestions, addGeneratedQuestions, projectId]);

  const handleCopyAll = useCallback(() => {
    const md = questions.map((q, i) => questionToMarkdown(q, i)).join('');
    navigator.clipboard.writeText(md).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1800);
    });
  }, [questions]);

  const totalTime = questions.reduce((sum, q) => sum + q.estimatedTime, 0);

  const DIFFICULTY_OPTIONS: { key: QuestionDifficulty; label: string }[] = [
    { key: 'foundational', label: 'Foundational' },
    { key: 'intermediate', label: 'Intermediate' },
    { key: 'advanced', label: 'Advanced' },
  ];

  return (
    <div className="flex flex-col h-full bg-surface-50">
      {/* Top header bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-surface-200 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-surface-900">Assessment Generator</h2>
          <p className="text-xs text-surface-500 mt-0.5">Generate questions across all Bloom&apos;s levels and question types</p>
        </div>
        <div className="flex items-center gap-3">
          {questions.length > 0 && (
            <span className="text-xs text-surface-600 font-medium bg-surface-100 border border-surface-200 px-3 py-1.5 rounded-lg">
              {questions.length} question{questions.length !== 1 ? 's' : ''} &nbsp;·&nbsp; Est. {totalTime % 1 === 0 ? totalTime : totalTime.toFixed(1)} min
            </span>
          )}
          {questions.length > 0 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearGeneratedQuestions(projectId)}
                icon={
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                }
              >
                Clear All
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyAll}
                icon={
                  copiedAll ? (
                    <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.696a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                    </svg>
                  )
                }
              >
                {copiedAll ? 'Copied!' : 'Copy All as Markdown'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                }
              >
                Save to Project
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left panel — configuration */}
        <div className="w-80 shrink-0 bg-white border-r border-surface-200 overflow-y-auto flex flex-col">
          <div className="p-5 space-y-5 flex-1">
            {/* Topic */}
            <div>
              <label className="block text-xs font-semibold text-surface-700 uppercase tracking-wide mb-1.5">
                Topic
              </label>
              <p className="text-xs text-surface-500 mb-2">What concept or skill are these questions about?</p>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Project risk management"
                className="w-full px-3 py-2 rounded-lg border border-surface-300 text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              />
            </div>

            {/* Question Types */}
            <div>
              <label className="block text-xs font-semibold text-surface-700 uppercase tracking-wide mb-1.5">
                Question Types
              </label>
              <p className="text-xs text-surface-500 mb-2">Select one or more (multi-select allowed)</p>
              <div className="flex flex-wrap gap-1.5">
                {ASSESSMENT_QUESTION_TYPES.map(qt => {
                  const active = selectedTypes.includes(qt.key);
                  return (
                    <button
                      key={qt.key}
                      onClick={() => toggleType(qt.key)}
                      title={`Bloom's levels: ${qt.bloomLevels.join(', ')}`}
                      className={cn(
                        'px-2.5 py-1 rounded-full border text-xs font-medium transition-colors',
                        active
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-white text-surface-600 border-surface-300 hover:border-brand-400 hover:text-brand-600'
                      )}
                    >
                      {qt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bloom's Levels */}
            <div>
              <label className="block text-xs font-semibold text-surface-700 uppercase tracking-wide mb-1.5">
                Bloom&apos;s Level
              </label>
              <p className="text-xs text-surface-500 mb-2">Target cognitive levels (multi-select)</p>
              <div className="flex flex-wrap gap-1.5">
                {BLOOM_LEVELS.map(bl => {
                  const active = selectedBlooms.includes(bl.key);
                  return (
                    <button
                      key={bl.key}
                      onClick={() => toggleBloom(bl.key)}
                      title={bl.verbs.join(', ')}
                      className={cn(
                        'px-2.5 py-1 rounded-full border text-xs font-medium transition-colors',
                        active ? bloomPillActive(bl.key) : 'bg-white text-surface-600 border-surface-300 hover:border-surface-400'
                      )}
                    >
                      {bl.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-semibold text-surface-700 uppercase tracking-wide mb-1.5">
                Difficulty
              </label>
              <div className="flex gap-1.5">
                {DIFFICULTY_OPTIONS.map(d => (
                  <button
                    key={d.key}
                    onClick={() => setDifficulty(d.key)}
                    className={cn(
                      'flex-1 py-1.5 rounded-lg border text-xs font-medium transition-colors',
                      difficulty === d.key
                        ? d.key === 'foundational' ? 'bg-green-600 text-white border-green-600'
                          : d.key === 'intermediate' ? 'bg-yellow-500 text-white border-yellow-500'
                          : 'bg-red-600 text-white border-red-600'
                        : 'bg-white text-surface-600 border-surface-300 hover:border-surface-400'
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Count */}
            <div>
              <label className="block text-xs font-semibold text-surface-700 uppercase tracking-wide mb-1.5">
                Number of Questions
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCount(c => Math.max(1, c - 1))}
                  className="w-8 h-8 rounded-lg border border-surface-300 bg-white text-surface-700 font-bold hover:bg-surface-100 flex items-center justify-center transition-colors text-lg leading-none"
                >
                  −
                </button>
                <span className="w-12 text-center text-lg font-bold text-surface-900">{count}</span>
                <button
                  onClick={() => setCount(c => Math.min(20, c + 1))}
                  className="w-8 h-8 rounded-lg border border-surface-300 bg-white text-surface-700 font-bold hover:bg-surface-100 flex items-center justify-center transition-colors text-lg leading-none"
                >
                  +
                </button>
                <span className="text-xs text-surface-500">Max 20</span>
              </div>
            </div>

            {/* Objective alignment */}
            <div>
              <label className="block text-xs font-semibold text-surface-700 uppercase tracking-wide mb-1.5">
                Align to Objective
                <span className="ml-1 font-normal text-surface-400 normal-case">(optional)</span>
              </label>
              {allObjectives.length > 0 ? (
                <select
                  value={objectiveRef}
                  onChange={e => setObjectiveRef(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-surface-300 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                >
                  <option value="">— No alignment —</option>
                  {allObjectives.map(obj => (
                    <option key={obj.id} value={obj.text}>{obj.text.length > 60 ? obj.text.slice(0, 60) + '…' : obj.text}</option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-surface-400 italic py-1.5">No course outline found. Build a course outline in the Design phase to enable objective alignment.</p>
              )}
            </div>
          </div>

          {/* Generate button */}
          <div className="p-4 border-t border-surface-200 bg-surface-50 shrink-0">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={isGenerating}
              onClick={() => handleGenerate()}
              icon={
                !isGenerating ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                ) : undefined
              }
            >
              {isGenerating ? 'Generating…' : 'Generate Questions'}
            </Button>
            {questions.length > 0 && (
              <p className="text-[11px] text-surface-400 text-center mt-2">
                New questions will be added to existing {questions.length}
              </p>
            )}
          </div>
        </div>

        {/* Right panel — results */}
        <div className="flex-1 overflow-y-auto">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-10 h-10 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
              <p className="text-sm text-surface-500 font-medium">Generating questions…</p>
            </div>
          ) : questions.length === 0 ? (
            <EmptyState onQuickStart={handleQuickStart} />
          ) : (
            <div className="p-6 space-y-4 max-w-3xl">
              {questions.map((q, i) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  index={i}
                  onDelete={() => handleDeleteQuestion(q.id)}
                />
              ))}
              {/* Add more button at bottom */}
              <div className="pt-2">
                <Button
                  variant="secondary"
                  size="md"
                  fullWidth
                  loading={isGenerating}
                  onClick={() => handleGenerate()}
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  }
                >
                  Generate {count} More
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
