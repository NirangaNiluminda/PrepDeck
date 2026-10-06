import type { Collection, Filter, Sort } from 'mongodb';
import type { Page } from '@/shared/ports';
import { DEFAULT_PAGE } from '@/shared/ports';
import type { Question } from '../../domain/question';
import { TopicPath } from '../../domain/topic-path';
import { findMostSimilar } from '../../domain/stem-similarity';
import type {
  QuestionFilter,
  QuestionRepository,
  QuestionSort,
  SimilarQuestion,
  TagCount,
  TopicCount,
} from '../../ports/question-repository';
import { QuestionMapper, type QuestionDocument } from './question-document';

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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

  async findBySlug(slug: string): Promise<Question | null> {
    const doc = await this.collection.findOne({ slug });
    return doc ? QuestionMapper.toDomain(doc) : null;
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

  async countByTag(filter: QuestionFilter = {}): Promise<TagCount[]> {
    const rows = await this.collection
      .aggregate<{ _id: string; count: number }>([
        { $match: this.toQuery(filter) },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
      ])
      .toArray();
    return rows.map((r) => ({ tag: r._id, count: r.count }));
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

  async existsWithStem(stem: string, exceptId?: string): Promise<boolean> {
    const found = await this.collection.findOne(
      {
        stemLower: stem.trim().toLowerCase(),
        ...(exceptId ? { _id: { $ne: exceptId } } : {}),
      },
      { projection: { _id: 1 } },
    );
    return found !== null;
  }

  async findSimilarByStem(stem: string, limit: number): Promise<SimilarQuestion[]> {
    // No Atlas Search trigram index configured — client-side scoring over a
    // projection, same rough edge the regex-based `text` filter already has.
    // Fine at this corpus size; see ARCHITECTURE.md's known rough edges.
    const candidates = await this.collection
      .find({ status: { $ne: 'archived' } }, { projection: { _id: 1, stem: 1, slug: 1 } })
      .toArray();

    const matches = findMostSimilar(
      stem,
      candidates.map((c) => ({ id: c._id, stem: c.stem })),
      limit,
    );
    const byId = new Map(candidates.map((c) => [c._id, c]));
    return matches.map((m) => {
      const c = byId.get(m.id)!;
      return { id: c._id, stem: c.stem, slug: c.slug, similarity: m.similarity };
    });
  }

  // ── Translation: QuestionFilter -> Mongo ───────────────────────────────

  private toQuery(filter: QuestionFilter): Filter<QuestionDocument> {
    const query: Filter<QuestionDocument> = {};

    if (filter.topicPath) {
      const parsed = TopicPath.create(filter.topicPath);
      if (parsed.ok) {
        // Matches the topic itself and every descendant.
        query.topicPath = { $regex: `^${escapeRegex(parsed.value.value)}(/|$)` };
      }
    }
    if (filter.topicPaths?.length) {
      const parsed = filter.topicPaths.map((t) => TopicPath.create(t)).flatMap((r) => (r.ok ? [r.value.value] : []));
      if (parsed.length) {
        // An OR of the same "itself or a descendant" pattern used above.
        query.$or = parsed.map((path) => ({ topicPath: { $regex: `^${escapeRegex(path)}(/|$)` } }));
      }
    }
    if (filter.difficulties?.length) query.difficulty = { $in: [...filter.difficulties] };
    if (filter.types?.length) query.type = { $in: [...filter.types] };
    if (filter.statuses?.length) query.status = { $in: [...filter.statuses] };
    if (filter.authorId) query.authorId = filter.authorId;
    if (filter.tags?.length) query.tags = { $all: [...filter.tags] };
    if (filter.ids || filter.excludeIds?.length) {
      // `ids: []` must match nothing, and `$in: []` does exactly that.
      query._id = {
        ...(filter.ids ? { $in: [...filter.ids] } : {}),
        ...(filter.excludeIds?.length ? { $nin: [...filter.excludeIds] } : {}),
      };
    }
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
        return { difficultyRank: 1, createdAt: -1 };
      case 'hardest':
        return { difficultyRank: -1, createdAt: -1 };
      default:
        return { createdAt: -1 };
    }
  }
}
