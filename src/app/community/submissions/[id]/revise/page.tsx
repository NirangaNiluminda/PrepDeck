import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getContainer } from '@/composition/container';
import { getSubmission } from '@/modules/community';
import { DIFFICULTIES, QUESTION_TYPES, listQuestionFacets } from '@/modules/questions';
import { SubmissionForm } from '../../../../_components/submission-form';
import { resubmitQuestionAction } from '../../../../actions/community';
import { contentToFormValues, flattenTopics } from '../../../../_lib/question-form';
import { getViewer } from '../../../../_lib/viewer';

export const metadata: Metadata = { title: 'Revise submission' };

export default async function ReviseSubmissionPage(props: PageProps<'/community/submissions/[id]/revise'>) {
  const { id } = await props.params;
  const viewer = await getViewer();
  if (!viewer) notFound();

  const container = await getContainer();
  const submission = await getSubmission({ id, viewerId: viewer.userId, viewerIsAdmin: viewer.role === 'admin' }, container);
  if (!submission.ok || submission.value.status !== 'changes-requested') notFound();

  const facets = await listQuestionFacets({ viewerIsAdmin: false }, container);
  const latestNote = submission.value.history.at(-1)?.note;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <h1 className="text-xl font-semibold tracking-tight">Revise submission</h1>
      {latestNote && (
        <p className="mt-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          Moderator note: {latestNote}
        </p>
      )}
      <div className="mt-8">
        <SubmissionForm
          action={resubmitQuestionAction.bind(null, id)}
          initial={contentToFormValues(submission.value.content)}
          types={QUESTION_TYPES}
          difficulties={DIFFICULTIES}
          topics={flattenTopics(facets.topics)}
          submitLabel="Resubmit for review"
          cancelHref="/community/submissions"
        />
      </div>
    </div>
  );
}
