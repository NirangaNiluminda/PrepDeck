import type { Metadata } from 'next';
import Link from 'next/link';
import { getContainer } from '@/composition/container';
import { listExamHistory } from '@/modules/exams';
import { EXAM_STATUS_LABELS } from '../_lib/labels';
import { getViewer } from '../_lib/viewer';

export const metadata: Metadata = { title: 'Exams' };

export default async function ExamsPage() {
  const viewer = await getViewer();
  if (!viewer) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-16 text-center">
        <h1 className="text-lg font-semibold">Sign in to see your exams</h1>
        <Link href="/" className="mt-6 inline-block text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
          Browse questions instead
        </Link>
      </div>
    );
  }

  const history = await listExamHistory({ userId: viewer.userId }, await getContainer());

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Exams</h1>
        <Link href="/exams/new" className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-500">
          New exam
        </Link>
      </div>

      {history.length === 0 ? (
        <p className="mt-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
          No exams yet. Start one to see how you&apos;d do under timed conditions.
        </p>
      ) : (
        <ol className="mt-6 divide-y divide-zinc-200 dark:divide-zinc-800">
          {history.map((exam) => (
            <li key={exam.id}>
              <Link
                href={`/exams/${exam.id}`}
                className="flex items-center justify-between gap-4 py-3 hover:text-brand-600 dark:hover:text-brand-400"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {new Date(exam.startedAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {exam.questionCount} questions · {EXAM_STATUS_LABELS[exam.status] ?? exam.status}
                  </p>
                </div>
                <p className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                  {exam.status === 'in-progress' ? '—' : `${exam.score.percent}%`}
                </p>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
