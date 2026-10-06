import type { QuestionRevision } from '@/modules/questions';
import { revertQuestionAction } from '../actions/questions';
import { InlineMarkdown } from './markdown';

/**
 * `Date` isn't passed down as a prop — formatted to a string here instead,
 * same reasoning `QuestionDetail.updatedAt` is a string, not a Date (see
 * ports/dto.ts): a plain value is what's safe to carry across a component
 * boundary that also has to serialize a server-action reference.
 */
export interface RevisionEntry {
  readonly id: string;
  readonly version: number;
  readonly stem: string;
  readonly editedBy: string;
  readonly editedAtLabel: string;
}

export const toRevisionEntry = (revision: QuestionRevision): RevisionEntry => ({
  id: revision.id,
  version: revision.version,
  stem: revision.content.stem,
  editedBy: revision.editedBy,
  editedAtLabel: revision.createdAt.toLocaleString(),
});

/** Newest first, already sorted by listQuestionRevisions — a plain server-rendered list, no client state needed. */
export function RevisionHistory({ questionId, revisions }: { questionId: string; revisions: readonly RevisionEntry[] }) {
  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">History</h2>
      <ul className="space-y-3">
        {revisions.map((revision) => (
          <li key={revision.id} className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm dark:border-zinc-800">
            <div className="flex items-center justify-between gap-3">
              <p className="text-zinc-800 dark:text-zinc-200">
                Version {revision.version} — <InlineMarkdown>{revision.stem}</InlineMarkdown>
              </p>
              {/* Each list item's form needs its own bound action reference — see revertQuestionAction's own comment. */}
              <form action={revertQuestionAction.bind(null, questionId, revision.id)}>
                <button
                  type="submit"
                  className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-zinc-700 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-100 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-800"
                >
                  Revert to this
                </button>
              </form>
            </div>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Edited by {revision.editedBy} on {revision.editedAtLabel}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
