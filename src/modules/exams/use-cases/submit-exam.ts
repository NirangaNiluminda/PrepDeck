import type { Clock } from '@/shared/ports';
import { type Result, ok } from '@/shared/result';
import { type ExamResultsView, toResultsView } from '../ports/dto';
import type { ExamSessionRepository } from '../ports/exam-session-repository';
import { loadOwnedSession } from './_load-owned-session';

export interface SubmitExamInput {
  readonly examSessionId: string;
  readonly userId: string;
}

/**
 * Ends the timed portion. Auto-graded (MCQ) answers are final the moment
 * this succeeds — the caller (a server action, never this module; see
 * README in this folder) uses the returned view's per-question `correct`
 * flags to log those as practice attempts exactly once.
 */
export async function submitExam(
  input: SubmitExamInput,
  deps: { examSessions: ExamSessionRepository; clock: Clock },
): Promise<Result<ExamResultsView>> {
  const loaded = await loadOwnedSession(input.examSessionId, input.userId, deps);
  if (!loaded.ok) return loaded;

  const submitted = loaded.value.submit(deps.clock.now());
  if (!submitted.ok) return submitted;

  await deps.examSessions.save(submitted.value);
  return ok(toResultsView(submitted.value));
}
