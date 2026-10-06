import type { Collection } from 'mongodb';
import type { Vote } from '../../domain/vote';
import type { QuestionVoteTally, VoteRepository } from '../../ports/vote-repository';
import { type VoteDocument, voteIdOf } from './vote-document';

export class MongoVoteRepository implements VoteRepository {
  constructor(private readonly collection: Collection<VoteDocument>) {}

  async upsert(vote: Vote): Promise<void> {
    const doc: VoteDocument = {
      _id: voteIdOf(vote.userId, vote.questionId),
      userId: vote.userId,
      questionId: vote.questionId,
      direction: vote.direction,
      createdAt: vote.createdAt,
    };
    await this.collection.replaceOne({ _id: doc._id }, doc, { upsert: true });
  }

  async remove(userId: string, questionId: string): Promise<void> {
    await this.collection.deleteOne({ _id: voteIdOf(userId, questionId) });
  }

  async findByUser(userId: string, questionId: string): Promise<Vote | null> {
    const doc = await this.collection.findOne({ _id: voteIdOf(userId, questionId) });
    return doc ? { userId: doc.userId, questionId: doc.questionId, direction: doc.direction, createdAt: doc.createdAt } : null;
  }

  async tallyByQuestion(questionIds: readonly string[]): Promise<QuestionVoteTally[]> {
    if (questionIds.length === 0) return [];
    const rows = await this.collection
      .aggregate<{ _id: string; up: number; down: number }>([
        { $match: { questionId: { $in: [...questionIds] } } },
        {
          $group: {
            _id: '$questionId',
            up: { $sum: { $cond: [{ $eq: ['$direction', 1] }, 1, 0] } },
            down: { $sum: { $cond: [{ $eq: ['$direction', -1] }, 1, 0] } },
          },
        },
      ])
      .toArray();
    return rows.map((r) => ({ questionId: r._id, up: r.up, down: r.down, score: r.up - r.down }));
  }
}
