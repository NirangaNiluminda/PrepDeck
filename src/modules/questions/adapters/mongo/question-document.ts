import type { IndexDescription } from 'mongodb';
import { Question, type QuestionProps } from '../../domain/question';
import { TopicPath } from '../../domain/topic-path';
import { type Difficulty, difficultyRank } from '../../domain/difficulty';
import type { McqOption, QuestionAnswer, QuestionStatus, QuestionType } from '../../domain/question';

/**
 * The persistence shape. Deliberately separate from the domain entity so the
 * two can drift: you can add an index-only field here, or rename a column,
 * without touching the domain.
 *
 * `_id` is our own UUID string, not an ObjectId. That one decision removes the
 * single most common leak in Mongo repositories — an ObjectId escaping into
 * the application layer and quietly making Postgres impossible.
 */
export interface QuestionDocument {
  _id: string;
  slug?: string;
  stem: string;
  stemLower: string;
  type: QuestionType;
  difficulty: Difficulty;
  /** Index-only: lets easiest/hardest sort by meaning rather than alphabetically. */
  difficultyRank: number;
  topicPath: string;
  /** Denormalised for cheap "all questions under X" prefix queries. */
  topicRoot: string;
  tags: string[];
  answer: QuestionAnswer;
  options?: McqOption[];
  status: QuestionStatus;
  authorId: string;
  source?: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

// The driver stores an `undefined` property as null. Dropping those keys keeps
// optional fields genuinely absent, which the partial slug index depends on.
const withoutUndefined = <T extends object>(value: T): T =>
  Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as T;

export const QuestionMapper = {
  toPersistence(question: Question): QuestionDocument {
    const p: QuestionProps = question.snapshot();
    return withoutUndefined({
      _id: p.id,
      slug: p.slug,
      stem: p.stem,
      stemLower: p.stem.toLowerCase(),
      type: p.type,
      difficulty: p.difficulty,
      difficultyRank: difficultyRank(p.difficulty),
      topicPath: p.topicPath.value,
      topicRoot: p.topicPath.root,
      tags: [...p.tags],
      answer: withoutUndefined({
        modelAnswer: p.answer.modelAnswer,
        keyPoints: [...p.answer.keyPoints],
        explanation: p.answer.explanation,
        references: p.answer.references ? [...p.answer.references] : undefined,
      }),
      options: p.options?.map((o) => ({ id: o.id, text: o.text, correct: o.correct })),
      status: p.status,
      authorId: p.authorId,
      source: p.source,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      version: p.version,
    });
  },

  toDomain(doc: QuestionDocument): Question {
    const topic = TopicPath.create(doc.topicPath);
    if (!topic.ok) {
      // Corrupt row, not a user error — fail loudly rather than silently skip.
      throw new Error(`Invalid topicPath '${doc.topicPath}' on question ${doc._id}`);
    }
    // `?? undefined` covers rows written before the mapper dropped undefined
    // keys, where optional fields were stored as null.
    return Question.fromPersistence({
      id: doc._id,
      slug: doc.slug ?? undefined,
      stem: doc.stem,
      type: doc.type,
      difficulty: doc.difficulty,
      topicPath: topic.value,
      tags: doc.tags,
      answer: {
        modelAnswer: doc.answer.modelAnswer,
        keyPoints: doc.answer.keyPoints ?? [],
        explanation: doc.answer.explanation ?? undefined,
        references: doc.answer.references ?? undefined,
      },
      options: doc.options ?? undefined,
      status: doc.status,
      authorId: doc.authorId,
      source: doc.source ?? undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      version: doc.version,
    });
  },
};

/** Run once at deploy. Every filter field the port exposes needs backing here. */
export const QUESTION_INDEXES: IndexDescription[] = [
  { key: { topicPath: 1, status: 1, difficulty: 1 }, name: 'browse' },
  { key: { status: 1, createdAt: -1 }, name: 'recent' },
  { key: { status: 1, difficultyRank: 1, createdAt: -1 }, name: 'by_difficulty' },
  { key: { tags: 1, status: 1 }, name: 'by_tag' },
  { key: { authorId: 1, status: 1 }, name: 'by_author' },
  { key: { stemLower: 1 }, name: 'dedupe', unique: false },
  { key: { stem: 'text' }, name: 'fulltext' },
  // Partial, because questions created through the API have no slug and a
  // plain unique index would treat every missing slug as the same value.
  {
    key: { slug: 1 },
    name: 'by_slug',
    unique: true,
    partialFilterExpression: { slug: { $type: 'string' } },
  },
];
