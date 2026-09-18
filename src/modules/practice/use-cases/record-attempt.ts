import type { Clock, IdGenerator } from '@/shared/ports';
import { type Result, ok, err, validationError } from '@/shared/result';
import { createAttempt } from '../domain/attempt';
import { ReviewCard } from '../domain/review-card';
import type { AttemptRepository } from '../ports/attempt-repository';
import type { ReviewCardRepository } from '../ports/review-card-repository';
import type { ReviewScheduler } from '../ports/review-scheduler';

export interface RecordAttemptInput {
  readonly userId: string;
  readonly questionId: string;
  readonly rating: string;
  readonly correct?: boolean;
  readonly timeTakenMs: number;
  /** Set when this attempt happened inside a timed exam. The exams module never calls this directly — see its own module comment. */
  readonly examSessionId?: string;
}

export interface RecordAttemptResult {
  readonly interval: number;
  readonly dueDate: string;
}

export interface RecordAttemptDeps {
  readonly reviewCards: ReviewCardRepository;
  readonly attempts: AttemptRepository;
  readonly scheduler: ReviewScheduler;
  readonly clock: Clock;
  readonly ids: IdGenerator;
}

/**
 * The one place a rating turns into a rescheduled card and a logged attempt.
 * Trusts `questionId` rather than checking it against the questions module —
 * an extra round trip on every card of a 100-card session would be a bad
 * trade for a check that only matters if a client sends a fabricated id.
 */
export async function recordAttempt(
  input: RecordAttemptInput,
  deps: RecordAttemptDeps,
): Promise<Result<RecordAttemptResult>> {
  if (!input.userId) return err(validationError('Sign in to record an attempt'));

  const now = deps.clock.now();
  const existing = await deps.reviewCards.findByUserAndQuestion(input.userId, input.questionId);
  const card = existing ?? ReviewCard.createNew(input.userId, input.questionId, now);

  const attempt = createAttempt({
    id: deps.ids.next(),
    userId: input.userId,
    questionId: input.questionId,
    rating: input.rating,
    correct: input.correct,
    timeTakenMs: input.timeTakenMs,
    examSessionId: input.examSessionId,
    now,
  });
  if (!attempt.ok) return attempt;

  const reviewed = card.review(attempt.value.rating, now, deps.scheduler);

  await Promise.all([deps.reviewCards.save(reviewed), deps.attempts.save(attempt.value)]);

  return ok({ interval: reviewed.interval, dueDate: reviewed.dueDate.toISOString() });
}
