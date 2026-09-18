import type { ExamConfig } from '../domain/exam-config';
import type { ExamSession } from '../domain/exam-session';
import type { ExamScore } from '../domain/scoring';

/**
 * The two views are deliberately separate types, not one type with optional
 * answer fields: while an exam is running, the answer and which option is
 * correct must never be constructible on the client, not just hidden by it.
 * The same split `getQuestion`'s `revealAnswer` flag makes at the field
 * level, made here at the type level instead, gated by exam status rather
 * than a flag a caller could forget to set.
 */

export interface ExamRunnerQuestion {
  readonly questionId: string;
  readonly stem: string;
  readonly type: string;
  readonly difficulty: string;
  readonly topicPath: string;
  readonly options?: readonly { id: string; text: string }[];
  readonly selectedOptionId?: string;
  readonly flagged: boolean;
}

export interface ExamRunnerView {
  readonly id: string;
  readonly config: ExamConfig;
  readonly deadline: string;
  readonly questions: readonly ExamRunnerQuestion[];
}

export interface ExamReviewQuestion {
  readonly questionId: string;
  readonly stem: string;
  readonly type: string;
  readonly difficulty: string;
  readonly topicPath: string;
  readonly options?: readonly { id: string; text: string; correct: boolean }[];
  readonly answer: {
    readonly modelAnswer: string;
    readonly keyPoints: readonly string[];
    readonly explanation?: string;
    readonly references?: readonly string[];
  };
  readonly selectedOptionId?: string;
  readonly selfGradedCorrect?: boolean;
  readonly flagged: boolean;
  /** Defined once gradable: always for MCQ, only after self-grading otherwise. */
  readonly correct?: boolean;
}

export interface ExamResultsView {
  readonly id: string;
  readonly status: string;
  readonly config: ExamConfig;
  readonly score: ExamScore;
  readonly startedAt: string;
  readonly finishedAt?: string;
  readonly questions: readonly ExamReviewQuestion[];
}

export interface ExamHistoryItem {
  readonly id: string;
  readonly status: string;
  readonly questionCount: number;
  readonly score: ExamScore;
  readonly startedAt: string;
  readonly finishedAt?: string;
}

export function toRunnerView(session: ExamSession): ExamRunnerView {
  return {
    id: session.id,
    config: session.config,
    deadline: session.deadline.toISOString(),
    questions: session.snapshots.map((s) => {
      const answer = session.answers.get(s.questionId);
      return {
        questionId: s.questionId,
        stem: s.stem,
        type: s.type,
        difficulty: s.difficulty,
        topicPath: s.topicPath,
        options: s.options?.map((o) => ({ id: o.id, text: o.text })),
        selectedOptionId: answer?.selectedOptionId,
        flagged: answer?.flagged ?? false,
      };
    }),
  };
}

export function toResultsView(session: ExamSession): ExamResultsView {
  return {
    id: session.id,
    status: session.status,
    config: session.config,
    score: session.score,
    startedAt: session.startedAt.toISOString(),
    finishedAt: session.finishedAt?.toISOString(),
    questions: session.snapshots.map((s) => {
      const answer = session.answers.get(s.questionId);
      const correct =
        s.type === 'mcq'
          ? (s.options?.some((o) => o.id === answer?.selectedOptionId && o.correct) ?? false)
          : answer?.selfGradedCorrect;
      return {
        questionId: s.questionId,
        stem: s.stem,
        type: s.type,
        difficulty: s.difficulty,
        topicPath: s.topicPath,
        options: s.options,
        answer: s.answer,
        selectedOptionId: answer?.selectedOptionId,
        selfGradedCorrect: answer?.selfGradedCorrect,
        flagged: answer?.flagged ?? false,
        correct,
      };
    }),
  };
}

export function toHistoryItem(session: ExamSession): ExamHistoryItem {
  return {
    id: session.id,
    status: session.status,
    questionCount: session.snapshots.length,
    score: session.score,
    startedAt: session.startedAt.toISOString(),
    finishedAt: session.finishedAt?.toISOString(),
  };
}
