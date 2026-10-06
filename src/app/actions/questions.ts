'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getContainer, getSession } from '@/composition/container';
import {
  archiveQuestion,
  createQuestion,
  publishQuestion,
  restoreQuestion,
  revertQuestion,
  updateQuestion,
} from '@/modules/questions';
import { type QuestionFormState, readQuestionForm, toQuestionContent } from '../_lib/question-form';

// Server actions can be called with a direct POST, bypassing the UI that hides
// them. Each one reads identity from the session and passes the role to a use
// case that enforces it; nothing here trusts the form for who the caller is.

export async function createQuestionAction(
  _previous: QuestionFormState,
  formData: FormData,
): Promise<QuestionFormState> {
  const values = readQuestionForm(formData);
  const session = await getSession();
  if (session?.role !== 'admin') return { error: 'Only admins can add questions.', values };

  const content = toQuestionContent(values);
  if (!content.ok) return { error: content.error.message, values };

  const result = await createQuestion({ ...content.value, authorId: session.userId }, await getContainer());
  if (!result.ok) return { error: result.error.message, values };

  revalidatePath('/', 'layout');
  redirect(`/questions/${result.value.id}`);
}

export async function updateQuestionAction(
  id: string,
  _previous: QuestionFormState,
  formData: FormData,
): Promise<QuestionFormState> {
  const values = readQuestionForm(formData);
  const session = await getSession();
  if (!session) return { error: 'Sign in to edit questions.', values };

  const content = toQuestionContent(values);
  if (!content.ok) return { error: content.error.message, values };

  const result = await updateQuestion(
    { ...content.value, id, editorId: session.userId, editorIsAdmin: session.role === 'admin' },
    await getContainer(),
  );
  if (!result.ok) return { error: result.error.message, values };

  revalidatePath('/', 'layout');
  redirect(`/questions/${id}`);
}

export async function publishQuestionAction(formData: FormData): Promise<void> {
  const { session, id } = await moderationRequest(formData);
  const result = await publishQuestion(
    { id, moderatorId: session.userId, moderatorIsAdmin: session.role === 'admin' },
    await getContainer(),
  );
  if (!result.ok) throw new Error(result.error.message);
  revalidatePath('/', 'layout');
}

export async function archiveQuestionAction(formData: FormData): Promise<void> {
  const { session, id } = await moderationRequest(formData);
  const result = await archiveQuestion({ id, moderatorIsAdmin: session.role === 'admin' }, await getContainer());
  if (!result.ok) throw new Error(result.error.message);
  revalidatePath('/', 'layout');
}

export async function restoreQuestionAction(formData: FormData): Promise<void> {
  const { session, id } = await moderationRequest(formData);
  const result = await restoreQuestion({ id, moderatorIsAdmin: session.role === 'admin' }, await getContainer());
  if (!result.ok) throw new Error(result.error.message);
  revalidatePath('/', 'layout');
}

/**
 * Takes `questionId`/`revisionId` as bound arguments
 * (`revertQuestionAction.bind(null, questionId, revisionId)`) rather than
 * reading them from hidden form fields. RevisionHistory renders one
 * `<form>` per revision in a list — every form pointing at the same
 * unbound action reference broke client hydration for the whole list
 * silently (no console error) under this Next.js version, the same class of
 * bug `resolveReportAction` hit with two buttons sharing one action. A
 * distinct bound reference per form is what actually works.
 */
export async function revertQuestionAction(questionId: string, revisionId: string): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Sign in to moderate questions');

  const result = await revertQuestion(
    { questionId, revisionId, editorId: session.userId, editorIsAdmin: session.role === 'admin' },
    await getContainer(),
  );
  if (!result.ok) throw new Error(result.error.message);
  revalidatePath('/', 'layout');
}

async function moderationRequest(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error('Sign in to moderate questions');
  const id = formData.get('id');
  if (typeof id !== 'string' || !id) throw new Error('Missing question id');
  return { session, id };
}
