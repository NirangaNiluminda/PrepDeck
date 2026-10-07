'use server';

import { revalidatePath } from 'next/cache';
import { getContainer, getSession } from '@/composition/container';
import { recordAttempt } from '@/modules/practice';
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

  // Cheap and correct beats precise: due count and mastery move with every
  // attempt, and a practice session is not frequent enough for this to matter.
  revalidatePath('/progress');
}
