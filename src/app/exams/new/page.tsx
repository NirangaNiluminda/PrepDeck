import type { Metadata } from 'next';
import Link from 'next/link';
import { getContainer } from '@/composition/container';
import { listQuestionFacets } from '@/modules/questions';
import { ExamBuilderForm } from '../../_components/exam-builder-form';
import { getViewer } from '../../_lib/viewer';

export const metadata: Metadata = { title: 'New exam' };

export default async function NewExamPage() {
  const viewer = await getViewer();
  if (!viewer) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-16 text-center">
        <h1 className="text-lg font-semibold">Sign in to take an exam</h1>
        <Link href="/" className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
          Browse questions instead
        </Link>
      </div>
    );
  }

  // Only published material can be drawn into an exam — the same set every
  // learner could otherwise study, so the topic counts shown here match.
  const facets = await listQuestionFacets({ viewerIsAdmin: false }, await getContainer());

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <h1 className="text-xl font-semibold tracking-tight">New exam</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Questions are drawn at random from what matches. Answers are withheld until you submit.
      </p>
      <div className="mt-8">
        <ExamBuilderForm topics={facets.topics} />
      </div>
    </div>
  );
}
