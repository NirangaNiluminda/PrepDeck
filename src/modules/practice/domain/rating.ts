/** A learner's self-rating of how well they recalled a card, Anki-style. */
export const RATINGS = ['again', 'hard', 'good', 'easy'] as const;
export type Rating = (typeof RATINGS)[number];

export const isRating = (v: unknown): v is Rating =>
  typeof v === 'string' && (RATINGS as readonly string[]).includes(v);
