import type { Collection } from 'mongodb';
import type { Bookmark } from '../../domain/bookmark';
import type { BookmarkRepository } from '../../ports/bookmark-repository';
import { type BookmarkDocument, bookmarkIdOf } from './bookmark-document';

export class MongoBookmarkRepository implements BookmarkRepository {
  constructor(private readonly collection: Collection<BookmarkDocument>) {}

  async add(bookmark: Bookmark): Promise<void> {
    await this.collection.updateOne(
      { _id: bookmarkIdOf(bookmark.userId, bookmark.questionId) },
      {
        $setOnInsert: {
          userId: bookmark.userId,
          questionId: bookmark.questionId,
          createdAt: bookmark.createdAt,
        },
      },
      { upsert: true },
    );
  }

  async remove(userId: string, questionId: string): Promise<void> {
    await this.collection.deleteOne({ _id: bookmarkIdOf(userId, questionId) });
  }

  async listQuestionIds(userId: string): Promise<string[]> {
    const docs = await this.collection
      .find({ userId }, { projection: { questionId: 1 } })
      .sort({ createdAt: -1 })
      .toArray();
    return docs.map((d) => d.questionId);
  }
}
