import type { IndexDescription } from 'mongodb';
import type { QuestionContent, SimilarQuestion } from '@/modules/questions';
import { Submission, type ModerationEvent, type SubmissionProps, type SubmissionStatus } from '../../domain/submission';

export interface SubmissionDocument {
  _id: string;
  authorId: string;
  content: QuestionContent;
  status: SubmissionStatus;
  possibleDuplicates: SimilarQuestion[];
  questionId?: string;
  history: ModerationEvent[];
  createdAt: Date;
  updatedAt: Date;
}

const withoutUndefined = <T extends object>(value: T): T =>
  Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as T;

export const SubmissionMapper = {
  toPersistence(submission: Submission): SubmissionDocument {
    const p: SubmissionProps = submission.snapshot();
    return withoutUndefined({
      _id: p.id,
      authorId: p.authorId,
      content: p.content,
      status: p.status,
      possibleDuplicates: [...p.possibleDuplicates],
      questionId: p.questionId,
      history: [...p.history],
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    });
  },

  toDomain(doc: SubmissionDocument): Submission {
    return Submission.fromPersistence({
      id: doc._id,
      authorId: doc.authorId,
      content: doc.content,
      status: doc.status,
      possibleDuplicates: doc.possibleDuplicates ?? [],
      questionId: doc.questionId ?? undefined,
      history: doc.history ?? [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  },
};

export const SUBMISSION_INDEXES: IndexDescription[] = [
  { key: { status: 1, createdAt: -1 }, name: 'by_status' },
  { key: { authorId: 1, createdAt: -1 }, name: 'by_author' },
];
