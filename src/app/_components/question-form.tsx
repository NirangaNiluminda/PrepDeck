'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import type { QuestionFormState, QuestionFormValues } from '../_lib/question-form';
import { DIFFICULTY_LABELS, TYPE_LABELS } from '../_lib/labels';

interface QuestionFormProps {
  readonly action: (state: QuestionFormState, formData: FormData) => Promise<QuestionFormState>;
  readonly initial: QuestionFormValues;
  readonly types: readonly string[];
  readonly difficulties: readonly string[];
  readonly topics: readonly string[];
  readonly submitLabel: string;
  readonly cancelHref: string;
}

const INPUT =
  'block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-xs placeholder:text-zinc-400 focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-900';

export function QuestionForm({ action, initial, types, difficulties, topics, submitLabel, cancelHref }: QuestionFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  // React resets a form to its default values after the action runs. Making
  // the defaults what was just submitted means a rejected save keeps the work.
  const values = state.values ?? initial;
  const [type, setType] = useState(values.type);

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

      <Section legend="Question">
        <Field id="stem" label="Question" hint="Markdown. Between 10 and 2000 characters.">
          <textarea id="stem" name="stem" rows={3} required defaultValue={values.stem} aria-describedby="stem-hint" className={INPUT} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="type" label="Type">
            <select id="type" name="type" value={type} onChange={(e) => setType(e.target.value)} className={INPUT}>
              {types.map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABELS[t] ?? t}
                </option>
              ))}
            </select>
          </Field>
          <Field id="difficulty" label="Difficulty">
            {/* Keyed on its own value: a <select> resets to whichever <option>
                was `selected` at mount, and unlike a text input's defaultValue,
                React never re-applies a new one to an already-mounted select —
                so without a key, a rejected save reverts this dropdown to
                whatever it was on page load, silently. */}
            <select key={values.difficulty} id="difficulty" name="difficulty" defaultValue={values.difficulty} className={INPUT}>
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
              defaultValue={values.topicPath}
              aria-describedby="topicPath-hint"
              className={INPUT}
            />
            <datalist id="topic-suggestions">
              {topics.map((topic) => (
                <option key={topic} value={topic} />
              ))}
            </datalist>
          </Field>
          <Field id="tags" label="Tags" hint="Comma-separated, up to 10.">
            <input id="tags" name="tags" defaultValue={values.tags} aria-describedby="tags-hint" className={INPUT} />
          </Field>
        </div>
      </Section>

      {/* Hidden rather than removed, so switching type and back keeps what was typed. */}
      <div hidden={type !== 'mcq'}>
        <Section legend="Options">
          <Field id="options" label="Options" hint="One per line. Mark the correct option [x] and the others [ ].">
            <textarea
              id="options"
              name="options"
              rows={4}
              defaultValue={values.options}
              placeholder={'[x] The correct option\n[ ] A wrong option'}
              aria-describedby="options-hint"
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
            defaultValue={values.modelAnswer}
            aria-describedby="modelAnswer-hint"
            className={INPUT}
          />
        </Field>
        <Field id="keyPoints" label="Key points" hint="One per line: what a good answer must mention.">
          <textarea id="keyPoints" name="keyPoints" rows={4} defaultValue={values.keyPoints} aria-describedby="keyPoints-hint" className={INPUT} />
        </Field>
        <Field id="explanation" label="Explanation" hint="Optional background, in markdown.">
          <textarea id="explanation" name="explanation" rows={3} defaultValue={values.explanation} aria-describedby="explanation-hint" className={INPUT} />
        </Field>
        <Field id="references" label="References" hint="Optional. One http(s) link per line.">
          <textarea id="references" name="references" rows={2} defaultValue={values.references} aria-describedby="references-hint" className={INPUT} />
        </Field>
      </Section>

      <Section legend="Details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="slug" label="Slug" hint="Links the question to a file in content/questions. Leave empty for questions written here.">
            <input id="slug" name="slug" defaultValue={values.slug} aria-describedby="slug-hint" className={`${INPUT} font-mono`} />
          </Field>
          <Field id="source" label="Source" hint="Optional: where the question came from.">
            <input id="source" name="source" defaultValue={values.source} aria-describedby="source-hint" className={INPUT} />
          </Field>
        </div>
      </Section>

      <div className="flex items-center gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {pending ? 'Saving…' : submitLabel}
        </button>
        <Link href={cancelHref} className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
          Cancel
        </Link>
      </div>
    </form>
  );
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
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {hint}
        </p>
      )}
    </div>
  );
}
