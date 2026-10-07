import type { Collection } from 'mongodb';
import type { CardState } from '../../domain/pack-progress';
import { ReviewCard } from '../../domain/review-card';
import type { MasteryInput, ReviewCardRepository } from '../../ports/review-card-repository';
import { type ReviewCardDocument, reviewCardIdOf } from './documents';

const toDomain = (doc: ReviewCardDocument): ReviewCard =>
  ReviewCard.fromPersistence({
    userId: doc.userId,
    questionId: doc.questionId,
    interval: doc.interval,
    easeFactor: doc.easeFactor,
    dueDate: doc.dueDate,
    lapses: doc.lapses,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });

export class MongoReviewCardRepository implements ReviewCardRepository {
  constructor(private readonly collection: Collection<ReviewCardDocument>) {}

  async findByUserAndQuestion(userId: string, questionId: string): Promise<ReviewCard | null> {
    const doc = await this.collection.findOne({ _id: reviewCardIdOf(userId, questionId) });
    return doc ? toDomain(doc) : null;
  }

  async listDue(userId: string, now: Date, limit: number): Promise<ReviewCard[]> {
    const docs = await this.collection
      .find({ userId, dueDate: { $lte: now } })
      .sort({ dueDate: 1 })
      .limit(limit)
      .toArray();
    return docs.map(toDomain);
  }

  async countDue(userId: string, now: Date): Promise<number> {
    return this.collection.countDocuments({ userId, dueDate: { $lte: now } });
  }

  async countCreatedSince(userId: string, since: Date): Promise<number> {
    return this.collection.countDocuments({ userId, createdAt: { $gte: since } });
  }

  async listMasteryInputs(userId: string): Promise<MasteryInput[]> {
    const docs = await this.collection
      .find({ userId }, { projection: { questionId: 1, interval: 1, easeFactor: 1 } })
      .toArray();
    return docs.map((d) => ({ questionId: d.questionId, interval: d.interval, easeFactor: d.easeFactor }));
  }

  // Served by the by_user_due index's userId prefix.
  async listCardStates(userId: string): Promise<CardState[]> {
    const docs = await this.collection
      .find({ userId }, { projection: { questionId: 1, interval: 1, easeFactor: 1, dueDate: 1, updatedAt: 1 } })
      .toArray();
    return docs.map((d) => ({
      questionId: d.questionId,
      interval: d.interval,
      easeFactor: d.easeFactor,
      dueDate: d.dueDate,
      updatedAt: d.updatedAt,
    }));
  }

  async save(card: ReviewCard): Promise<void> {
    const p = card.snapshot();
    const doc: ReviewCardDocument = {
      _id: reviewCardIdOf(p.userId, p.questionId),
      userId: p.userId,
      questionId: p.questionId,
      interval: p.interval,
      easeFactor: p.easeFactor,
      dueDate: p.dueDate,
      lapses: p.lapses,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
    await this.collection.replaceOne({ _id: doc._id }, doc, { upsert: true });
  }
}
