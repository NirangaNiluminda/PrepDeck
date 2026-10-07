import Link from 'next/link';
import { DIFFICULTY_LABELS, STATUS_LABELS, SUBMISSION_STATUS_LABELS, topicLabel, topicStyle } from '../_lib/labels';

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/25',
  medium: 'bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/25',
  hard: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/25',
};

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-zinc-100 text-zinc-700 ring-zinc-500/20 dark:bg-zinc-400/10 dark:text-zinc-300 dark:ring-zinc-400/25',
  'in-review': 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/25',
  archived: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-400/10 dark:text-red-300 dark:ring-red-400/25',
};

const DIFFICULTY_DOTS: Record<string, string> = {
  easy: 'bg-emerald-500',
  medium: 'bg-amber-500',
  hard: 'bg-rose-500',
};

const BADGE = 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset';

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  return (
    <span className={`${BADGE} ${DIFFICULTY_STYLES[difficulty] ?? ''}`}>
      <span aria-hidden className={`size-1.5 rounded-full ${DIFFICULTY_DOTS[difficulty] ?? 'bg-zinc-400'}`} />
      {DIFFICULTY_LABELS[difficulty] ?? difficulty}
    </span>
  );
}

/** The question's top-level topic as a coloured chip, e.g. "🗄️ Databases". */
export function TopicChip({ path, className = '' }: { path: string; className?: string }) {
  const style = topicStyle(path);
  return (
    <span className={`${BADGE} ${style.chip} ${className}`}>
      <span aria-hidden>{style.emoji}</span>
      {topicLabel(path.split('/')[0])}
    </span>
  );
}

/** Published is the normal state, so it gets no badge. */
export function StatusBadge({ status }: { status: string }) {
  if (status === 'published') return null;
  return <span className={`${BADGE} ${STATUS_STYLES[status] ?? ''}`}>{STATUS_LABELS[status] ?? status}</span>;
}

const SUBMISSION_STATUS_STYLES: Record<string, string> = {
  pending: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/25',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/25',
  rejected: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-400/10 dark:text-red-300 dark:ring-red-400/25',
  'changes-requested': 'bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/25',
};

export function SubmissionStatusBadge({ status }: { status: string }) {
  return (
    <span className={`${BADGE} ${SUBMISSION_STATUS_STYLES[status] ?? ''}`}>
      {SUBMISSION_STATUS_LABELS[status] ?? status}
    </span>
  );
}

/**
 * "Databases › Indexing". With `linked`, each level filters the browse page to
 * that topic. `hideRoot` drops the first level for when a TopicChip already shows it.
 */
export function TopicTrail({ path, linked = false, hideRoot = false }: { path: string; linked?: boolean; hideRoot?: boolean }) {
  const segments = path.split('/');
  return (
    <span className="inline-flex flex-wrap items-center gap-x-1">
      {segments.map((segment, i) => {
        if (hideRoot && i === 0) return null;
        const label = topicLabel(segment);
        const topic = segments.slice(0, i + 1).join('/');
        return (
          <span key={topic} className="inline-flex items-center gap-x-1">
            {i > (hideRoot ? 1 : 0) && <span aria-hidden className="text-zinc-400 dark:text-zinc-600">›</span>}
            {linked ? (
              <Link href={`/?topic=${encodeURIComponent(topic)}`} className="hover:text-brand-600 hover:underline dark:hover:text-brand-400">
                {label}
              </Link>
            ) : (
              label
            )}
          </span>
        );
      })}
    </span>
  );
}

export function TagLink({ tag }: { tag: string }) {
  return (
    <Link
      href={`/?tag=${encodeURIComponent(tag)}`}
      className="text-zinc-500 hover:text-brand-600 hover:underline dark:text-zinc-400 dark:hover:text-brand-400"
    >
      #{tag}
    </Link>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-md border border-current/25 bg-current/10 px-1 font-mono text-[11px] font-medium shadow-[0_1px_0] shadow-current/20">
      {children}
    </kbd>
  );
}
