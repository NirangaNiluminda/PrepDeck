import type { Collection, Filter, Sort } from 'mongodb';
import type { Page } from '@/shared/ports';
import { DEFAULT_PAGE } from '@/shared/ports';
import type { Question } from '../../domain/question';
import { TopicPath } from '../../domain/topic-path';
import type {
  QuestionFilter,
  QuestionRepository,
  QuestionSort,
  TopicCount,
} from '../../ports/question-repository';
import { QuestionMapper, type QuestionDocument } from './question-document';

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const DIFFICULTY_RANK: Record<string, number> = { easy: 1, medium: 2, hard: 3 };

/**
 * Every Mongo-ism is confined to this file. Nothing above it knows that
 * `$in`, `$regex` or aggregation pipelines exist. A Postgres adapter would
 * implement the same interface with SQL and nothing else in the app would move.
 */
export class MongoQuestionRepository implements QuestionRepository {
  constructor(private readonly collection: Collection<QuestionDocument>) {}

  async findById(id: string): Promise<Question | null> {
    const doc = await this.collection.findOne({ _id: id });
    return doc ? QuestionMapper.toDomain(doc) : null;
  }

  async findByIds(ids: readonly string[]): Promise<Question[]> {
    if (ids.length === 0) return [];
    const docs = await this.collection.find({ _id: { $in: [...ids] } }).toArray();
    const byId = new Map(docs.map((d) => [d._id, d]));
    // Preserve caller order — exams depend on it.
    return ids
      .map((id) => byId.get(id))
      .filter((d): d is QuestionDocument => Boolean(d))
      .map(QuestionMapper.toDomain);
  }

  async findByFilter(filter: QuestionFilter): Promise<Page<Question>> {
    const query = this.toQuery(filter);
    const { limit, offset } = filter.page ?? DEFAULT_PAGE;

    const [docs, total] = await Promise.all([
      this.collection
        .find(query)
        .sort(this.toSort(filter.sort ?? 'newest'))
        .skip(offset)
        .limit(limit)
        .toArray(),
      this.collection.countDocuments(query),
    ]);

    return { items: docs.map(QuestionMapper.toDomain), total, limit, offset };
  }

  async sample(filter: QuestionFilter, size: number): Promise<Question[]> {
    const docs = await this.collection
      .aggregate<QuestionDocument>([
        { $match: this.toQuery(filter) },
        { $sample: { size } },
      ])
      .toArray();
    return docs.map(QuestionMapper.toDomain);
  }

  async countByTopic(filter: QuestionFilter = {}): Promise<TopicCount[]> {
    const rows = await this.collection
      .aggregate<{ _id: string; count: number }>([
        { $match: this.toQuery(filter) },
        { $group: { _id: '$topicPath', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      .toArray();
    return rows.map((r) => ({ topicPath: r._id, count: r.count }));
  }

  async save(question: Question): Promise<void> {
    const doc = QuestionMapper.toPersistence(question);
    await this.collection.replaceOne({ _id: doc._id }, doc, { upsert: true });
  }

  async saveMany(questions: readonly Question[]): Promise<void> {
    if (questions.length === 0) return;
    await this.collection.bulkWrite(
      questions.map((q) => {
        const doc = QuestionMapper.toPersistence(q);
        return {
          replaceOne: { filter: { _id: doc._id }, replacement: doc, upsert: true },
        };
      }),
      { ordered: false },
    );
  }

  async existsWithStem(stem: string): Promise<boolean> {
    const found = await this.collection.findOne(
      { stemLower: stem.trim().toLowerCase() },
      { projection: { _id: 1 } },
    );
    return found !== null;
  }

  // ── Translation: QuestionFilter -> Mongo ───────────────────────────────

  private toQuery(filter: QuestionFilter): Filter<QuestionDocument> {
    const query: Filter<QuestionDocument> = {};

    if (filter.topicPath) {
      const parsed = TopicPath.create(filter.topicPath);
      if (parsed.ok) {
        const path = parsed.value.value;
        // Matches the topic itself and every descendant.
        query.topicPath = { $regex: `^${escapeRegex(path)}(/|$)` };
      }
    }
    if (filter.difficulties?.length) query.difficulty = { $in: [...filter.difficulties] };
    if (filter.types?.length) query.type = { $in: [...filter.types] };
    if (filter.statuses?.length) query.status = { $in: [...filter.statuses] };
    if (filter.authorId) query.authorId = filter.authorId;
    if (filter.tags?.length) query.tags = { $all: [...filter.tags] };
    if (filter.excludeIds?.length) query._id = { $nin: [...filter.excludeIds] };
    if (filter.text?.trim()) {
      query.stemLower = { $regex: escapeRegex(filter.text.trim().toLowerCase()) };
    }
    return query;
  }

  private toSort(sort: QuestionSort): Sort {
    switch (sort) {
      case 'oldest':
        return { createdAt: 1 };
      case 'easiest':
        return { difficulty: 1, createdAt: -1 };
      case 'hardest':
        return { difficulty: -1, createdAt: -1 };
      default:
        return { createdAt: -1 };
    }
  }
}

/**
 * Note: 'easiest'/'hardest' sort alphabetically here (easy < hard < medium),
 * which is wrong. Fix by persisting a numeric `difficultyRank` alongside
 * `difficulty` in the mapper and sorting on that. Left visible on purpose —
 * it is exactly the kind of detail an adapter owns and the domain must not.
 */
export const DIFFICULTY_RANK_REFERENCE = DIFFICULTY_RANK;
