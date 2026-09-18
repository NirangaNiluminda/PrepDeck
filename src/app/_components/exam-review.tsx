'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { selfGradeExamAnswerAction } from '../actions/exams';
import { AnswerBody } from './answer-body';
import { DifficultyBadge, TopicTrail } from './badges';
import { Markdown } from './markdown';

// A local echo of the pending questions' shape — see exam-runner.tsx's
// comment on why: this file is 'use client' and never imports '@/modules/*'.
export interface PendingQuestion {
  readonly questionId: string;
  readonly stem: string;
  readonly difficulty: string;
  readonly topicPath: string;
  readonly answer: {
    readonly modelAnswer: string;
    readonly keyPoints: readonly string[];
    readonly explanation?: string;
    readonly references?: readonly string[];
  };
}

export function ExamReview({ examSessionId, pending }: { readonly examSessionId: string; readonly pending: readonly PendingQuestion[] }) {
  const router = useRouter();
  const [gradingId, setGradingId] = useState<string | null>(null);

  const grade = async (questionId: string, correct: boolean) => {
    setGradingId(questionId);
    await selfGradeExamAnswerAction({ examSessionId, questionId, correct });
    router.refresh(); // this route re-renders as results once every question here is graded
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Grade your own answers</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {pending.length} question{pending.length === 1 ? '' : 's'} left. Compare what you actually wrote or said
          against the model answer, honestly — this is what schedules the question for review later, the same as a
          practice rating.
        </p>
      </div>

      {pending.map((q) => (
        <div key={q.questionId} className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            <TopicTrail path={q.topicPath} />
          </p>
          <div className="mt-2">
            <DifficultyBadge difficulty={q.difficulty} />
          </div>
          <div className="mt-3 text-base font-medium text-zinc-900 dark:text-zinc-50">
            <Markdown>{q.stem}</Markdown>
          </div>
          <div className="mt-6">
            <AnswerBody answer={q.answer} />
          </div>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              disabled={gradingId === q.questionId}
              onClick={() => grade(q.questionId, true)}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              I got this right
            </button>
            <button
              type="button"
              disabled={gradingId === q.questionId}
              onClick={() => grade(q.questionId, false)}
              className="rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-500 disabled:opacity-60"
            >
              I got this wrong
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
