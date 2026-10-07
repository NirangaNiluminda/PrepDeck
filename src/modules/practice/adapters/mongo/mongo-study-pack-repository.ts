import type { Collection } from 'mongodb';
import { StudyPack } from '../../domain/study-pack';
import type { StudyPackRepository } from '../../ports/study-pack-repository';
import type { StudyPackDocument } from './study-pack-document';

const toDomain = (doc: StudyPackDocument): StudyPack =>
  StudyPack.fromPersistence({
    id: doc._id,
    userId: doc.userId,
    name: doc.name,
    topicPaths: doc.topicPaths,
    difficulties: doc.difficulties,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });

export class MongoStudyPackRepository implements StudyPackRepository {
  constructor(private readonly collection: Collection<StudyPackDocument>) {}

  async findForUser(userId: string, id: string): Promise<StudyPack | null> {
    const doc = await this.collection.findOne({ _id: id, userId });
    return doc ? toDomain(doc) : null;
  }

  async listActiveByUser(userId: string): Promise<StudyPack[]> {
    const docs = await this.collection.find({ userId, status: 'active' }).sort({ createdAt: -1 }).toArray();
    return docs.map(toDomain);
  }

  async countActiveByUser(userId: string): Promise<number> {
    return this.collection.countDocuments({ userId, status: 'active' });
  }

  async save(pack: StudyPack): Promise<void> {
    const p = pack.snapshot();
    const doc: StudyPackDocument = {
      _id: p.id,
      userId: p.userId,
      name: p.name,
      topicPaths: [...p.topicPaths],
      difficulties: [...p.difficulties],
      status: p.status,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
    await this.collection.replaceOne({ _id: doc._id }, doc, { upsert: true });
  }
}
