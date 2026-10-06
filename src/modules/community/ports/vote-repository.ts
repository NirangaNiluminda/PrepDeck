import type { Vote } from '../domain/vote';

export interface QuestionVoteTally {
  readonly questionId: string;
  readonly up: number;
  readonly down: number;
  readonly score: number;
}

export interface VoteRepository {
  /** Replaces any existing vote from this user on this question — one row per (user, question). */
  upsert(vote: Vote): Promise<void>;
  remove(userId: string, questionId: string): Promise<void>;
  findByUser(userId: string, questionId: string): Promise<Vote | null>;
  /** Empty for a question no one has voted on; callers default it rather than the port. */
  tallyByQuestion(questionIds: readonly string[]): Promise<QuestionVoteTally[]>;
}
