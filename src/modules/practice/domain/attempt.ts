import { type Result, ok, err, validationError } from '@/shared/result';
import { type Rating, isRating } from './rating';

/**
 * An immutable log entry — no lifecycle, nothing ever edits one. Progress
 * tracking, weak-area detection and the scheduler all read from the trail of
 * these rather than from any "have I answered this" flag on the question,
 * which breaks the moment a second user exists.
 */
export interface Attempt {
  readonly id: string;
  readonly userId: string;
  readonly questionId: string;
  readonly rating: Rating;
  /** Only meaningful for auto-gradable types (mcq); undefined otherwise. */
  readonly correct?: boolean;
  readonly timeTakenMs: number;
  readonly timestamp: Date;
  /** Set when the attempt happened inside a timed exam, once exams exist. */
  readonly examSessionId?: string;
}

export interface NewAttemptInput {
  readonly id: string;
  readonly userId: string;
  readonly questionId: string;
  readonly rating: string;
  readonly correct?: boolean;
  readonly timeTakenMs: number;
  readonly now: Date;
  readonly examSessionId?: string;
}

export function createAttempt(input: NewAttemptInput): Result<Attempt> {
  if (!input.userId) return err(validationError('An attempt needs a user'));
  if (!input.questionId.trim()) return err(validationError('An attempt needs a question'));
  if (!isRating(input.rating)) return err(validationError(`Unknown rating '${input.rating}'`));
  if (!Number.isFinite(input.timeTakenMs) || input.timeTakenMs < 0) {
    return err(validationError('timeTakenMs must be a non-negative number'));
  }

  return ok({
    id: input.id,
    userId: input.userId,
    questionId: input.questionId,
    rating: input.rating,
    correct: input.correct,
    timeTakenMs: input.timeTakenMs,
    timestamp: input.now,
    examSessionId: input.examSessionId,
  });
}
