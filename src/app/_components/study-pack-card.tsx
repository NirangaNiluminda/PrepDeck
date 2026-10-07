import Link from 'next/link';
import type { StudyPackView } from '@/modules/practice';
import { archiveStudyPackAction } from '../actions/practice';
import { DIFFICULTY_LABELS, formatDaysAgo } from '../_lib/labels';
import { TopicChip } from './badges';

const MAX_TOPICS_SHOWN = 3;

export function StudyPackCard({ pack, now, highlight }: { pack: StudyPackView; now: Date; highlight: boolean }) {
  const { total, started, due, notStarted, mastery, lastStudiedAt } = pack.progress;
  const percent = total ? Math.round((started / total) * 100) : 0;
  const href = `/practice/session?pack=${pack.id}`;

  const cta =
    started === 0
      ? { label: '▶ Start', tone: 'primary' }
      : due > 0
        ? { label: `▶ Continue · ${due} due`, tone: 'primary' }
        : notStarted > 0
          ? { label: '▶ Continue', tone: 'primary' }
          : { label: '✓ All caught up', tone: 'quiet' };

  return (
    <article
      className={`relative flex flex-col rounded-3xl border bg-surface p-5 shadow-sm transition hover:shadow-md ${
        highlight ? 'border-brand-400 ring-4 ring-brand-500/10' : 'border-line'
      }`}
    >
      {highlight && (
        <span className="absolute -top-3 left-5 rounded-full bg-gradient-to-r from-brand-600 to-fuchsia-500 px-3 py-0.5 text-xs font-bold text-white shadow">
          Pick up where you left off
        </span>
      )}

      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-extrabold leading-snug tracking-tight text-zinc-900 dark:text-zinc-50">{pack.name}</h3>
        <details className="relative shrink-0">
          <summary
            aria-label={`More actions for ${pack.name}`}
            className="flex size-8 cursor-pointer list-none items-center justify-center rounded-full text-zinc-500 hover:bg-surface-muted [&::-webkit-details-marker]:hidden"
          >
            ⋯
          </summary>
          <div className="absolute right-0 z-10 mt-1 w-56 rounded-2xl border border-line bg-surface p-2 shadow-lg">
            <form action={archiveStudyPackAction.bind(null, pack.id)}>
              <button
                type="submit"
                className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-400/10"
              >
                🗃️ Archive pack
                <span className="block text-xs font-normal text-zinc-500 dark:text-zinc-400">What you learned stays in your daily review.</span>
              </button>
            </form>
          </div>
        </details>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {pack.topicPaths.slice(0, MAX_TOPICS_SHOWN).map((path) => (
          <TopicChip key={path} path={path} />
        ))}
        {pack.topicPaths.length > MAX_TOPICS_SHOWN && (
          <span className="text-xs font-semibold text-zinc-500">+{pack.topicPaths.length - MAX_TOPICS_SHOWN} more</span>
        )}
        {pack.difficulties.length > 0 && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            · {pack.difficulties.map((d) => DIFFICULTY_LABELS[d] ?? d).join(', ')}
          </span>
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-semibold text-zinc-700 dark:text-zinc-200">
            {started} of {total} started
          </span>
          <span className="text-xs font-bold text-brand-700 dark:text-brand-300">{percent}%</span>
        </div>
        <div
          role="progressbar"
          aria-label={`${pack.name} progress`}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={started}
          className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-surface-muted"
        >
          <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-fuchsia-500" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="new left" value={notStarted} emoji="📚" />
        <Stat label="due now" value={due} emoji="⏰" />
        <Stat label="mastery" value={mastery === undefined ? '—' : `${mastery}%`} emoji="🎯" />
      </dl>

      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {lastStudiedAt ? `Studied ${formatDaysAgo(lastStudiedAt, now)}` : 'Not started yet'}
        </span>
        <Link
          href={href}
          className={
            cta.tone === 'primary'
              ? 'rounded-full bg-gradient-to-r from-brand-600 to-fuchsia-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-brand-600/25 transition hover:-translate-y-0.5'
              : 'rounded-full px-4 py-2 text-sm font-bold text-emerald-700 ring-1 ring-inset ring-emerald-300 hover:bg-emerald-50 dark:text-emerald-300 dark:ring-emerald-400/30 dark:hover:bg-emerald-400/10'
          }
        >
          {cta.label}
        </Link>
      </div>
    </article>
  );
}

function Stat({ label, value, emoji }: { label: string; value: number | string; emoji: string }) {
  return (
    <div className="rounded-2xl bg-surface-muted px-2 py-2">
      <dd className="text-base font-extrabold text-zinc-900 dark:text-zinc-50">
        <span aria-hidden className="mr-1 text-sm">
          {emoji}
        </span>
        {value}
      </dd>
      <dt className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">{label}</dt>
    </div>
  );
}
