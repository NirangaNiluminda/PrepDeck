import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getContainer } from '@/composition/container';
import { DIFFICULTIES, QUESTION_TYPES, listQuestionFacets } from '@/modules/questions';
import { QuestionForm } from '../../../_components/question-form';
import { createQuestionAction } from '../../../actions/questions';
import { EMPTY_FORM, flattenTopics } from '../../../_lib/question-form';
import { getViewer } from '../../../_lib/viewer';

export const metadata: Metadata = { title: 'New question' };

export default async function NewQuestionPage() {
  const viewer = await getViewer();
  // 404 rather than 403, so the admin area isn't advertised.
  if (viewer?.role !== 'admin') notFound();

  const facets = await listQuestionFacets({ viewerIsAdmin: true }, await getContainer());

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <h1 className="text-xl font-semibold tracking-tight">New question</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Saved as a draft. Publish it from the question page when it&apos;s ready.
      </p>
      <div className="mt-8">
        <QuestionForm
          action={createQuestionAction}
          initial={EMPTY_FORM}
          types={QUESTION_TYPES}
          difficulties={DIFFICULTIES}
          topics={flattenTopics(facets.topics)}
          submitLabel="Create draft"
          cancelHref="/"
        />
      </div>
    </div>
  );
}
