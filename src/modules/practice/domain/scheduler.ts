import type { Rating } from './rating';
import type { ReviewScheduler, ReviewState } from '../ports/review-scheduler';

/**
 * SM-2, the four-button variant most spaced-repetition tools use (Anki's
 * default algorithm is a close relative). A pure function: same inputs,
 * same output, no clock or database read inside it. That is what makes it
 * testable in milliseconds and swappable later without touching ReviewCard.
 *
 * `interval` doubles as the card's stage: 0 is new, 1 is "reviewed once",
 * anything higher is an established card growing by `easeFactor`. Not
 * tracking a separate "reps" field is deliberate — it would duplicate what
 * `interval` already tells you, and ReviewCard's persisted shape stays
 * exactly the four fields PROJECT_PLAN.md specifies.
 */

export const EASE_DEFAULT = 2.5;
export const EASE_MIN = 1.3;

const EASE_DELTA: Record<Rating, number> = { again: -0.2, hard: -0.15, good: 0, easy: 0.15 };

const clampEase = (ease: number): number => Math.max(EASE_MIN, ease);

function nextInterval(current: number, rating: Rating, easeFactor: number): number {
  if (rating === 'again') return 1;

  // A brand new or once-reviewed card follows fixed learning steps rather
  // than the ease-factor formula: multiplying a tiny interval by ease barely
  // moves it, and fixed steps are what makes early reviews feel deliberate.
  if (current === 0) return rating === 'hard' ? 1 : rating === 'easy' ? 4 : 1;
  if (current === 1) return rating === 'hard' ? 3 : rating === 'easy' ? 8 : 6;

  const multiplier = rating === 'hard' ? 1.2 : rating === 'easy' ? easeFactor * 1.3 : easeFactor;
  return Math.round(current * multiplier);
}

export const sm2Scheduler: ReviewScheduler = {
  next(state: ReviewState, rating: Rating): ReviewState {
    const easeFactor = clampEase(state.easeFactor + EASE_DELTA[rating]);
    const interval = nextInterval(state.interval, rating, easeFactor);
    // A lapse is forgetting a card that had already graduated past the
    // learning steps (interval > 1) — not a hesitant first or second review.
    const lapses = rating === 'again' && state.interval > 1 ? state.lapses + 1 : state.lapses;

    return { interval, easeFactor, lapses };
  },
};

export const NEW_REVIEW_STATE: ReviewState = { interval: 0, easeFactor: EASE_DEFAULT, lapses: 0 };
