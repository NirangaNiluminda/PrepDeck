import type { IndexDescription } from 'mongodb';

/** `_id` is the (user, question) pair, so a card can never be duplicated and saving is a plain upsert. */
export interface ReviewCardDocument {
  _id: string;
  userId: string;
  questionId: string;
  interval: number;
  easeFactor: number;
  dueDate: Date;
  lapses: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttemptDocument {
  _id: string;
  userId: string;
  questionId: string;
  rating: string;
  correct?: boolean;
  timeTakenMs: number;
  timestamp: Date;
  examSessionId?: string;
  /** `YYYY-MM-DD`, denormalised so a streak's distinct-day query doesn't scan every attempt. */
  dayKey: string;
}

export const reviewCardIdOf = (userId: string, questionId: string): string =>
  JSON.stringify([userId, questionId]);

export const REVIEW_CARD_INDEXES: IndexDescription[] = [
  { key: { userId: 1, dueDate: 1 }, name: 'by_user_due' },
  { key: { userId: 1, createdAt: 1 }, name: 'by_user_created' },
];

export const ATTEMPT_INDEXES: IndexDescription[] = [
  { key: { userId: 1, dayKey: -1 }, name: 'by_user_day' },
];
