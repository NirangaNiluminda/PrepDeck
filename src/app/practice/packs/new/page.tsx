import type { Metadata } from 'next';
import Link from 'next/link';
import { getContainer } from '@/composition/container';
import { listQuestionFacets } from '@/modules/questions';
import { SignInPrompt } from '../../../_components/practice-states';
import { StudyPackForm } from '../../../_components/study-pack-form';
import { getViewer } from '../../../_lib/viewer';

export const metadata: Metadata = { title: 'New study pack' };

export default async function NewStudyPackPage() {
  const viewer = await getViewer();
  if (!viewer) return <SignInPrompt />;

  // Published only: the counts shown here are what the pack will actually hold.
  const facets = await listQuestionFacets({ viewerIsAdmin: false }, await getContainer());

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <Link
        href="/practice"
        className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-sm font-semibold text-zinc-600 shadow-sm ring-1 ring-inset ring-line hover:text-brand-700 dark:text-zinc-300 dark:hover:text-brand-300"
      >
        ← All practice
      </Link>
      <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">📦 New study pack</h1>
      <p className="mt-1 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
        A pack is a set of topics you work through over several sessions. Stop whenever you like: every card you rate is
        saved, and the pack picks up from the next one.
      </p>
      <div className="mt-6">
        <StudyPackForm topics={facets.topics} />
      </div>
    </div>
  );
}
