import type { Bookmark } from '../../domain/bookmark';
import type { BookmarkRepository } from '../../ports/bookmark-repository';

const keyOf = (userId: string, questionId: string) => JSON.stringify([userId, questionId]);

export class InMemoryBookmarkRepository implements BookmarkRepository {
  private readonly store = new Map<string, Bookmark>();

  async add(bookmark: Bookmark): Promise<void> {
    const key = keyOf(bookmark.userId, bookmark.questionId);
    if (!this.store.has(key)) this.store.set(key, bookmark);
  }

  async remove(userId: string, questionId: string): Promise<void> {
    this.store.delete(keyOf(userId, questionId));
  }

  async listQuestionIds(userId: string): Promise<string[]> {
    return [...this.store.values()]
      .filter((b) => b.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((b) => b.questionId);
  }
}
