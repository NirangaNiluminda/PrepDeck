import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getContainer } from '@/composition/container';
import { getProgress, getWeakAreas, type TopicMastery } from '@/modules/practice';
import { topicLabel } from '../_lib/labels';
import { getViewer } from '../_lib/viewer';

export const metadata: Metadata = { title: 'Progress' };

export default async function ProgressPage() {
  const viewer = await getViewer();
  if (!viewer) notFound();

  const container = await getContainer();
  const now = new Date();
  const [progress, weakest] = await Promise.all([
    getProgress({ userId: viewer.userId, now }, container),
    getWeakAreas({ userId: viewer.userId }, container),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <h1 className="text-xl font-semibold tracking-tight">Progress</h1>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <Stat label="Day streak" value={progress.streak} />
        <Stat label="Cards due" value={progress.cardsDue} />
        <Stat label="Questions reviewed" value={progress.totalReviewed} />
      </div>

      <div className="mt-6">
        <Link
          href={progress.cardsDue > 0 ? "/practice/session" : "/practice"}
          className="inline-block rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-500"
        >
          {progress.cardsDue > 0 ? `Practice ${progress.cardsDue} due` : 'Practice'}
        </Link>
      </div>

      {weakest.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Weakest topics
          </h2>
          <ul className="space-y-2">
            {weakest.map((topic) => (
              <li key={topic.path} className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2.5 dark:border-zinc-800">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{topicLabel(topic.slug)}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{topic.reviewedCount} reviewed</p>
                </div>
                <div className="flex items-center gap-3">
                  <MasteryBar mastery={topic.mastery ?? 0} />
                  <Link
                    href={`/practice/session?topic=${encodeURIComponent(topic.path)}`}
                    className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
                  >
                    Practice this
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Mastery by topic
        </h2>
        {progress.topics.length > 0 ? (
          <TopicMasteryTree nodes={progress.topics} />
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No questions reviewed yet.{' '}
            <Link href="/practice" className="text-brand-600 hover:underline dark:text-brand-400">
              Start practising
            </Link>{' '}
            to see mastery build up here.
          </p>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800">
      <p className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{value}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  );
}

function MasteryBar({ mastery }: { mastery: number }) {
  const tone = mastery >= 70 ? 'bg-emerald-500' : mastery >= 40 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div className={`h-full ${tone}`} style={{ width: `${mastery}%` }} />
      </div>
      <span className="w-8 text-right text-xs tabular-nums text-zinc-500 dark:text-zinc-400">{mastery}%</span>
    </div>
  );
}

function TopicMasteryTree({ nodes, depth = 0 }: { nodes: readonly TopicMastery[]; depth?: number }) {
  return (
    <ul className={depth > 0 ? 'mt-1.5 ml-4 space-y-1.5 border-l border-zinc-200 pl-3 dark:border-zinc-800' : 'space-y-1.5'}>
      {nodes.map((node) => (
        <li key={node.path}>
          <div className="flex items-center justify-between gap-3">
            <Link
              href={`/?topic=${encodeURIComponent(node.path)}`}
              className="truncate text-sm text-zinc-800 hover:text-brand-600 hover:underline dark:text-zinc-200 dark:hover:text-brand-400"
            >
              {topicLabel(node.slug)}
            </Link>
            {node.mastery === undefined ? (
              <span className="text-xs text-zinc-400 dark:text-zinc-600">not reviewed</span>
            ) : (
              <MasteryBar mastery={node.mastery} />
            )}
          </div>
          {node.children.length > 0 && <TopicMasteryTree nodes={node.children} depth={depth + 1} />}
        </li>
      ))}
    </ul>
  );
}
