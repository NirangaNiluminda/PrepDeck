import type { ExamSession } from '../domain/exam-session';

export interface ExamSessionRepository {
  findById(id: string): Promise<ExamSession | null>;
  /** Most recently started first. */
  listByUser(userId: string): Promise<ExamSession[]>;
  save(session: ExamSession): Promise<void>;
}
