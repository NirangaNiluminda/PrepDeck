import type { Collection } from 'mongodb';
import type { Attempt } from '../../domain/attempt';
import type { AttemptRepository } from '../../ports/attempt-repository';
import type { AttemptDocument } from './documents';

const dayKeyOf = (date: Date): string => date.toISOString().slice(0, 10);

export class MongoAttemptRepository implements AttemptRepository {
  constructor(private readonly collection: Collection<AttemptDocument>) {}

  async save(attempt: Attempt): Promise<void> {
    const doc: AttemptDocument = {
      _id: attempt.id,
      userId: attempt.userId,
      questionId: attempt.questionId,
      rating: attempt.rating,
      correct: attempt.correct,
      timeTakenMs: attempt.timeTakenMs,
      timestamp: attempt.timestamp,
      examSessionId: attempt.examSessionId,
      dayKey: dayKeyOf(attempt.timestamp),
    };
    await this.collection.insertOne(doc);
  }

  async listRecentPracticeDates(userId: string, limit: number): Promise<string[]> {
    const rows = await this.collection
      .aggregate<{ _id: string }>([
        { $match: { userId } },
        { $group: { _id: '$dayKey' } },
        { $sort: { _id: -1 } },
        { $limit: limit },
      ])
      .toArray();
    return rows.map((r) => r._id);
  }
}
