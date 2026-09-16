import type { IndexDescription } from 'mongodb';
import { Question, type QuestionProps } from '../../domain/question';
import { TopicPath } from '../../domain/topic-path';
import type { Difficulty } from '../../domain/difficulty';
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
  stem: string;
  stemLower: string;
  type: QuestionType;
  difficulty: Difficulty;
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

export const QuestionMapper = {
  toPersistence(question: Question): QuestionDocument {
    const p: QuestionProps = question.snapshot();
    return {
      _id: p.id,
      stem: p.stem,
      stemLower: p.stem.toLowerCase(),
      type: p.type,
      difficulty: p.difficulty,
      topicPath: p.topicPath.value,
      topicRoot: p.topicPath.root,
      tags: [...p.tags],
      answer: p.answer,
      options: p.options ? [...p.options] : undefined,
      status: p.status,
      authorId: p.authorId,
      source: p.source,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      version: p.version,
    };
  },

  toDomain(doc: QuestionDocument): Question {
    const topic = TopicPath.create(doc.topicPath);
    if (!topic.ok) {
      // Corrupt row, not a user error — fail loudly rather than silently skip.
      throw new Error(`Invalid topicPath '${doc.topicPath}' on question ${doc._id}`);
    }
    return Question.fromPersistence({
      id: doc._id,
      stem: doc.stem,
      type: doc.type,
      difficulty: doc.difficulty,
      topicPath: topic.value,
      tags: doc.tags,
      answer: doc.answer,
      options: doc.options,
      status: doc.status,
      authorId: doc.authorId,
      source: doc.source,
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
  { key: { tags: 1, status: 1 }, name: 'by_tag' },
  { key: { authorId: 1, status: 1 }, name: 'by_author' },
  { key: { stemLower: 1 }, name: 'dedupe', unique: false },
  { key: { stem: 'text' as const }, name: 'fulltext' },
];
