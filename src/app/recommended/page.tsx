import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getContainer } from '@/composition/container';
import { getWeakAreas } from '@/modules/practice';
import { recommendQuestions } from '@/modules/community';
import { DifficultyBadge, TopicTrail } from '../_components/badges';
import { InlineMarkdown } from '../_components/markdown';
import { getViewer } from '../_lib/viewer';

export const metadata: Metadata = { title: 'Recommended for you' };

/**
 * Composed here, not inside either module: `community` doesn't depend on
 * `practice` (see the module map in PROJECT_PLAN.md — community only depends
 * on questions), so "highly-voted questions in the user's weak topics" is two
 * calls stitched together at the app layer, the same pattern exams+practice
 * already established (see exams/index.ts's own comment on why).
 */
export default async function RecommendedPage() {
  const viewer = await getViewer();
  if (!viewer) notFound();

  const container = await getContainer();
  const weakTopics = await getWeakAreas({ userId: viewer.userId }, container);
  const recommended = await recommendQuestions({ topicPaths: weakTopics.map((t) => t.path) }, container);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <h1 className="text-xl font-semibold tracking-tight">Recommended for you</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Highly-voted questions in your weakest topics.</p>

      {weakTopics.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
          Review a few more questions in{' '}
          <Link href="/practice" className="text-indigo-600 hover:underline dark:text-indigo-400">
            Practice
          </Link>{' '}
          to surface your weakest topics here.
        </p>
      ) : recommended.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
          No highly-voted questions in your weak topics yet — vote on questions you find useful to help this fill in.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {recommended.map((q) => (
            <li key={q.id} className="rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <Link href={`/questions/${q.id}`} className="text-sm font-medium text-zinc-900 hover:text-indigo-600 dark:text-zinc-100 dark:hover:text-indigo-400">
                <InlineMarkdown>{q.stem}</InlineMarkdown>
              </Link>
              <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                <TopicTrail path={q.topicPath} />
                <DifficultyBadge difficulty={q.difficulty} />
                <span>Score: {q.score}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
