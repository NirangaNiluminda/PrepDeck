import { type ExamHistoryItem, toHistoryItem } from '../ports/dto';
import type { ExamSessionRepository } from '../ports/exam-session-repository';

export async function listExamHistory(
  input: { readonly userId: string },
  deps: { examSessions: ExamSessionRepository },
): Promise<readonly ExamHistoryItem[]> {
  const sessions = await deps.examSessions.listByUser(input.userId);
  return sessions.map(toHistoryItem);
}
