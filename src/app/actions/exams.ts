'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getContainer, type Container } from '@/composition/container';
import { getSession } from '@/modules/auth';
import {
  recordExamAnswer,
  selfGradeExamAnswer,
  startExam,
  submitExam,
  toggleExamFlag,
  type ExamResultsView,
} from '@/modules/exams';
import { recordAttempt } from '@/modules/practice';
import { computeMcqTimings } from '../_lib/exam-timing';

// Server actions are reachable by a direct POST, not just this app's UI —
// identity always comes from the session, never a payload field.
async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error('Sign in to take an exam');
  return session;
}

export interface ExamBuilderState {
  readonly error?: string;
}

export async function startExamAction(_previous: ExamBuilderState, formData: FormData): Promise<ExamBuilderState> {
  const session = await requireSession();

  const strings = (name: string) => formData.getAll(name).filter((v): v is string => typeof v === 'string' && v !== '');
  const count = Number(formData.get('count'));
  const durationMinutes = Number(formData.get('durationMinutes'));
  if (!Number.isFinite(count) || !Number.isFinite(durationMinutes)) {
    return { error: 'Count and duration must be numbers.' };
  }

  const topicPaths = strings('topicPaths');
  const difficulties = strings('difficulties');
  const types = strings('types');

  const result = await startExam(
    {
      userId: session.userId,
      topicPaths: topicPaths.length ? topicPaths : undefined,
      difficulties: difficulties.length ? difficulties : undefined,
      types: types.length ? types : undefined,
      count,
      durationMinutes,
    },
    await getContainer(),
  );
  if (!result.ok) return { error: result.error.message };

  redirect(`/exams/${result.value.id}`);
}

export async function recordExamAnswerAction(input: {
  readonly examSessionId: string;
  readonly questionId: string;
  readonly selectedOptionId: string;
}): Promise<void> {
  const session = await requireSession();
  const result = await recordExamAnswer({ ...input, userId: session.userId }, await getContainer());
  if (!result.ok) throw new Error(result.error.message);
}

export async function toggleExamFlagAction(input: {
  readonly examSessionId: string;
  readonly questionId: string;
  readonly flagged: boolean;
}): Promise<void> {
  const session = await requireSession();
  const result = await toggleExamFlag({ ...input, userId: session.userId }, await getContainer());
  if (!result.ok) throw new Error(result.error.message);
}

/**
 * Ends the timed portion, then logs every MCQ answer as a practice attempt —
 * the cross-module glue described in the exams module's own index.ts comment.
 * `correct` maps to `good`/`again` the same way a flashcard rating would;
 * skipping a question scores as wrong (computeScore already treats it that
 * way) and schedules the same way, on the reasoning that not answering is
 * the same signal as answering wrong, just with no real "time taken" to log.
 */
export async function submitExamAction(examSessionId: string): Promise<void> {
  const session = await requireSession();
  const container = await getContainer();

  const result = await submitExam({ examSessionId, userId: session.userId }, container);
  if (!result.ok) throw new Error(result.error.message);

  await recordMcqAttempts(result.value, session.userId, container);
  revalidatePath('/progress');
}

/** The learner's own judgment against the model answer, for a question that can't be auto-scored. */
export async function selfGradeExamAnswerAction(input: {
  readonly examSessionId: string;
  readonly questionId: string;
  readonly correct: boolean;
}): Promise<void> {
  const session = await requireSession();
  const container = await getContainer();

  const result = await selfGradeExamAnswer({ ...input, userId: session.userId }, container);
  if (!result.ok) throw new Error(result.error.message);

  await recordAttempt(
    {
      userId: session.userId,
      questionId: input.questionId,
      rating: input.correct ? 'good' : 'again',
      correct: input.correct,
      timeTakenMs: 0, // the review phase is untimed; there is no real measurement to log
      examSessionId: input.examSessionId,
    },
    container,
  );
  revalidatePath('/progress');
}

async function recordMcqAttempts(view: ExamResultsView, userId: string, container: Container): Promise<void> {
  const mcqs = view.questions.filter((q) => q.type === 'mcq');
  const timings = computeMcqTimings(view.startedAt, mcqs);

  for (const q of mcqs) {
    await recordAttempt(
      {
        userId,
        questionId: q.questionId,
        rating: q.correct ? 'good' : 'again',
        correct: q.correct,
        // Unanswered — skipped, never reached the timer — gets 0, the same
        // honest placeholder the review phase's self-grades use.
        timeTakenMs: timings.get(q.questionId) ?? 0,
        examSessionId: view.id,
      },
      container,
    );
  }
}
