'use client';

import { useActionState } from 'react';
import { REPORT_REASONS } from '@/modules/community';
import { reportQuestionAction, type ReportFormState } from '../actions/community';
import { REPORT_REASON_LABELS } from '../_lib/labels';

const INPUT =
  'block w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm shadow-xs placeholder:text-zinc-400 focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-900';

/** A native <details> disclosure needs no client state of its own for open/closed — only the form inside does. */
export function ReportButton({ questionId }: { questionId: string }) {
  const [state, formAction, pending] = useActionState<ReportFormState, FormData>(
    reportQuestionAction.bind(null, questionId),
    {},
  );

  if (state.success) {
    return <p className="text-xs text-zinc-500 dark:text-zinc-400">Thanks — a moderator will take a look.</p>;
  }

  return (
    <details className="text-xs text-zinc-500 dark:text-zinc-400">
      <summary className="cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-300">Report this question</summary>
      <form action={formAction} className="mt-2 max-w-sm space-y-2">
        {state.error && <p role="alert" className="text-rose-700 dark:text-rose-300">{state.error}</p>}
        <select name="reason" required defaultValue="" className={INPUT}>
          <option value="" disabled>
            Choose a reason
          </option>
          {REPORT_REASONS.map((reason) => (
            <option key={reason} value={reason}>
              {REPORT_REASON_LABELS[reason] ?? reason}
            </option>
          ))}
        </select>
        <textarea name="note" rows={2} placeholder="Optional details" className={INPUT} />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-rose-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-rose-500 disabled:opacity-60"
        >
          {pending ? 'Sending…' : 'Submit report'}
        </button>
      </form>
    </details>
  );
}
