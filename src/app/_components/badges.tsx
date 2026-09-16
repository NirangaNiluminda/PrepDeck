import Link from 'next/link';
import { DIFFICULTY_LABELS, STATUS_LABELS, topicLabel } from '../_lib/labels';

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

const BADGE = 'inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset';

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  return (
    <span className={`${BADGE} ${DIFFICULTY_STYLES[difficulty] ?? ''}`}>
      {DIFFICULTY_LABELS[difficulty] ?? difficulty}
    </span>
  );
}

/** Published is the normal state, so it gets no badge. */
export function StatusBadge({ status }: { status: string }) {
  if (status === 'published') return null;
  return <span className={`${BADGE} ${STATUS_STYLES[status] ?? ''}`}>{STATUS_LABELS[status] ?? status}</span>;
}

/** "Databases › Indexing". With `linked`, each level filters the browse page to that topic. */
export function TopicTrail({ path, linked = false }: { path: string; linked?: boolean }) {
  const segments = path.split('/');
  return (
    <span className="inline-flex flex-wrap items-center gap-x-1">
      {segments.map((segment, i) => {
        const label = topicLabel(segment);
        const topic = segments.slice(0, i + 1).join('/');
        return (
          <span key={topic} className="inline-flex items-center gap-x-1">
            {i > 0 && <span aria-hidden className="text-zinc-400 dark:text-zinc-600">›</span>}
            {linked ? (
              <Link href={`/?topic=${encodeURIComponent(topic)}`} className="hover:text-indigo-600 hover:underline dark:hover:text-indigo-400">
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
      className="text-zinc-500 hover:text-indigo-600 hover:underline dark:text-zinc-400 dark:hover:text-indigo-400"
    >
      #{tag}
    </Link>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-zinc-300 bg-white px-1 font-mono text-[11px] text-zinc-600 shadow-[0_1px_0] shadow-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:shadow-zinc-700">
      {children}
    </kbd>
  );
}
