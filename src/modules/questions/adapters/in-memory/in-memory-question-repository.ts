import type { Page } from '@/shared/ports';
import { DEFAULT_PAGE } from '@/shared/ports';
import type { Question } from '../../domain/question';
import { TopicPath } from '../../domain/topic-path';
import { compareDifficulty } from '../../domain/difficulty';
import type {
  QuestionFilter,
  QuestionRepository,
  QuestionSort,
  TopicCount,
} from '../../ports/question-repository';

/**
 * Not a toy. This is the adapter every use-case test runs against, and it is
 * the proof that the abstraction holds: if the suite passes here and against
 * Mongo unchanged, the port is real. Write it first — it takes an hour and it
 * is the cheapest verification available.
 */
export class InMemoryQuestionRepository implements QuestionRepository {
  private readonly store = new Map<string, Question>();

  constructor(seed: readonly Question[] = []) {
    seed.forEach((q) => this.store.set(q.id, q));
  }

  async findById(id: string): Promise<Question | null> {
    return this.store.get(id) ?? null;
  }

  async findByIds(ids: readonly string[]): Promise<Question[]> {
    return ids.map((id) => this.store.get(id)).filter((q): q is Question => Boolean(q));
  }

  async findByFilter(filter: QuestionFilter): Promise<Page<Question>> {
    const matched = this.match(filter);
    const sorted = this.sort(matched, filter.sort ?? 'newest');
    const { limit, offset } = filter.page ?? DEFAULT_PAGE;

    return {
      items: sorted.slice(offset, offset + limit),
      total: sorted.length,
      limit,
      offset,
    };
  }

  async sample(filter: QuestionFilter, size: number): Promise<Question[]> {
    const pool = [...this.match(filter)];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, size);
  }

  async countByTopic(filter: QuestionFilter = {}): Promise<TopicCount[]> {
    const counts = new Map<string, number>();
    for (const q of this.match(filter)) {
      const key = q.topicPath.value;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([topicPath, count]) => ({ topicPath, count }))
      .sort((a, b) => b.count - a.count);
  }

  async save(question: Question): Promise<void> {
    this.store.set(question.id, question);
  }

  async saveMany(questions: readonly Question[]): Promise<void> {
    questions.forEach((q) => this.store.set(q.id, q));
  }

  async existsWithStem(stem: string): Promise<boolean> {
    const needle = stem.trim().toLowerCase();
    return [...this.store.values()].some((q) => q.stem.toLowerCase() === needle);
  }

  // ── Test helpers (not part of the port) ────────────────────────────────

  get size(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  // ── Filtering ──────────────────────────────────────────────────────────

  private match(filter: QuestionFilter): Question[] {
    let ancestor: TopicPath | null = null;
    if (filter.topicPath) {
      const parsed = TopicPath.create(filter.topicPath);
      if (parsed.ok) ancestor = parsed.value;
    }
    const needle = filter.text?.trim().toLowerCase();
    const excluded = new Set(filter.excludeIds ?? []);

    return [...this.store.values()].filter((q) => {
      if (excluded.has(q.id)) return false;
      if (ancestor && !q.topicPath.isUnder(ancestor)) return false;
      if (filter.difficulties?.length && !filter.difficulties.includes(q.difficulty)) return false;
      if (filter.types?.length && !filter.types.includes(q.type)) return false;
      if (filter.statuses?.length && !filter.statuses.includes(q.status)) return false;
      if (filter.authorId && q.authorId !== filter.authorId) return false;
      if (filter.tags?.length && !filter.tags.every((t) => q.tags.includes(t))) return false;
      if (needle && !q.stem.toLowerCase().includes(needle)) return false;
      return true;
    });
  }

  private sort(items: Question[], sort: QuestionSort): Question[] {
    const by: Record<QuestionSort, (a: Question, b: Question) => number> = {
      newest: (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      oldest: (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      easiest: (a, b) => compareDifficulty(a.difficulty, b.difficulty),
      hardest: (a, b) => compareDifficulty(b.difficulty, a.difficulty),
    };
    return [...items].sort(by[sort]);
  }
}
