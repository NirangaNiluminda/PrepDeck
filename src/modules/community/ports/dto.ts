import type { QuestionContent, SimilarQuestion } from '@/modules/questions';
import type { ModerationEvent, Submission, SubmissionStatus } from '../domain/submission';
import type { Report, ReportReason, ReportStatus } from '../domain/report';

/**
 * No partial-reveal concern here the way `QuestionDetail` has for answers —
 * a submission's only viewers are its author and moderators, both of whom
 * are meant to see everything. One DTO is enough.
 */
export interface SubmissionView {
  readonly id: string;
  readonly authorId: string;
  readonly content: QuestionContent;
  readonly status: SubmissionStatus;
  readonly possibleDuplicates: readonly SimilarQuestion[];
  readonly questionId?: string;
  readonly history: readonly ModerationEvent[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export const toSubmissionView = (s: Submission): SubmissionView => ({
  id: s.id,
  authorId: s.authorId,
  content: s.content,
  status: s.status,
  possibleDuplicates: s.possibleDuplicates,
  questionId: s.questionId,
  history: s.history,
  createdAt: s.createdAt.toISOString(),
  updatedAt: s.updatedAt.toISOString(),
});

export interface ReportView {
  readonly id: string;
  readonly reporterId: string;
  readonly questionId: string;
  readonly reason: ReportReason;
  readonly note?: string;
  readonly status: ReportStatus;
  readonly createdAt: string;
}

export const toReportView = (r: Report): ReportView => ({
  id: r.id,
  reporterId: r.reporterId,
  questionId: r.questionId,
  reason: r.reason,
  note: r.note,
  status: r.status,
  createdAt: r.createdAt.toISOString(),
});
