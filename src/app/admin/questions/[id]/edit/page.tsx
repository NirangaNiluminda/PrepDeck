import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getContainer } from '@/composition/container';
import { DIFFICULTIES, QUESTION_TYPES, getQuestion, listQuestionFacets, listQuestionRevisions } from '@/modules/questions';
import { QuestionForm } from '../../../../_components/question-form';
import { RevisionHistory, toRevisionEntry } from '../../../../_components/revision-history';
import { updateQuestionAction } from '../../../../actions/questions';
import { flattenTopics, toFormValues } from '../../../../_lib/question-form';
import { getViewer } from '../../../../_lib/viewer';

export const metadata: Metadata = { title: 'Edit question' };

export default async function EditQuestionPage(props: PageProps<'/admin/questions/[id]/edit'>) {
  const { id } = await props.params;
  const viewer = await getViewer();
  if (viewer?.role !== 'admin') notFound();

  const container = await getContainer();
  const [result, facets, revisions] = await Promise.all([
    getQuestion({ id, viewerId: viewer.userId, viewerIsAdmin: true, revealAnswer: true }, container),
    listQuestionFacets({ viewerIsAdmin: true }, container),
    listQuestionRevisions({ questionId: id }, container),
  ]);
  if (!result.ok) notFound();
  const question = result.value;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <h1 className="text-xl font-semibold tracking-tight">Edit question</h1>

      {question.slug && (
        <p className="mt-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          This question was imported from{' '}
          <code className="font-mono">content/questions/…/{question.slug}.md</code>. Changes made here are
          overwritten the next time that file is imported, so edit the file instead if you want them to last.
        </p>
      )}

      <div className="mt-8">
        <QuestionForm
          action={updateQuestionAction.bind(null, id)}
          initial={toFormValues(question)}
          types={QUESTION_TYPES}
          difficulties={DIFFICULTIES}
          topics={flattenTopics(facets.topics)}
          submitLabel="Save changes"
          cancelHref={`/questions/${id}`}
        />
      </div>

      {revisions.length > 0 && (
        <div className="mt-10 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <RevisionHistory questionId={id} revisions={revisions.map(toRevisionEntry)} />
        </div>
      )}
    </div>
  );
}
