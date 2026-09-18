import type { IndexDescription } from 'mongodb';

export interface ExamAnswerDocument {
  questionId: string;
  selectedOptionId?: string;
  selfGradedCorrect?: boolean;
  flagged: boolean;
  answeredAt?: Date;
}

export interface ExamOptionSnapshotDocument {
  id: string;
  text: string;
  correct: boolean;
}

export interface ExamQuestionSnapshotDocument {
  questionId: string;
  stem: string;
  type: string;
  difficulty: string;
  topicPath: string;
  options?: readonly ExamOptionSnapshotDocument[];
  answer: {
    modelAnswer: string;
    keyPoints: readonly string[];
    explanation?: string;
    references?: readonly string[];
  };
}

export interface ExamConfigDocument {
  topicPaths?: readonly string[];
  difficulties?: readonly string[];
  types?: readonly string[];
  count: number;
  durationMinutes: number;
}

export interface ExamSessionDocument {
  _id: string;
  userId: string;
  config: ExamConfigDocument;
  snapshots: ExamQuestionSnapshotDocument[];
  answers: ExamAnswerDocument[];
  status: string;
  startedAt: Date;
  finishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const EXAM_SESSION_INDEXES: IndexDescription[] = [{ key: { userId: 1, startedAt: -1 }, name: 'by_user' }];
