import type { Collection, Filter } from 'mongodb';
import type { Page } from '@/shared/ports';
import { DEFAULT_PAGE } from '@/shared/ports';
import type { Submission } from '../../domain/submission';
import type { SubmissionFilter, SubmissionRepository } from '../../ports/submission-repository';
import { SubmissionMapper, type SubmissionDocument } from './submission-document';

export class MongoSubmissionRepository implements SubmissionRepository {
  constructor(private readonly collection: Collection<SubmissionDocument>) {}

  async findById(id: string): Promise<Submission | null> {
    const doc = await this.collection.findOne({ _id: id });
    return doc ? SubmissionMapper.toDomain(doc) : null;
  }

  async findByFilter(filter: SubmissionFilter): Promise<Page<Submission>> {
    const query: Filter<SubmissionDocument> = {};
    if (filter.statuses?.length) query.status = { $in: [...filter.statuses] };
    if (filter.authorId) query.authorId = filter.authorId;

    const { limit, offset } = filter.page ?? DEFAULT_PAGE;
    const [docs, total] = await Promise.all([
      this.collection.find(query).sort({ createdAt: -1 }).skip(offset).limit(limit).toArray(),
      this.collection.countDocuments(query),
    ]);

    return { items: docs.map(SubmissionMapper.toDomain), total, limit, offset };
  }

  async save(submission: Submission): Promise<void> {
    const doc = SubmissionMapper.toPersistence(submission);
    await this.collection.replaceOne({ _id: doc._id }, doc, { upsert: true });
  }
}
