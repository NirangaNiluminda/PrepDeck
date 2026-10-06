import type { IndexDescription } from 'mongodb';
import type { QuestionContent } from '../../domain/question';

export interface QuestionRevisionDocument {
  _id: string;
  questionId: string;
  version: number;
  content: QuestionContent;
  editedBy: string;
  createdAt: Date;
}

export const QUESTION_REVISION_INDEXES: IndexDescription[] = [
  { key: { questionId: 1, createdAt: -1 }, name: 'by_question' },
];
