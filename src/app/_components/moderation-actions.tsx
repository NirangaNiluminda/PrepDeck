import Link from 'next/link';
import { archiveQuestionAction, publishQuestionAction, restoreQuestionAction } from '../actions/questions';

const BUTTON = 'rounded-md px-2.5 py-1 text-sm font-medium';
const SECONDARY = `${BUTTON} text-zinc-700 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-100 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-800`;
const PRIMARY = `${BUTTON} bg-indigo-600 text-white hover:bg-indigo-500`;

/** Admin-only controls. The actions check the session themselves; hiding them here is just UI. */
export function ModerationActions({ id, status }: { id: string; status: string }) {
  return (
    <div className="flex items-center gap-2">
      <Link href={`/admin/questions/${id}/edit`} className={SECONDARY}>
        Edit
      </Link>
      {(status === 'draft' || status === 'in-review') && (
        <ActionButton action={publishQuestionAction} id={id} label="Publish" className={PRIMARY} />
      )}
      {status === 'archived' ? (
        <ActionButton action={restoreQuestionAction} id={id} label="Restore" className={SECONDARY} />
      ) : (
        <ActionButton action={archiveQuestionAction} id={id} label="Archive" className={SECONDARY} />
      )}
    </div>
  );
}

interface ActionButtonProps {
  readonly action: (formData: FormData) => Promise<void>;
  readonly id: string;
  readonly label: string;
  readonly className: string;
}

function ActionButton({ action, id, label, className }: ActionButtonProps) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}
