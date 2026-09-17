import type { Rating } from '../domain/rating';

/** Just enough of a ReviewCard for a scheduler to compute the next one. No I/O. */
export interface ReviewState {
  readonly interval: number;
  readonly easeFactor: number;
  readonly lapses: number;
}

/**
 * A Strategy so the algorithm can be swapped (FSRS, say) without touching
 * ReviewCard or any use case. `sm2Scheduler` in `domain/scheduler.ts` is the
 * only implementation for now.
 */
export interface ReviewScheduler {
  next(state: ReviewState, rating: Rating, now: Date): ReviewState;
}
