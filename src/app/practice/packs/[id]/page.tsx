import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getContainer } from '@/composition/container';
import { getStudyPackQuestions } from '@/modules/practice';
import { TopicChip } from '../../../_components/badges';
import { PRIMARY_BUTTON, SignInPrompt, StateCard } from '../../../_components/practice-states';
import { StudyList } from '../../../_components/study-list';
import { DIFFICULTY_LABELS } from '../../../_lib/labels';
import { getViewer } from '../../../_lib/viewer';

export const metadata: Metadata = { title: 'Study pack' };

export default async function StudyPackPage(props: PageProps<'/practice/packs/[id]'>) {
  const { id } = await props.params;
  const viewer = await getViewer();
  if (!viewer) return <SignInPrompt />;

  const result = await getStudyPackQuestions({ userId: viewer.userId, packId: id, now: new Date() }, await getContainer());
  // Someone else's pack and a missing one look the same, on purpose.
  if (!result.ok) notFound();
  const { pack, items } = result.value;

  if (pack.status === 'archived') {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-12">
        <StateCard emoji="🗃️" title="This pack is archived">
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Everything you learned from it is still scheduled in your daily review.
          </p>
          <Link href="/practice" className={`mt-6 ${PRIMARY_BUTTON}`}>
            Back to practice
          </Link>
        </StateCard>
      </div>
    );
  }

  const { total, started, due, mastery } = pack.progress;
  const percent = total ? Math.round((started / total) * 100) : 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <Link
        href="/practice"
        className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-sm font-semibold text-zinc-600 shadow-sm ring-1 ring-inset ring-line hover:text-brand-700 dark:text-zinc-300 dark:hover:text-brand-300"
      >
        ← All practice
      </Link>

      <header className="mt-4 rounded-3xl border border-line bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">📖 {pack.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {pack.topicPaths.map((path) => (
                <TopicChip key={path} path={path} />
              ))}
              {pack.difficulties.length > 0 && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  · {pack.difficulties.map((d) => DIFFICULTY_LABELS[d] ?? d).join(', ')}
                </span>
              )}
            </div>
          </div>
          <Link
            href={`/practice/session?pack=${pack.id}`}
            title="Test yourself one card at a time, with spaced repetition"
            className="shrink-0 rounded-full bg-gradient-to-r from-brand-600 to-fuchsia-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-brand-600/25 transition hover:-translate-y-0.5"
          >
            🧠 Flashcards{due > 0 ? ` · ${due} due` : ''}
          </Link>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-semibold text-zinc-700 dark:text-zinc-200">
              {started} of {total} studied
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {mastery === undefined ? 'Mark questions as you go to track mastery' : `🎯 ${mastery}% mastery`}
            </span>
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
      </header>

      <div className="mt-2">
        {/* StudyList is a Client Component and never imports '@/modules/*';
            StudyPackItem is structurally compatible with its local type. */}
        <StudyList items={items} />
      </div>
    </div>
  );
}
