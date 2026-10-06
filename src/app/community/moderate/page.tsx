import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getContainer } from '@/composition/container';
import { listSubmissions, listReports } from '@/modules/community';
import { InlineMarkdown } from '../../_components/markdown';
import { SubmissionModerationForm } from '../../_components/submission-moderation-form';
import { ReportModerationForm } from '../../_components/report-moderation-form';
import { REPORT_REASON_LABELS } from '../../_lib/labels';
import { getViewer } from '../../_lib/viewer';

export const metadata: Metadata = { title: 'Moderate community' };

export default async function ModerateCommunityPage() {
  const viewer = await getViewer();
  // 404 rather than 403, so the moderation queue isn't advertised.
  if (viewer?.role !== 'admin') notFound();

  const container = await getContainer();
  const [submissions, reports] = await Promise.all([
    listSubmissions({ viewerIsAdmin: true }, container),
    listReports({ viewerIsAdmin: true }, container),
  ]);
  const pending = submissions.ok ? submissions.value.items : [];
  const open = reports.ok ? reports.value.items : [];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <h1 className="text-xl font-semibold tracking-tight">Moderate community</h1>

      <section className="mt-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Pending submissions{pending.length > 0 && ` (${pending.length})`}
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Nothing waiting for review.</p>
        ) : (
          <ul className="space-y-4">
            {pending.map((s) => (
              <li key={s.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                <p className="text-sm text-zinc-900 dark:text-zinc-100">
                  <InlineMarkdown>{s.content.stem}</InlineMarkdown>
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  by {s.authorId} · {s.content.topicPath} · {s.content.difficulty}
                </p>
                {s.possibleDuplicates.length > 0 && (
                  <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                    Similar to: {s.possibleDuplicates.map((d) => d.stem).join('; ')}
                  </p>
                )}
                <SubmissionModerationForm submissionId={s.id} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Open reports{open.length > 0 && ` (${open.length})`}
        </h2>
        {open.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No open reports.</p>
        ) : (
          <ul className="space-y-3">
            {open.map((r) => (
              <li key={r.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                <p className="text-sm text-zinc-900 dark:text-zinc-100">
                  <Link href={`/questions/${r.questionId}`} className="text-indigo-600 hover:underline dark:text-indigo-400">
                    View question
                  </Link>{' '}
                  — {REPORT_REASON_LABELS[r.reason] ?? r.reason}
                </p>
                {r.note && <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{r.note}</p>}
                <ReportModerationForm reportId={r.id} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
