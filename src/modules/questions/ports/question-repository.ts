import type { Page, Pagination } from '@/shared/ports';
import type { Question, QuestionStatus, QuestionType } from '../domain/question';
import type { Difficulty } from '../domain/difficulty';

/**
 * An explicit, closed filter — NOT a passthrough query object.
 *
 * This is the single most important rule for keeping the database swappable.
 * `findByFilter(filter)` can be translated into a Mongo aggregation, SQL, or an
 * in-memory array scan. `find(query: any)` cannot: the moment a caller passes
 * `{ $regex: ... }`, Mongo has leaked into the application layer and Postgres
 * is no longer a swap, it is a rewrite.
 *
 * Adding a new way to search means adding a field here and handling it in each
 * adapter. That cost is the feature, not a bug — it keeps the surface honest.
 */
export interface QuestionFilter {
  /** Matches the topic and all its descendants. */
  readonly topicPath?: string;
  readonly difficulties?: readonly Difficulty[];
  readonly types?: readonly QuestionType[];
  /** AND semantics: a question must carry every tag listed. */
  readonly tags?: readonly string[];
  readonly statuses?: readonly QuestionStatus[];
  readonly authorId?: string;
  /** Free-text over the stem. */
  readonly text?: string;
  /** Used by exam generation to avoid repeating questions. */
  readonly excludeIds?: readonly string[];
  readonly page?: Pagination;
  readonly sort?: QuestionSort;
}

export type QuestionSort = 'newest' | 'oldest' | 'easiest' | 'hardest';

export interface TopicCount {
  readonly topicPath: string;
  readonly count: number;
}

export interface QuestionRepository {
  findById(id: string): Promise<Question | null>;
  findByIds(ids: readonly string[]): Promise<Question[]>;
  findByFilter(filter: QuestionFilter): Promise<Page<Question>>;
  /** Deterministic random sample for exam generation. */
  sample(filter: QuestionFilter, size: number): Promise<Question[]>;
  countByTopic(filter?: QuestionFilter): Promise<TopicCount[]>;
  save(question: Question): Promise<void>;
  saveMany(questions: readonly Question[]): Promise<void>;
  existsWithStem(stem: string): Promise<boolean>;
}
