import type { ReviewCard } from '../domain/review-card';

/** The subset of a card's schedule state the mastery calculation needs. */
export interface MasteryInput {
  readonly questionId: string;
  readonly interval: number;
  readonly easeFactor: number;
}

export interface ReviewCardRepository {
  findByUserAndQuestion(userId: string, questionId: string): Promise<ReviewCard | null>;
  /** Due first, oldest due date first. */
  listDue(userId: string, now: Date, limit: number): Promise<ReviewCard[]>;
  countDue(userId: string, now: Date): Promise<number>;
  /** How many never-reviewed-before cards this user was shown from `since` onward — the daily new-card cap's counter. */
  countCreatedSince(userId: string, since: Date): Promise<number>;
  /** Every question this user has a card for — the "already seen" set for the due queue, and mastery's input. */
  listMasteryInputs(userId: string): Promise<MasteryInput[]>;
  save(card: ReviewCard): Promise<void>;
}
