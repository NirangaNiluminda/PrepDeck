'use client';

import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';
import type { SimilarQuestion } from '@/modules/questions';
import { checkSimilarQuestionsAction } from '../actions/community';
// Type-only imports: nothing server-side gets bundled here. See
// answer-body.tsx's own comment for why this is safe — the runtime helpers
// in _lib/question-form.ts (which reach into '@/modules/importer') stay out
// of this file entirely; this component parses the same textareas itself,
// only for display, and the server re-parses authoritatively on submit.
import type { QuestionFormState, QuestionFormValues } from '../_lib/question-form';
import { DIFFICULTY_LABELS, TYPE_LABELS } from '../_lib/labels';
import { AnswerBody } from './answer-body';
import { DifficultyBadge, TagLink } from './badges';
import { InlineMarkdown, Markdown } from './markdown';

interface SubmissionFormProps {
  readonly action: (state: QuestionFormState, formData: FormData) => Promise<QuestionFormState>;
  readonly initial: QuestionFormValues;
  readonly types: readonly string[];
  readonly difficulties: readonly string[];
  readonly topics: readonly string[];
  readonly submitLabel: string;
  readonly cancelHref: string;
}

const INPUT =
  'block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-xs placeholder:text-zinc-400 focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-900';

const lines = (text: string): string[] =>
  text.split('\n').map((line) => line.trim().replace(/^[-*+]\s+/, '')).filter(Boolean);

export function SubmissionForm({ action, initial, types, difficulties, topics, submitLabel, cancelHref }: SubmissionFormProps) {
  // Every field is controlled from here down, so — unlike QuestionForm's
  // uncontrolled defaultValue fields — React never needs telling to pick up
  // state.values after a rejected save: this state is already what was sent.
  const [state, formAction, pending] = useActionState(action, {});
  const [values, setValues] = useState<QuestionFormValues>(state.values ?? initial);

  const [duplicates, setDuplicates] = useState<SimilarQuestion[]>([]);
  useEffect(() => {
    const stem = values.stem.trim();
    // Both branches' setState calls live inside this callback, not the effect
    // body itself, which is what react-hooks/set-state-in-effect asks for.
    const timeout = setTimeout(() => {
      if (stem.length < 10) {
        setDuplicates([]);
        return;
      }
      checkSimilarQuestionsAction(stem).then(setDuplicates).catch(() => setDuplicates([]));
    }, 400);
    return () => clearTimeout(timeout);
  }, [values.stem]);

  const set = <K extends keyof QuestionFormValues>(key: K) => (value: QuestionFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
      <form action={formAction} className="space-y-8">
        {state.error && (
          <p
            role="alert"
            className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200"
          >
            {state.error}
          </p>
        )}

        <Section legend="Question">
          <Field id="stem" label="Question" hint="Markdown. Between 10 and 2000 characters.">
            <textarea
              id="stem"
              name="stem"
              rows={3}
              required
              value={values.stem}
              onChange={(e) => set('stem')(e.target.value)}
              className={INPUT}
            />
          </Field>

          {duplicates.length > 0 && (
            <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
              <p className="font-medium">Similar to existing questions:</p>
              <ul className="mt-1 list-inside list-disc space-y-0.5">
                {duplicates.map((d) => (
                  <li key={d.id}>
                    {d.stem} <span className="text-xs opacity-75">({Math.round(d.similarity * 100)}% similar)</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="type" label="Type">
              <select id="type" name="type" value={values.type} onChange={(e) => set('type')(e.target.value)} className={INPUT}>
                {types.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABELS[t] ?? t}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="difficulty" label="Difficulty">
              <select
                id="difficulty"
                name="difficulty"
                value={values.difficulty}
                onChange={(e) => set('difficulty')(e.target.value)}
                className={INPUT}
              >
                {difficulties.map((d) => (
                  <option key={d} value={d}>
                    {DIFFICULTY_LABELS[d] ?? d}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="topicPath" label="Topic" hint="A slug path up to 4 levels, like devops/docker/networking.">
              <input
                id="topicPath"
                name="topicPath"
                required
                list="topic-suggestions"
                value={values.topicPath}
                onChange={(e) => set('topicPath')(e.target.value)}
                className={INPUT}
              />
              <datalist id="topic-suggestions">
                {topics.map((topic) => (
                  <option key={topic} value={topic} />
                ))}
              </datalist>
            </Field>
            <Field id="tags" label="Tags" hint="Comma-separated, up to 10.">
              <input id="tags" name="tags" value={values.tags} onChange={(e) => set('tags')(e.target.value)} className={INPUT} />
            </Field>
          </div>
        </Section>

        <div hidden={values.type !== 'mcq'}>
          <Section legend="Options">
            <Field id="options" label="Options" hint="One per line. Mark the correct option [x] and the others [ ].">
              <textarea
                id="options"
                name="options"
                rows={4}
                value={values.options}
                onChange={(e) => set('options')(e.target.value)}
                placeholder={'[x] The correct option\n[ ] A wrong option'}
                className={`${INPUT} font-mono`}
              />
            </Field>
          </Section>
        </div>

        <Section legend="Answer">
          <Field id="modelAnswer" label="Model answer" hint="Markdown, including code blocks.">
            <textarea
              id="modelAnswer"
              name="modelAnswer"
              rows={8}
              required
              value={values.modelAnswer}
              onChange={(e) => set('modelAnswer')(e.target.value)}
              className={INPUT}
            />
          </Field>
          <Field id="keyPoints" label="Key points" hint="One per line: what a good answer must mention.">
            <textarea
              id="keyPoints"
              name="keyPoints"
              rows={4}
              value={values.keyPoints}
              onChange={(e) => set('keyPoints')(e.target.value)}
              className={INPUT}
            />
          </Field>
          <Field id="explanation" label="Explanation" hint="Optional background, in markdown.">
            <textarea
              id="explanation"
              name="explanation"
              rows={3}
              value={values.explanation}
              onChange={(e) => set('explanation')(e.target.value)}
              className={INPUT}
            />
          </Field>
          <Field id="references" label="References" hint="Optional. One http(s) link per line.">
            <textarea
              id="references"
              name="references"
              rows={2}
              value={values.references}
              onChange={(e) => set('references')(e.target.value)}
              className={INPUT}
            />
          </Field>
        </Section>

        <Section legend="Details">
          <Field id="source" label="Source" hint="Optional: where the question came from.">
            <input id="source" name="source" value={values.source} onChange={(e) => set('source')(e.target.value)} className={INPUT} />
          </Field>
        </Section>

        <div className="flex items-center gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-60"
          >
            {pending ? 'Submitting…' : submitLabel}
          </button>
          <Link href={cancelHref} className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            Cancel
          </Link>
        </div>
      </form>

      <div className="rounded-lg border border-zinc-200 p-5 lg:sticky lg:top-6 dark:border-zinc-800">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Live preview</p>
        <Preview values={values} />
      </div>
    </div>
  );
}

function Preview({ values }: { values: QuestionFormValues }) {
  if (!values.stem.trim()) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">Start typing a question to see a preview.</p>;
  }

  const tags = values.tags.split(',').map((t) => t.trim()).filter(Boolean);
  const options = values.type === 'mcq' ? parseOptionsForPreview(values.options) : [];

  return (
    <article>
      {values.stem.includes('\n') ? (
        <Markdown className="prose-sm">{values.stem}</Markdown>
      ) : (
        <h2 className="text-lg font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
          <InlineMarkdown>{values.stem}</InlineMarkdown>
        </h2>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
        <DifficultyBadge difficulty={values.difficulty} />
        <span>{TYPE_LABELS[values.type] ?? values.type}</span>
        {tags.map((tag) => (
          <TagLink key={tag} tag={tag} />
        ))}
      </div>

      {options.length > 0 && (
        <ul className="mt-4 space-y-1.5 text-sm">
          {options.map((option, i) => (
            <li key={i} className={option.correct ? 'font-medium text-emerald-700 dark:text-emerald-300' : 'text-zinc-700 dark:text-zinc-300'}>
              {option.correct ? '✓' : '·'} {option.text}
            </li>
          ))}
        </ul>
      )}

      {values.modelAnswer.trim() && (
        <div className="mt-6">
          <AnswerBody
            answer={{
              modelAnswer: values.modelAnswer,
              keyPoints: lines(values.keyPoints),
              explanation: values.explanation.trim() || undefined,
              references: lines(values.references),
            }}
          />
        </div>
      )}
    </article>
  );
}

// Preview-only, tolerant parsing — the server's parseOptionList (via
// toQuestionContent) is the authoritative one and runs again on submit.
function parseOptionsForPreview(text: string): { text: string; correct: boolean }[] {
  return lines(text).map((line) => {
    const match = line.match(/^\[([ xX])\]\s*(.*)$/);
    return match ? { correct: match[1].toLowerCase() === 'x', text: match[2] } : { correct: false, text: line };
  });
}

function Section({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{legend}</legend>
      {children}
    </fieldset>
  );
}

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>}
    </div>
  );
}
