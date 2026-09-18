'use client';

import { useActionState } from 'react';
import { startExamAction } from '../actions/exams';
import { DIFFICULTY_LABELS, TYPE_LABELS, topicLabel } from '../_lib/labels';
import { MAX_DURATION_MINUTES, MAX_QUESTIONS, MIN_DURATION_MINUTES, MIN_QUESTIONS } from '../_lib/exam-config';

// A local echo of TopicNode, not an import — the same discipline every other
// client component in this app follows around '@/modules/*'.
interface TopicOption {
  readonly slug: string;
  readonly path: string;
  readonly count: number;
  readonly children: readonly TopicOption[];
}

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const TYPES = ['mcq', 'short-answer', 'flashcard', 'code'];

const INPUT =
  'block w-24 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-900';

export function ExamBuilderForm({ topics }: { topics: readonly TopicOption[] }) {
  const [state, formAction, pending] = useActionState(startExamAction, {});

  return (
    <form action={formAction} className="space-y-8">
      {state.error && (
        <p
          role="alert"
          className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200"
        >
          {state.error}
        </p>
      )}

      <Section legend="Topics" hint="Leave all unticked to draw from every topic.">
        <div className="space-y-1">
          {topics.map((topic) => (
            <TopicCheckbox key={topic.path} topic={topic} />
          ))}
        </div>
      </Section>

      <Section legend="Difficulty" hint="Leave all unticked to include every difficulty.">
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {DIFFICULTIES.map((d) => (
            <Choice key={d} name="difficulties" value={d} label={DIFFICULTY_LABELS[d]} />
          ))}
        </div>
      </Section>

      <Section legend="Type" hint="Leave all unticked to include every type.">
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {TYPES.map((t) => (
            <Choice key={t} name="types" value={t} label={TYPE_LABELS[t]} />
          ))}
        </div>
      </Section>

      <Section legend="Timing">
        <div className="flex flex-wrap gap-6">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-800 dark:text-zinc-200">Questions</span>
            <input type="number" name="count" defaultValue={10} min={MIN_QUESTIONS} max={MAX_QUESTIONS} required className={INPUT} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-800 dark:text-zinc-200">Minutes</span>
            <input
              type="number"
              name="durationMinutes"
              defaultValue={20}
              min={MIN_DURATION_MINUTES}
              max={MAX_DURATION_MINUTES}
              required
              className={INPUT}
            />
          </label>
        </div>
      </Section>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
      >
        {pending ? 'Starting…' : 'Start exam'}
      </button>
    </form>
  );
}

function TopicCheckbox({ topic, depth = 0 }: { topic: TopicOption; depth?: number }) {
  return (
    <div style={{ marginLeft: depth * 16 }}>
      <Choice name="topicPaths" value={topic.path} label={topicLabel(topic.slug)} count={topic.count} />
      {topic.children.map((child) => (
        <TopicCheckbox key={child.path} topic={child} depth={depth + 1} />
      ))}
    </div>
  );
}

function Section({ legend, hint, children }: { legend: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{legend}</legend>
      {hint && <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>}
      {children}
    </fieldset>
  );
}

function Choice({ name, value, label, count }: { name: string; value: string; label: string; count?: number }) {
  return (
    <label className="flex items-center gap-1.5 rounded px-1 py-0.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800/60">
      <input type="checkbox" name={name} value={value} className="size-3.5 accent-indigo-600" />
      <span className="text-zinc-700 dark:text-zinc-300">{label}</span>
      {count !== undefined && <span className="text-xs text-zinc-400 dark:text-zinc-500">{count}</span>}
    </label>
  );
}
