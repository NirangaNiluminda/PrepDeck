import type { Collection, Filter } from 'mongodb';
import type { Page } from '@/shared/ports';
import { DEFAULT_PAGE } from '@/shared/ports';
import type { Report } from '../../domain/report';
import type { ReportFilter, ReportRepository } from '../../ports/report-repository';
import { ReportMapper, type ReportDocument } from './report-document';

export class MongoReportRepository implements ReportRepository {
  constructor(private readonly collection: Collection<ReportDocument>) {}

  async findById(id: string): Promise<Report | null> {
    const doc = await this.collection.findOne({ _id: id });
    return doc ? ReportMapper.toDomain(doc) : null;
  }

  async findByFilter(filter: ReportFilter): Promise<Page<Report>> {
    const query: Filter<ReportDocument> = {};
    if (filter.statuses?.length) query.status = { $in: [...filter.statuses] };

    const { limit, offset } = filter.page ?? DEFAULT_PAGE;
    const [docs, total] = await Promise.all([
      this.collection.find(query).sort({ createdAt: -1 }).skip(offset).limit(limit).toArray(),
      this.collection.countDocuments(query),
    ]);

    return { items: docs.map(ReportMapper.toDomain), total, limit, offset };
  }

  async save(report: Report): Promise<void> {
    const doc = ReportMapper.toPersistence(report);
    await this.collection.replaceOne({ _id: doc._id }, doc, { upsert: true });
  }
}
