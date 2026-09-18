import { type Result, err, ok, conflict } from '@/shared/result';
import { type ExamResultsView, toResultsView } from '../ports/dto';
import type { ExamSessionRepository } from '../ports/exam-session-repository';
import { loadOwnedSession } from './_load-owned-session';

export interface GetExamResultsInput {
  readonly examSessionId: string;
  readonly userId: string;
}

/** Refuses while still in-progress — see ports/dto.ts for why that split is by type, not a flag. */
export async function getExamResults(
  input: GetExamResultsInput,
  deps: { examSessions: ExamSessionRepository },
): Promise<Result<ExamResultsView>> {
  const loaded = await loadOwnedSession(input.examSessionId, input.userId, deps);
  if (!loaded.ok) return loaded;

  if (loaded.value.status === 'in-progress') {
    return err(conflict('This exam is still in progress'));
  }
  return ok(toResultsView(loaded.value));
}
