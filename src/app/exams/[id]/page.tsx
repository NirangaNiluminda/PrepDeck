import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getContainer } from '@/composition/container';
import { getExamResults, getExamRunnerView } from '@/modules/exams';
import { ExamResults } from '../../_components/exam-results';
import { ExamReview } from '../../_components/exam-review';
import { ExamRunner } from '../../_components/exam-runner';
import { getViewer } from '../../_lib/viewer';

export const metadata: Metadata = { title: 'Exam' };

/**
 * One URL, three phases. Rather than separate /run, /review and /results
 * routes that could go stale, this reads the session's actual status and
 * renders whichever view is true right now — a reload always shows the
 * right thing, including the case where getExamRunnerView itself just
 * auto-submitted a session whose time had already run out.
 */
export default async function ExamPage(props: PageProps<'/exams/[id]'>) {
  const { id } = await props.params;
  const viewer = await getViewer();
  if (!viewer) notFound();

  const container = await getContainer();

  const runner = await getExamRunnerView({ examSessionId: id, userId: viewer.userId }, container);
  if (runner.ok) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6">
        <ExamRunner examSessionId={id} deadline={runner.value.deadline} questions={runner.value.questions} />
      </div>
    );
  }
  if (runner.error.code === 'NOT_FOUND') notFound();

  const results = await getExamResults({ examSessionId: id, userId: viewer.userId }, container);
  if (!results.ok) notFound();

  if (results.value.status === 'awaiting-review') {
    const pending = results.value.questions.filter((q) => q.type !== 'mcq' && q.correct === undefined);
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6">
        <ExamReview examSessionId={id} pending={pending} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <ExamResults view={results.value} />
    </div>
  );
}
