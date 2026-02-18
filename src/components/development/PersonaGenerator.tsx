'use client';

import React, { useState, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import {
  LearnerPersona,
  ExperienceLevel,
  VARKModality,
  VARK_MODALITIES,
} from '@/lib/types';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

// ──────────────────────────────────────────
// PERSONA GENERATION DATA
// ──────────────────────────────────────────

const NAME_BANK = [
  'Alex Rivera', 'Jordan Chen', 'Morgan Patel', 'Taylor Washington',
  'Casey Nguyen', 'Avery Johnson', 'Quinn Martinez', 'Riley Thompson',
  'Dakota Lee', 'Reese Okonkwo', 'Skyler Ramirez', 'Finley Kowalski',
  'Blair Andersen', 'Harley Yamamoto', 'Devon Mbeki', 'Rowan Petrov',
  'Sage Delacroix', 'Emery Hassan', 'Lennon Obasi', 'Marlowe Singh',
  'Indira Castillo', 'Marcus Bell', 'Priya Kowalski', 'James Afolabi',
];

const AGE_RANGES = ['22–28', '28–34', '34–42', '42–50', '50–58'];

const GENERIC_ROLES = [
  'Operations Specialist', 'Team Lead', 'Project Coordinator',
  'Administrative Analyst', 'Training Coordinator', 'Process Specialist',
  'Department Manager', 'Quality Assurance Specialist',
];

const GOALS_BANK: Record<ExperienceLevel, string[][]> = {
  novice: [
    ['Build foundational knowledge and confidence in this area', 'Complete onboarding requirements successfully', 'Avoid making mistakes that could impact my team'],
    ['Understand the basics before jumping into complex tasks', 'Learn from experienced colleagues', 'Find reliable resources I can reference on the job'],
    ['Meet the minimum competency threshold for my role', 'Reduce reliance on my supervisor for routine questions', 'Build a network of peers I can ask for help'],
  ],
  intermediate: [
    ['Deepen my understanding of the concepts I use daily', 'Expand my skills to take on more complex tasks', 'Position myself for a promotion or increased responsibilities'],
    ['Fill in the gaps in my knowledge that have been causing issues', 'Learn best practices I may have been doing wrong', 'Contribute more effectively to team projects'],
    ['Validate that my current approach is correct', 'Learn time-saving techniques and shortcuts', 'Become a resource for newer team members'],
  ],
  expert: [
    ['Stay current with the latest developments in this area', 'Refine my leadership approach for mentoring others', 'Explore advanced techniques that push boundaries'],
    ['Earn a formal certification to validate my expertise', 'Contribute to improving our team\'s standard practices', 'Find innovative solutions to long-standing problems'],
    ['Keep my knowledge sharp even in areas I use less often', 'Build cross-functional skills to complement my expertise', 'Develop a training program for my team'],
  ],
};

const CHALLENGES_BANK: Record<ExperienceLevel, string[][]> = {
  novice: [
    ['Feeling overwhelmed by the volume of new information', 'Afraid to ask questions in case I appear incompetent', 'Struggling to apply concepts I understand in theory to real situations'],
    ['Information comes too fast to absorb properly', 'Hard to know which resources are trustworthy', 'Lack of time to practice between learning sessions'],
    ['Imposter syndrome — feeling like everyone else knows more', 'Difficulty distinguishing between important and non-essential content', 'No clear way to know if I\'m making progress'],
  ],
  intermediate: [
    ['Bad habits from previous training that are hard to unlearn', 'Difficulty finding advanced resources beyond introductory material', 'Too many competing priorities to dedicate focus to learning'],
    ['My knowledge has gaps I\'m not always aware of', 'Applying new techniques in my specific context feels different than the examples', 'Hard to get feedback on whether I\'m doing it right'],
    ['I feel like I\'m hitting a ceiling in my current skill level', 'Some topics feel irrelevant to my specific role', 'Balancing new learning with ongoing job responsibilities'],
  ],
  expert: [
    ['Finding learning experiences that match my level — most are too basic', 'Keeping up with the pace of change in this field', 'Being pulled into helping others, which limits my own development time'],
    ['Staying motivated when the learning curve has flattened', 'Difficulty translating advanced knowledge to practical application', 'Finding peers at the same level to learn with and from'],
    ['Overconfidence — assuming I know something fully when I don\'t', 'Resistance to changing established workflows that work well enough', 'Navigating organizational change that conflicts with best practices'],
  ],
};

const QUOTES_BANK: Record<ExperienceLevel, string[]> = {
  novice: [
    "I just want to feel confident enough to do my job without second-guessing every decision.",
    "There's so much to learn — I need someone to show me what actually matters.",
    "I learn best when I can see a real example first, then try it myself.",
    "I'm not afraid to work hard. I just need clear guidance on where to start.",
    "I wish the training felt more relevant to what I'll actually be doing.",
  ],
  intermediate: [
    "I know the basics, but I feel like there's a gap between what I know and what the experts do.",
    "I want practical techniques I can use tomorrow, not theory I'll forget next week.",
    "I've picked up some bad habits along the way — I need to unlearn as much as I learn.",
    "Give me the real-world edge cases, not just the textbook examples.",
    "I'm ready to level up, but I need the right challenge to get there.",
  ],
  expert: [
    "I've been doing this for years — show me something I haven't seen before.",
    "The value for me is validating my instincts and filling the blind spots I didn't know I had.",
    "I want to learn from peers, not instructors. Let me discuss and debate.",
    "I learn by teaching others — I'm hoping to come away with material I can use with my team.",
    "Challenge my assumptions. Don't just confirm what I already know.",
  ],
};

const MOTIVATION_BANK: Record<ExperienceLevel, string[]> = {
  novice: [
    'Intrinsic — wants to feel competent and capable in the role',
    'Extrinsic — completing onboarding requirements for employment',
    'Intrinsic — personal growth and career advancement',
    'Extrinsic — avoiding errors that could affect the team',
  ],
  intermediate: [
    'Intrinsic — mastery and deeper understanding of the craft',
    'Mixed — personal growth combined with career advancement opportunities',
    'Intrinsic — becoming a resource and mentor for others',
    'Extrinsic — performance review and promotion eligibility',
  ],
  expert: [
    'Intrinsic — intellectual curiosity and staying at the frontier of the field',
    'Intrinsic — contributing to the field and mentoring others',
    'Mixed — peer recognition and personal commitment to excellence',
    'Extrinsic — maintaining certification or professional standing',
  ],
};

const ZPD_BANK: Record<ExperienceLevel, string[]> = {
  novice: [
    'Currently in the Comfort Zone for foundational concepts. Training should scaffold toward the Learning Zone using worked examples, checklists, and guided practice before releasing to independent tasks.',
    'Sits at the lower edge of the Learning Zone. Structured support and clear modeling are essential. Avoid complex multi-step tasks without progressive scaffolding.',
    'Minimal prior schema to build on. Begin at concrete, familiar contexts and gradually increase abstraction. Peer pairing with more experienced learners will accelerate growth.',
  ],
  intermediate: [
    'Solidly in the Learning Zone for core concepts, with pockets of Comfort Zone mastery. Needs challenge at the Apply and Analyze Bloom\'s levels to continue growing.',
    'Has foundational knowledge but incomplete mental models. Training should surface misconceptions and provide deliberate practice in transfer scenarios.',
    'Ready for moderate cognitive challenge. Scenario-based learning and case studies will help bridge the gap between procedural knowledge and adaptive expertise.',
  ],
  expert: [
    'Operates primarily in the Comfort Zone for standard tasks. Training must target the outer Learning Zone — edge cases, novel situations, and cross-domain connections.',
    'Requires Stretch Zone challenges to remain engaged. Peer discussion, open-ended problems, and application to novel contexts are essential to drive growth.',
    'Near-expert level. Training should focus on Evaluate and Create levels of Bloom\'s Taxonomy. Encourage self-directed learning and contribution to community of practice.',
  ],
};

const PRIOR_KNOWLEDGE_BANK: Record<ExperienceLevel, string[]> = {
  novice: [
    'Little to no prior exposure to this subject. Begins with basic terminology and foundational concepts.',
    'Has general awareness from adjacent roles but lacks structured knowledge. Some vocabulary is familiar, mechanics are not.',
    'Theoretical exposure only — has read about it but has not applied concepts in a real work setting.',
  ],
  intermediate: [
    'Two to four years of applied experience. Comfortable with routine tasks; less confident with exceptions and edge cases.',
    'Has completed introductory training and on-the-job practice. Some knowledge gaps remain from self-taught habits.',
    'Strong procedural knowledge from daily work. Conceptual understanding of underlying principles is less developed.',
  ],
  expert: [
    'Five or more years of hands-on experience including complex and high-stakes situations. Extensive practical schema.',
    'Has trained others in this area. Deep domain expertise with well-established mental models and heuristics.',
    'Has contributed to policy, process design, or formal documentation in this area. Recognized as a subject matter expert by peers.',
  ],
};

const WORK_CONTEXT_BANK = [
  'Office-based, desk work with regular computer access during standard business hours.',
  'Hybrid work arrangement — two to three days in office, remainder remote. Good technology access both settings.',
  'Primarily field-based with intermittent access to technology. Mobile device is the primary learning tool.',
  'Fast-paced environment with frequent interruptions; learning must be accessible in short bursts.',
  'Remote-first team distributed across multiple time zones. Asynchronous communication is the norm.',
  'Clinical or operational floor setting with limited screen time during shifts. Learning happens before or after core hours.',
  'Retail or service environment; learning must fit in brief windows during downtime or before shifts.',
  'Manufacturing or physical workspace; desktop access is limited, mobile or kiosk delivery preferred.',
];

const ACCESSIBILITY_BANK = [
  'None reported.',
  'None reported.',
  'None reported.',
  'None reported.',
  'Prefers closed captions on all video content.',
  'Benefits from extended time on assessments.',
  'Uses screen magnification for reading dense text.',
  'Prefers high-contrast display modes.',
  'Benefits from audio narration alongside written content.',
  'Has ADHD; benefits from chunked content with frequent check-ins and clear progress indicators.',
];

const BACKGROUND_BANK: Record<ExperienceLevel, string[]> = {
  novice: [
    'Recently joined the organization or transitioned into this role from a different department. Eager to contribute but still building confidence.',
    'Recent graduate or early-career professional with academic preparation but limited applied experience in the field.',
    'Career changer bringing transferable skills from a different industry but starting fresh in this specific domain.',
  ],
  intermediate: [
    'A solid mid-career professional with a track record of reliability. Has outgrown the basics but not yet reached expert status.',
    'Promoted from an individual contributor role and now navigating the expectations of a higher level of responsibility.',
    'Self-taught practitioner who has filled most knowledge gaps through experience but has uneven depth across topics.',
  ],
  expert: [
    'Seasoned professional recognized internally as a go-to resource. Often brought into high-stakes projects and decisions.',
    'Subject matter expert who has evolved from practitioner to advisor. Frequently asked to mentor junior colleagues.',
    'Long-tenured specialist with deep institutional knowledge. Navigates complex situations with earned confidence and nuance.',
  ],
};

// ──────────────────────────────────────────
// UTILITY FUNCTIONS
// ──────────────────────────────────────────

function seededRandom(seed: number): () => number {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function pickRandom<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function getAvatarColor(name: string): string {
  const colors = [
    'bg-brand-600',
    'bg-blue-600',
    'bg-purple-600',
    'bg-green-600',
    'bg-orange-500',
    'bg-pink-600',
    'bg-teal-600',
    'bg-indigo-600',
  ];
  const charCode = name.charCodeAt(0) + name.charCodeAt(name.length - 1);
  return colors[charCode % colors.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function generatePersona(
  seed: number,
  experienceLevels: ExperienceLevel[],
  role: string,
  industry: string,
  targetAudience: string,
  projectId: string
): Omit<LearnerPersona, 'id' | 'createdAt'> {
  const rng = seededRandom(seed);
  const name = NAME_BANK[Math.floor(rng() * NAME_BANK.length)];
  const experienceLevel = pickRandom(experienceLevels, rng) as ExperienceLevel;

  const personaRole = role.trim()
    ? role.trim()
    : targetAudience
      ? pickRandom(GENERIC_ROLES, rng)
      : pickRandom(GENERIC_ROLES, rng);

  // VARK modalities — weighted
  const allModalities: VARKModality[] = ['visual', 'auditory', 'readWrite', 'kinesthetic'];
  const weights = [0.35, 0.20, 0.25, 0.20];
  const numModalities = Math.random() > 0.4 ? 3 : 2;
  const shuffled = [...allModalities].sort((a, b) => {
    const ai = allModalities.indexOf(a);
    const bi = allModalities.indexOf(b);
    return (weights[bi] + rng() * 0.3) - (weights[ai] + rng() * 0.3);
  });
  const learningPreferences = shuffled.slice(0, numModalities) as VARKModality[];

  // Tech comfort
  let techComfort: 'low' | 'medium' | 'high';
  if (experienceLevel === 'novice') {
    techComfort = rng() < 0.5 ? 'low' : 'medium';
  } else if (experienceLevel === 'expert') {
    techComfort = rng() < 0.5 ? 'high' : 'medium';
  } else {
    techComfort = rng() < 0.33 ? 'low' : rng() < 0.5 ? 'medium' : 'high';
  }

  const goalsIndex = Math.floor(rng() * GOALS_BANK[experienceLevel].length);
  const challengesIndex = Math.floor(rng() * CHALLENGES_BANK[experienceLevel].length);

  // Tailor goals/challenges to industry and audience context
  const goals = GOALS_BANK[experienceLevel][goalsIndex];
  const challenges = CHALLENGES_BANK[experienceLevel][challengesIndex];

  if (industry && goals[0]) {
    goals[0] = goals[0];
  }

  return {
    projectId,
    name,
    role: personaRole,
    ageRange: pickRandom(AGE_RANGES, rng),
    experienceLevel,
    background: pickRandom(BACKGROUND_BANK[experienceLevel], rng),
    goals,
    challenges,
    learningPreferences,
    techComfort,
    motivation: pickRandom(MOTIVATION_BANK[experienceLevel], rng),
    priorKnowledge: pickRandom(PRIOR_KNOWLEDGE_BANK[experienceLevel], rng),
    workContext: pickRandom(WORK_CONTEXT_BANK, rng),
    accessibilityNeeds: pickRandom(ACCESSIBILITY_BANK, rng),
    quote: pickRandom(QUOTES_BANK[experienceLevel], rng),
    zpdAssessment: pickRandom(ZPD_BANK[experienceLevel], rng),
  };
}

function copyPersonaAsMarkdown(persona: LearnerPersona): void {
  const md = `# Learner Persona: ${persona.name}

**Role:** ${persona.role}  
**Age Range:** ${persona.ageRange}  
**Experience Level:** ${persona.experienceLevel.charAt(0).toUpperCase() + persona.experienceLevel.slice(1)}  
**Tech Comfort:** ${persona.techComfort.charAt(0).toUpperCase() + persona.techComfort.slice(1)}

---

> *"${persona.quote}"*

## Background
${persona.background}

## Prior Knowledge
${persona.priorKnowledge}

## Work Context
${persona.workContext}

## Goals
${persona.goals.map((g) => `- ${g}`).join('\n')}

## Challenges
${persona.challenges.map((c) => `- ${c}`).join('\n')}

## Learning Preferences (VARK)
${persona.learningPreferences.join(', ')}

## Motivation
${persona.motivation}

## ZPD Assessment
${persona.zpdAssessment}

## Accessibility Needs
${persona.accessibilityNeeds}
`;
  navigator.clipboard.writeText(md).catch(() => {
    // fallback: create temp textarea
    const el = document.createElement('textarea');
    el.value = md;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  });
}

// ──────────────────────────────────────────
// SUB-COMPONENTS
// ──────────────────────────────────────────

function TechComfortBar({ level }: { level: 'low' | 'medium' | 'high' }) {
  const filled = level === 'low' ? 1 : level === 'medium' ? 2 : 3;
  const labels = ['Low', 'Medium', 'High'];
  const colors = ['bg-red-400', 'bg-yellow-400', 'bg-green-500'];
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'h-2.5 w-8 rounded-full transition-colors',
              i < filled ? colors[filled - 1] : 'bg-surface-200'
            )}
          />
        ))}
      </div>
      <span className="text-xs text-surface-500">{labels[filled - 1]}</span>
    </div>
  );
}

function ExperienceBadge({ level }: { level: ExperienceLevel }) {
  const config = {
    novice: { label: 'Novice', className: 'bg-green-100 text-green-800' },
    intermediate: { label: 'Intermediate', className: 'bg-blue-100 text-blue-800' },
    expert: { label: 'Expert', className: 'bg-purple-100 text-purple-800' },
  };
  const { label, className } = config[level];
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold', className)}>
      {label}
    </span>
  );
}

interface PersonaCardProps {
  persona: LearnerPersona;
  onDelete: () => void;
  onCopy: () => void;
}

function PersonaCard({ persona, onDelete, onCopy }: PersonaCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const avatarColor = getAvatarColor(persona.name);
  const initials = getInitials(persona.name);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-surface-200 shadow-sm p-5 flex flex-col gap-4',
        'transition-all duration-300 ease-out',
        'animate-fadeIn'
      )}
    >
      {/* Card Header */}
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base',
            avatarColor
          )}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-surface-900 text-base leading-tight">{persona.name}</h3>
          <p className="text-sm text-surface-500 mt-0.5">{persona.role}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-xs text-surface-500 bg-surface-100 px-2 py-0.5 rounded-full">
              {persona.ageRange}
            </span>
            <ExperienceBadge level={persona.experienceLevel} />
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0 p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors"
          aria-label={expanded ? 'Collapse persona details' : 'Expand persona details'}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('transition-transform duration-200', expanded && 'rotate-180')}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* Quote */}
      <blockquote className="border-l-4 border-brand-300 pl-3 italic text-surface-600 text-sm leading-relaxed">
        "{persona.quote}"
      </blockquote>

      {/* VARK preferences */}
      <div>
        <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1.5">Learning Preferences</p>
        <div className="flex gap-1.5 flex-wrap">
          {VARK_MODALITIES.map((m) => {
            const isActive = persona.learningPreferences.includes(m.key);
            return (
              <span
                key={m.key}
                className={cn(
                  'inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold',
                  isActive ? m.color : 'bg-surface-100 text-surface-400'
                )}
              >
                {m.short} — {m.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Tech comfort */}
      <div>
        <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1.5">Tech Comfort</p>
        <TechComfortBar level={persona.techComfort} />
      </div>

      {/* Goals */}
      <div>
        <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1.5">Goals</p>
        <ul className="space-y-1.5">
          {persona.goals.map((goal, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-surface-700">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5 text-green-500">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {goal}
            </li>
          ))}
        </ul>
      </div>

      {/* Challenges */}
      <div>
        <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1.5">Challenges</p>
        <ul className="space-y-1.5">
          {persona.challenges.map((challenge, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-surface-700">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5 text-amber-500">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              {challenge}
            </li>
          ))}
        </ul>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="flex flex-col gap-4 border-t border-surface-100 pt-4 animate-fadeIn">
          {/* Background */}
          <div>
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1.5">Background</p>
            <p className="text-sm text-surface-700 leading-relaxed">{persona.background}</p>
          </div>

          {/* Prior Knowledge */}
          <div>
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1.5">Prior Knowledge</p>
            <p className="text-sm text-surface-700 leading-relaxed">{persona.priorKnowledge}</p>
          </div>

          {/* Work Context */}
          <div>
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1.5">Work Context</p>
            <p className="text-sm text-surface-700 leading-relaxed">{persona.workContext}</p>
          </div>

          {/* Motivation */}
          <div>
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1.5">Motivation</p>
            <p className="text-sm text-surface-700 leading-relaxed">{persona.motivation}</p>
          </div>

          {/* ZPD Assessment */}
          <div>
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1.5">ZPD Assessment</p>
            <div className="flex items-start gap-2">
              <span className={cn(
                'flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
                persona.experienceLevel === 'novice' && 'bg-green-100 text-green-800',
                persona.experienceLevel === 'intermediate' && 'bg-blue-100 text-blue-800',
                persona.experienceLevel === 'expert' && 'bg-purple-100 text-purple-800',
              )}>
                {persona.experienceLevel === 'novice' ? 'Comfort → Learning' : persona.experienceLevel === 'intermediate' ? 'Learning Zone' : 'Stretch Zone'}
              </span>
            </div>
            <p className="text-sm text-surface-700 leading-relaxed mt-2">{persona.zpdAssessment}</p>
          </div>

          {/* Accessibility Needs */}
          {persona.accessibilityNeeds && persona.accessibilityNeeds !== 'None reported.' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">Accessibility Needs</p>
              </div>
              <p className="text-sm text-yellow-800">{persona.accessibilityNeeds}</p>
            </div>
          )}
        </div>
      )}

      {/* Card Footer */}
      <div className="flex items-center gap-2 border-t border-surface-100 pt-3 mt-1">
        <button
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          aria-label={`Delete persona ${persona.name}`}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6L18.1 20.1A2 2 0 0116.1 22H7.9A2 2 0 015.9 20.1L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
          </svg>
          Delete
        </button>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-surface-600 hover:bg-surface-100 rounded-lg transition-colors"
          aria-label={`Copy persona ${persona.name} as Markdown`}
        >
          {copied ? (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              Copy as Markdown
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-8">
      <div className="w-20 h-20 rounded-full bg-surface-100 flex items-center justify-center mb-5">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-surface-400">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-surface-700 mb-2">No personas created yet</h3>
      <p className="text-sm text-surface-500 max-w-sm leading-relaxed">
        Generate personas to understand your learners' characteristics, preferences, and needs. Use the form on the left to configure and generate your personas.
      </p>
    </div>
  );
}

// ──────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────

interface PersonaGeneratorProps {
  projectId: string;
}

export default function PersonaGenerator({ projectId }: PersonaGeneratorProps) {
  const projects = useAppStore((s) => s.projects);
  const addLearnerPersona = useAppStore((s) => s.addLearnerPersona);
  const deleteLearnerPersona = useAppStore((s) => s.deleteLearnerPersona);
  const getDevToolData = useAppStore((s) => s.getDevToolData);

  const project = projects.find((p) => p.id === projectId);
  const devData = getDevToolData(projectId);
  const personas: LearnerPersona[] = devData.personas;

  // Form state
  const [numPersonas, setNumPersonas] = useState(3);
  const [roleInput, setRoleInput] = useState('');
  const [industryInput, setIndustryInput] = useState('');
  const [selectedLevels, setSelectedLevels] = useState<ExperienceLevel[]>(['novice', 'intermediate', 'expert']);
  const [isGenerating, setIsGenerating] = useState(false);

  const experienceLevelOptions: { key: ExperienceLevel; label: string }[] = [
    { key: 'novice', label: 'Novice' },
    { key: 'intermediate', label: 'Intermediate' },
    { key: 'expert', label: 'Expert' },
  ];

  const toggleLevel = useCallback((level: ExperienceLevel) => {
    setSelectedLevels((prev) => {
      if (prev.includes(level)) {
        // Keep at least one selected
        if (prev.length === 1) return prev;
        return prev.filter((l) => l !== level);
      }
      return [...prev, level];
    });
  }, []);

  const handleGenerate = useCallback(() => {
    if (selectedLevels.length === 0) return;
    setIsGenerating(true);

    setTimeout(() => {
      const baseSeed = Date.now();
      for (let i = 0; i < numPersonas; i++) {
        const personaData = generatePersona(
          baseSeed + i * 7919,
          selectedLevels,
          roleInput,
          industryInput || (project?.industry ?? ''),
          project?.targetAudience ?? '',
          projectId
        );
        addLearnerPersona(personaData);
      }
      setIsGenerating(false);
    }, 600);
  }, [numPersonas, selectedLevels, roleInput, industryInput, project, projectId, addLearnerPersona]);

  const handleDelete = useCallback((personaId: string) => {
    deleteLearnerPersona(projectId, personaId);
  }, [deleteLearnerPersona, projectId]);

  const handleCopy = useCallback((persona: LearnerPersona) => {
    copyPersonaAsMarkdown(persona);
  }, []);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left panel — Generation Form */}
      <div className="w-80 flex-shrink-0 border-r border-surface-200 bg-surface-50 flex flex-col overflow-y-auto">
        <div className="p-5 flex flex-col gap-5">
          <div>
            <h2 className="text-sm font-semibold text-surface-900">Learner Persona Generator</h2>
            <p className="text-xs text-surface-500 mt-0.5 leading-relaxed">
              Generate realistic learner personas based on your target audience.
            </p>
          </div>

          {/* Target audience context */}
          <div>
            <label className="block text-xs font-semibold text-surface-600 uppercase tracking-wide mb-1.5">
              Target Audience Context
            </label>
            <div className="bg-brand-50 border border-brand-100 rounded-lg p-3">
              <p className="text-xs text-brand-800 leading-relaxed">
                {project?.targetAudience || 'No target audience defined for this project.'}
              </p>
            </div>
          </div>

          {/* Number of personas */}
          <div>
            <label className="block text-xs font-semibold text-surface-600 uppercase tracking-wide mb-1.5">
              Number of Personas
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setNumPersonas((n) => Math.max(1, n - 1))}
                disabled={numPersonas <= 1}
                className="w-8 h-8 rounded-lg border border-surface-300 bg-white flex items-center justify-center text-surface-600 hover:bg-surface-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium text-lg leading-none"
                aria-label="Decrease number of personas"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-semibold text-surface-900">
                {numPersonas}
              </span>
              <button
                onClick={() => setNumPersonas((n) => Math.min(5, n + 1))}
                disabled={numPersonas >= 5}
                className="w-8 h-8 rounded-lg border border-surface-300 bg-white flex items-center justify-center text-surface-600 hover:bg-surface-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium text-lg leading-none"
                aria-label="Increase number of personas"
              >
                +
              </button>
            </div>
          </div>

          {/* Role / Job title */}
          <div>
            <label htmlFor="persona-role" className="block text-xs font-semibold text-surface-600 uppercase tracking-wide mb-1.5">
              Role / Job Title <span className="text-surface-400 normal-case font-normal">(optional)</span>
            </label>
            <input
              id="persona-role"
              type="text"
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              placeholder="e.g., Healthcare administrative staff"
              className="w-full px-3 py-2 text-sm border border-surface-300 bg-white rounded-lg text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          {/* Industry / Domain */}
          <div>
            <label htmlFor="persona-industry" className="block text-xs font-semibold text-surface-600 uppercase tracking-wide mb-1.5">
              Industry / Domain <span className="text-surface-400 normal-case font-normal">(optional)</span>
            </label>
            <input
              id="persona-industry"
              type="text"
              value={industryInput}
              onChange={(e) => setIndustryInput(e.target.value)}
              placeholder={project?.industry || 'e.g., Healthcare, Finance...'}
              className="w-full px-3 py-2 text-sm border border-surface-300 bg-white rounded-lg text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
            {project?.industry && !industryInput && (
              <p className="text-xs text-surface-500 mt-1">
                Using project industry: <span className="font-medium text-surface-700">{project.industry}</span>
              </p>
            )}
          </div>

          {/* Experience range */}
          <div>
            <label className="block text-xs font-semibold text-surface-600 uppercase tracking-wide mb-1.5">
              Experience Range
            </label>
            <p className="text-xs text-surface-500 mb-2">Select which experience levels to include.</p>
            <div className="flex gap-2 flex-wrap">
              {experienceLevelOptions.map(({ key, label }) => {
                const isSelected = selectedLevels.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggleLevel(key)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150',
                      isSelected && key === 'novice' && 'bg-green-100 border-green-300 text-green-800',
                      isSelected && key === 'intermediate' && 'bg-blue-100 border-blue-300 text-blue-800',
                      isSelected && key === 'expert' && 'bg-purple-100 border-purple-300 text-purple-800',
                      !isSelected && 'bg-white border-surface-200 text-surface-400 hover:border-surface-300 hover:text-surface-600'
                    )}
                    aria-pressed={isSelected}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate button */}
          <Button
            variant="primary"
            fullWidth
            loading={isGenerating}
            onClick={handleGenerate}
            disabled={selectedLevels.length === 0}
            icon={
              !isGenerating ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
              ) : undefined
            }
          >
            {isGenerating ? 'Generating...' : `Generate ${numPersonas} Persona${numPersonas > 1 ? 's' : ''}`}
          </Button>

          {/* Info box */}
          {personas.length > 0 && (
            <div className="bg-surface-100 rounded-lg p-3">
              <p className="text-xs text-surface-600 leading-relaxed">
                <span className="font-semibold">{personas.length} persona{personas.length > 1 ? 's' : ''}</span> saved for this project. New generations will be added to the existing set.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right panel — Persona Cards */}
      <div className="flex-1 overflow-y-auto bg-surface-50">
        {personas.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-surface-700">
                {personas.length} Persona{personas.length > 1 ? 's' : ''}
              </h3>
              <span className="text-xs text-surface-500">Click the expand icon to see full details</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {personas.map((persona) => (
                <div
                  key={persona.id}
                  style={{
                    animation: 'fadeInUp 0.3s ease-out',
                  }}
                >
                  <PersonaCard
                    persona={persona}
                    onDelete={() => handleDelete(persona.id)}
                    onCopy={() => handleCopy(persona)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CSS animations */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeInUp 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}
