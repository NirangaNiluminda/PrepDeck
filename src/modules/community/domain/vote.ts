export const VOTE_DIRECTIONS = [1, -1] as const;
export type VoteDirection = (typeof VOTE_DIRECTIONS)[number];

export const isVoteDirection = (v: unknown): v is VoteDirection => v === 1 || v === -1;

/**
 * One per (userId, questionId) — a later vote replaces the earlier one rather
 * than adding a second row, which is what makes "one vote per user" true
 * without a separate uniqueness check anywhere else.
 */
export interface Vote {
  readonly userId: string;
  readonly questionId: string;
  readonly direction: VoteDirection;
  readonly createdAt: Date;
}
