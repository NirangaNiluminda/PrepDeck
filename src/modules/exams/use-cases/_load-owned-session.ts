import { type Result, ok, err, notFound } from '@/shared/result';
import type { ExamSession } from '../domain/exam-session';
import type { ExamSessionRepository } from '../ports/exam-session-repository';

/**
 * Shared by every use case below that acts on one exam. A session owned by
 * someone else is reported as missing, not forbidden — the same choice
 * `getQuestion` makes for an unpublished question, so a session id can't be
 * used to probe whether it exists.
 */
export async function loadOwnedSession(
  id: string,
  userId: string,
  deps: { examSessions: ExamSessionRepository },
): Promise<Result<ExamSession>> {
  const session = await deps.examSessions.findById(id);
  if (!session || session.userId !== userId) return err(notFound('Exam', id));
  return ok(session);
}
