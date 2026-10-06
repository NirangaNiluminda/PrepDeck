import type { IndexDescription } from 'mongodb';
import type { VoteDirection } from '../../domain/vote';

export interface VoteDocument {
  /** The (user, question) pair itself, same trick bookmarks use — see its own doc for why JSON, not a joined string. */
  _id: string;
  userId: string;
  questionId: string;
  direction: VoteDirection;
  createdAt: Date;
}

export const voteIdOf = (userId: string, questionId: string): string => JSON.stringify([userId, questionId]);

export const VOTE_INDEXES: IndexDescription[] = [
  { key: { questionId: 1 }, name: 'by_question' },
  { key: { userId: 1 }, name: 'by_user' },
];
