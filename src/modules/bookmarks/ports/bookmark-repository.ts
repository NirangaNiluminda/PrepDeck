import type { Bookmark } from '../domain/bookmark';

/** Every method is scoped to one user; there is deliberately no cross-user read. */
export interface BookmarkRepository {
  /** Idempotent: bookmarking again keeps the original createdAt. */
  add(bookmark: Bookmark): Promise<void>;
  /** Idempotent: removing a bookmark that doesn't exist is not an error. */
  remove(userId: string, questionId: string): Promise<void>;
  /** Most recently bookmarked first. */
  listQuestionIds(userId: string): Promise<string[]>;
}
