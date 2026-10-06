import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getContainer } from '@/composition/container';
import { DIFFICULTIES, QUESTION_TYPES, listQuestionFacets } from '@/modules/questions';
import { SubmissionForm } from '../../_components/submission-form';
import { submitQuestionAction } from '../../actions/community';
import { EMPTY_FORM, flattenTopics } from '../../_lib/question-form';
import { getViewer } from '../../_lib/viewer';

export const metadata: Metadata = { title: 'Submit a question' };

export default async function SubmitQuestionPage() {
  const viewer = await getViewer();
  if (!viewer) notFound();

  const facets = await listQuestionFacets({ viewerIsAdmin: false }, await getContainer());

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <h1 className="text-xl font-semibold tracking-tight">Submit a question</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        A moderator reviews every submission before it joins the bank. You&apos;ll see wording that looks similar as you type.
      </p>
      <div className="mt-8">
        <SubmissionForm
          action={submitQuestionAction}
          initial={EMPTY_FORM}
          types={QUESTION_TYPES}
          difficulties={DIFFICULTIES}
          topics={flattenTopics(facets.topics)}
          submitLabel="Submit for review"
          cancelHref="/community"
        />
      </div>
    </div>
  );
}
