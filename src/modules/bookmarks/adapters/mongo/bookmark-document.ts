import type { IndexDescription } from 'mongodb';

export interface BookmarkDocument {
  /**
   * The (user, question) pair itself, so the same bookmark can't be stored
   * twice and adding one is a plain upsert. JSON rather than joining with a
   * separator, so no id format can make two pairs collide.
   */
  _id: string;
  userId: string;
  questionId: string;
  createdAt: Date;
}

export const bookmarkIdOf = (userId: string, questionId: string): string =>
  JSON.stringify([userId, questionId]);

export const BOOKMARK_INDEXES: IndexDescription[] = [
  { key: { userId: 1, createdAt: -1 }, name: 'by_user' },
];
