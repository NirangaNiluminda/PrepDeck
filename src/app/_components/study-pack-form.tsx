'use client';

import { useActionState, useState } from 'react';
import { createStudyPackAction, type StudyPackFormState } from '../actions/practice';
import { DIFFICULTY_LABELS, topicLabel, topicStyle } from '../_lib/labels';

// A local echo of TopicNode, not an import — client components never import '@/modules/*'.
interface TopicOption {
  readonly slug: string;
  readonly path: string;
  readonly count: number;
  readonly children: readonly TopicOption[];
}

const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
const DIFFICULTY_EMOJI: Record<string, string> = { easy: '🌱', medium: '🌿', hard: '🌳' };
// Mirrors MAX_PACK_NAME_LENGTH in the practice module; the server enforces it regardless.
const MAX_NAME = 60;

const isWithin = (path: string, ancestor: string) => path === ancestor || path.startsWith(`${ancestor}/`);

const flatten = (nodes: readonly TopicOption[]): TopicOption[] => nodes.flatMap((n) => [n, ...flatten(n.children)]);

export function StudyPackForm({ topics }: { topics: readonly TopicOption[] }) {
  const [state, formAction, pending] = useActionState<StudyPackFormState, FormData>(createStudyPackAction, {});
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [name, setName] = useState('');

  const toggle = (path: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });

  // A topic already covered by a selected ancestor adds nothing, so it isn't counted twice.
  const effective = [...selected].filter((path) => ![...selected].some((other) => other !== path && isWithin(path, other)));
  const byPath = new Map(flatten(topics).map((t) => [t.path, t]));
  const questionCount = effective.reduce((sum, path) => sum + (byPath.get(path)?.count ?? 0), 0);
  const suggestedName =
    effective
      .map((path) => topicLabel(path.split('/').pop() ?? path))
      .join(' + ')
      .slice(0, MAX_NAME) || 'My study pack';

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <p
          role="alert"
          className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200"
        >
          {state.error}
        </p>
      )}

      <Step number={1} title="Pick your topics" hint="Choose a whole area, or open it up to pick specific subtopics.">
        <div className="grid gap-3 sm:grid-cols-2">
          {topics.map((topic) => {
            const style = topicStyle(topic.path);
            const checked = selected.has(topic.path);
            return (
              <div
                key={topic.path}
                className={`rounded-2xl border-2 bg-surface p-3 transition ${
                  checked ? 'border-brand-500 shadow-md shadow-brand-500/15' : 'border-line hover:border-brand-300'
                }`}
              >
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    name="topicPaths"
                    value={topic.path}
                    checked={checked}
                    onChange={() => toggle(topic.path)}
                    className="size-4.5 shrink-0 accent-brand-600"
                  />
                  <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-lg ring-1 ring-inset ${style.chip}`}>
                    {style.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-zinc-900 dark:text-zinc-50">{topicLabel(topic.slug)}</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {topic.count} {topic.count === 1 ? 'question' : 'questions'}
                    </span>
                  </span>
                </label>
                {topic.children.length > 0 && (
                  <details className="mt-2 pl-7">
                    <summary className="cursor-pointer select-none text-xs font-semibold text-brand-600 dark:text-brand-400">
                      {checked ? 'All subtopics included' : 'Pick subtopics'}
                    </summary>
                    <div className="mt-1.5 space-y-0.5">
                      {flatten(topic.children).map((child) => {
                        const covered = checked && child.path !== topic.path;
                        return (
                          <label
                            key={child.path}
                            style={{ paddingLeft: (child.path.split('/').length - 2) * 14 }}
                            className={`flex items-center gap-2 rounded-lg px-1.5 py-1 text-sm ${covered ? 'opacity-50' : 'cursor-pointer hover:bg-brand-50 dark:hover:bg-brand-400/10'}`}
                          >
                            <input
                              type="checkbox"
                              name="topicPaths"
                              value={child.path}
                              checked={covered || selected.has(child.path)}
                              disabled={covered}
                              onChange={() => toggle(child.path)}
                              className="size-4 accent-brand-600"
                            />
                            <span className="flex-1 text-zinc-700 dark:text-zinc-300">{topicLabel(child.slug)}</span>
                            <span className="text-xs tabular-nums text-zinc-400">{child.count}</span>
                          </label>
                        );
                      })}
                    </div>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      </Step>

      <Step number={2} title="Difficulty" hint="Optional. Leave all off to include every level.">
        <div className="flex flex-wrap gap-2">
          {DIFFICULTIES.map((d) => (
            <label
              key={d}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-surface px-4 py-2 text-sm font-semibold text-zinc-700 ring-1 ring-inset ring-line transition hover:ring-brand-300 has-checked:bg-brand-600 has-checked:text-white has-checked:ring-brand-600 dark:text-zinc-300"
            >
              <input type="checkbox" name="difficulties" value={d} className="sr-only" />
              <span aria-hidden>{DIFFICULTY_EMOJI[d]}</span>
              {DIFFICULTY_LABELS[d]}
            </label>
          ))}
        </div>
      </Step>

      <Step number={3} title="Name it" hint="So you can find it again. You can leave the suggestion.">
        <input
          // Only one `name` field may submit: while this box is empty, the hidden
          // suggestion below does, so a pack always gets a name.
          name={name ? 'name' : undefined}
          aria-label="Pack name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={suggestedName}
          maxLength={MAX_NAME}
          className="block w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm shadow-sm placeholder:text-zinc-400 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
        />
        {!name && <input type="hidden" name="name" value={suggestedName} />}
      </Step>

      <div className="sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-line bg-surface/95 p-4 shadow-lg backdrop-blur">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {effective.length === 0 ? (
            'Pick at least one topic'
          ) : (
            <>
              <span className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50">{questionCount}</span>{' '}
              {questionCount === 1 ? 'question' : 'questions'} in {effective.length} {effective.length === 1 ? 'topic' : 'topics'}
              <span className="block text-xs">before any difficulty filter</span>
            </>
          )}
        </p>
        <button
          type="submit"
          disabled={pending || effective.length === 0}
          className="rounded-full bg-gradient-to-r from-brand-600 to-fuchsia-500 px-6 py-3 text-sm font-bold text-white shadow-md shadow-brand-600/25 transition enabled:hover:-translate-y-0.5 disabled:opacity-40"
        >
          {pending ? 'Creating…' : '✨ Create & start'}
        </button>
      </div>
    </form>
  );
}

function Step({ number, title, hint, children }: { number: number; title: string; hint: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-3xl border border-line bg-surface/60 p-5">
      <legend className="sr-only">{title}</legend>
      <div className="mb-4 flex items-start gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
          {number}
        </span>
        <div>
          <p className="font-bold text-zinc-900 dark:text-zinc-50">{title}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
        </div>
      </div>
      {children}
    </fieldset>
  );
}
