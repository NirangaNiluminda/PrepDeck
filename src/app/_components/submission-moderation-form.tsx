import { approveSubmissionAction, rejectSubmissionAction, requestChangesAction } from '../actions/community';

const BUTTON = 'rounded-md px-2.5 py-1 text-sm font-medium';
const PRIMARY = `${BUTTON} bg-brand-600 text-white hover:bg-brand-500`;
const SECONDARY = `${BUTTON} text-zinc-700 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-100 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-800`;
const DANGER = `${BUTTON} text-rose-700 ring-1 ring-inset ring-rose-300 hover:bg-rose-50 dark:text-rose-300 dark:ring-rose-500/40 dark:hover:bg-rose-500/10`;
const NOTE = 'block w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900';

/**
 * One form per decision, each with its own `action` — the same shape
 * ModerationActions on the question page already uses. An earlier version
 * put all three buttons in one form and picked the action per-button with
 * `formAction`; that produced a wrong outcome server-side under this Next.js
 * version, so this — three independent forms — is the proven-working shape.
 */
export function SubmissionModerationForm({ submissionId }: { submissionId: string }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <form action={approveSubmissionAction}>
        <input type="hidden" name="id" value={submissionId} />
        <button type="submit" className={PRIMARY}>
          Approve
        </button>
      </form>

      <form action={rejectSubmissionAction} className="flex items-center gap-2">
        <input type="hidden" name="id" value={submissionId} />
        <input name="note" placeholder="Note (optional)" className={`${NOTE} w-40`} />
        <button type="submit" className={DANGER}>
          Reject
        </button>
      </form>

      <form action={requestChangesAction} className="flex items-center gap-2">
        <input type="hidden" name="id" value={submissionId} />
        <input name="note" required placeholder="What to change (required)" className={`${NOTE} w-52`} />
        <button type="submit" className={SECONDARY}>
          Request changes
        </button>
      </form>
    </div>
  );
}
