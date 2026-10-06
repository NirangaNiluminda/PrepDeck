'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getContainer, getSession } from '@/composition/container';
import { findSimilarQuestions, type SimilarQuestion } from '@/modules/questions';
import {
  castVote,
  moderateSubmission,
  reportQuestion,
  resolveReport,
  resubmitQuestion,
  submitQuestion,
  type ModerationDecision,
} from '@/modules/community';
import { readQuestionForm, toQuestionContent, type QuestionFormState } from '../_lib/question-form';

export async function submitQuestionAction(
  _previous: QuestionFormState,
  formData: FormData,
): Promise<QuestionFormState> {
  const values = readQuestionForm(formData);
  const session = await getSession();
  if (!session) return { error: 'Sign in to submit a question.', values };

  const content = toQuestionContent(values);
  if (!content.ok) return { error: content.error.message, values };

  const result = await submitQuestion({ authorId: session.userId, content: content.value }, await getContainer());
  if (!result.ok) return { error: result.error.message, values };

  revalidatePath('/community', 'layout');
  redirect('/community/submissions');
}

export async function resubmitQuestionAction(
  submissionId: string,
  _previous: QuestionFormState,
  formData: FormData,
): Promise<QuestionFormState> {
  const values = readQuestionForm(formData);
  const session = await getSession();
  if (!session) return { error: 'Sign in to revise a submission.', values };

  const content = toQuestionContent(values);
  if (!content.ok) return { error: content.error.message, values };

  const result = await resubmitQuestion(
    { submissionId, authorId: session.userId, content: content.value },
    await getContainer(),
  );
  if (!result.ok) return { error: result.error.message, values };

  revalidatePath('/community', 'layout');
  redirect('/community/submissions');
}

/** Live "similar to…" lookup — called directly from the submit form, not via a `<form action>`. Safe unauthenticated: no more revealing than search. */
export async function checkSimilarQuestionsAction(stem: string): Promise<SimilarQuestion[]> {
  return findSimilarQuestions({ stem }, await getContainer());
}

async function moderationDecisionRequest(formData: FormData, decision: ModerationDecision): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Sign in to moderate submissions');
  const submissionId = formData.get('id');
  if (typeof submissionId !== 'string' || !submissionId) throw new Error('Missing submission id');
  const note = formData.get('note');

  const result = await moderateSubmission(
    {
      submissionId,
      decision,
      note: typeof note === 'string' ? note : undefined,
      reviewerId: session.userId,
      reviewerIsAdmin: session.role === 'admin',
    },
    await getContainer(),
  );
  if (!result.ok) throw new Error(result.error.message);
  revalidatePath('/community/moderate', 'layout');
}

export async function approveSubmissionAction(formData: FormData): Promise<void> {
  await moderationDecisionRequest(formData, 'approved');
}

export async function rejectSubmissionAction(formData: FormData): Promise<void> {
  await moderationDecisionRequest(formData, 'rejected');
}

export async function requestChangesAction(formData: FormData): Promise<void> {
  await moderationDecisionRequest(formData, 'changes-requested');
}

export async function castVoteAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Sign in to vote');

  const questionId = formData.get('questionId');
  const directionRaw = formData.get('direction');
  if (typeof questionId !== 'string' || typeof directionRaw !== 'string') {
    throw new Error('Invalid vote request');
  }
  const direction = Number(directionRaw);
  if (direction !== 1 && direction !== -1 && direction !== 0) {
    throw new Error('Invalid vote direction');
  }

  const result = await castVote({ userId: session.userId, questionId, direction }, await getContainer());
  if (!result.ok) throw new Error(result.error.message);
  revalidatePath('/questions/[id]', 'page');
  revalidatePath('/recommended', 'page');
}

export interface ReportFormState {
  readonly error?: string;
  readonly success?: boolean;
}

export async function reportQuestionAction(
  questionId: string,
  _previous: ReportFormState,
  formData: FormData,
): Promise<ReportFormState> {
  const session = await getSession();
  if (!session) return { error: 'Sign in to report a question.' };

  const reason = formData.get('reason');
  const note = formData.get('note');
  if (typeof reason !== 'string') return { error: 'Choose a reason.' };

  const result = await reportQuestion(
    { reporterId: session.userId, questionId, reason, note: typeof note === 'string' ? note : undefined },
    await getContainer(),
  );
  if (!result.ok) return { error: result.error.message };
  return { success: true };
}

/**
 * Takes `outcome` as a bound first argument (`resolveReportAction.bind(null,
 * 'dismissed')`) rather than reading it from FormData set by which button was
 * clicked — two buttons in one form picking the outcome that way produced the
 * wrong result server-side under this Next.js version, so each outcome now
 * gets its own `<form>`, the same shape SubmissionModerationForm settled on.
 */
export async function resolveReportAction(outcome: 'resolved' | 'dismissed', formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Sign in to moderate reports');

  const reportId = formData.get('reportId');
  if (typeof reportId !== 'string' || !reportId) {
    throw new Error('Missing report id');
  }

  const result = await resolveReport(
    { reportId, outcome, resolverId: session.userId, resolverIsAdmin: session.role === 'admin' },
    await getContainer(),
  );
  if (!result.ok) throw new Error(result.error.message);
  revalidatePath('/community/moderate', 'layout');
}
