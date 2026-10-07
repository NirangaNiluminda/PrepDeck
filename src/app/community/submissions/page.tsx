import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getContainer } from '@/composition/container';
import { listMySubmissions } from '@/modules/community';
import { InlineMarkdown } from '../../_components/markdown';
import { SubmissionStatusBadge } from '../../_components/badges';
import { getViewer } from '../../_lib/viewer';

export const metadata: Metadata = { title: 'My submissions' };

export default async function MySubmissionsPage() {
  const viewer = await getViewer();
  if (!viewer) notFound();

  const submissions = await listMySubmissions({ authorId: viewer.userId }, await getContainer());

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">My submissions</h1>
        <Link href="/community/submit" className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-500">
          Submit a question
        </Link>
      </div>

      {submissions.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">You haven&apos;t submitted any questions yet.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {submissions.map((s) => {
            const latestNote = s.history.at(-1)?.note;
            return (
              <li key={s.id} className="rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-zinc-900 dark:text-zinc-100">
                    <InlineMarkdown>{s.content.stem}</InlineMarkdown>
                  </p>
                  <SubmissionStatusBadge status={s.status} />
                </div>
                {latestNote && (
                  <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                    Moderator note: <InlineMarkdown>{latestNote}</InlineMarkdown>
                  </p>
                )}
                {s.status === 'approved' && s.questionId && (
                  <Link href={`/questions/${s.questionId}`} className="mt-2 inline-block text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
                    View published question →
                  </Link>
                )}
                {s.status === 'changes-requested' && (
                  <Link href={`/community/submissions/${s.id}/revise`} className="mt-2 inline-block text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
                    Revise and resubmit →
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
