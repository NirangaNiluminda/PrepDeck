import type { Clock } from '@/shared/ports';
import { type Result, ok } from '@/shared/result';
import { type ExamRunnerView, toRunnerView } from '../ports/dto';
import type { ExamSessionRepository } from '../ports/exam-session-repository';
import { loadOwnedSession } from './_load-owned-session';

export interface ToggleExamFlagInput {
  readonly examSessionId: string;
  readonly userId: string;
  readonly questionId: string;
  readonly flagged: boolean;
}

export async function toggleExamFlag(
  input: ToggleExamFlagInput,
  deps: { examSessions: ExamSessionRepository; clock: Clock },
): Promise<Result<ExamRunnerView>> {
  const loaded = await loadOwnedSession(input.examSessionId, input.userId, deps);
  if (!loaded.ok) return loaded;

  const flagged = loaded.value.toggleFlag(input.questionId, input.flagged, deps.clock.now());
  if (!flagged.ok) return flagged;

  await deps.examSessions.save(flagged.value);
  return ok(toRunnerView(flagged.value));
}
