'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getContainer, getSession } from '@/composition/container';
import { archiveStudyPack, createStudyPack, recordAttempt } from '@/modules/practice';
import { writeLimitError } from '../_lib/write-guard';

export interface RecordAttemptPayload {
  readonly questionId: string;
  readonly rating: string;
  readonly timeTakenMs: number;
  readonly correct?: boolean;
}

// A server action, reachable by direct POST — identity comes from the
// session, never the payload. The client fires this without blocking the UI
// (see PracticeSession), so a thrown error here surfaces as a banner rather
// than a stalled "Saving..." state.
export async function recordAttemptAction(payload: RecordAttemptPayload): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Sign in to record an attempt');

  const limited = await writeLimitError('attempt', session.userId);
  if (limited) throw new Error(limited);

  const result = await recordAttempt(
    {
      userId: session.userId,
      questionId: payload.questionId,
      rating: payload.rating,
      timeTakenMs: payload.timeTakenMs,
      correct: payload.correct,
    },
    await getContainer(),
  );
  if (!result.ok) throw new Error(result.error.message);

  // No revalidatePath here. In a server action it re-renders the *current*
  // route too, so the practice page re-fetched its queue after every rating:
  // the rated card dropped out, the list shifted under PracticeSession's index
  // and the next card was skipped. /progress and the browse hero render fresh
  // on every visit anyway (dynamic pages, no client cache by default).
}

export interface StudyPackFormState {
  readonly error?: string;
}

/** On success, opens the pack's study list: the questions to read, each with its answer in place. */
export async function createStudyPackAction(_previous: StudyPackFormState, formData: FormData): Promise<StudyPackFormState> {
  const session = await getSession();
  if (!session) return { error: 'Sign in to create a study pack.' };
  const limited = await writeLimitError('study-pack', session.userId);
  if (limited) return { error: limited };

  const strings = (name: string) => formData.getAll(name).filter((v): v is string => typeof v === 'string' && v !== '');
  const name = formData.get('name');

  const result = await createStudyPack(
    {
      userId: session.userId,
      name: typeof name === 'string' ? name : '',
      topicPaths: strings('topicPaths'),
      difficulties: strings('difficulties'),
    },
    await getContainer(),
  );
  if (!result.ok) return { error: result.error.message };

  redirect(`/practice/packs/${result.value.id}`);
}

/**
 * Bound per pack (`archiveStudyPackAction.bind(null, packId)`) rather than
 * read from a hidden field — the same one-reference-per-form shape the
 * revision and report lists needed under this Next.js version.
 */
export async function archiveStudyPackAction(packId: string): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Sign in to manage study packs');
  const limited = await writeLimitError('study-pack', session.userId);
  if (limited) throw new Error(limited);

  const result = await archiveStudyPack({ userId: session.userId, packId }, await getContainer());
  if (!result.ok) throw new Error(result.error.message);
  // Called from the practice hub, which should drop the card straight away.
  revalidatePath('/practice');
}
