import type { Clock } from '@/shared/ports';
import { type Result, err, ok, conflict } from '@/shared/result';
import { type ExamRunnerView, toRunnerView } from '../ports/dto';
import type { ExamSessionRepository } from '../ports/exam-session-repository';
import { loadOwnedSession } from './_load-owned-session';

export interface GetExamRunnerViewInput {
  readonly examSessionId: string;
  readonly userId: string;
}

/**
 * Never trusts the client's own countdown. If time ran out before anyone's
 * "submit" reached the server — the tab sat closed, the timer never fired —
 * this auto-submits on the way in rather than letting a stale exam keep
 * accepting answers. The caller sees CONFLICT and should load the results
 * view instead.
 */
export async function getExamRunnerView(
  input: GetExamRunnerViewInput,
  deps: { examSessions: ExamSessionRepository; clock: Clock },
): Promise<Result<ExamRunnerView>> {
  const loaded = await loadOwnedSession(input.examSessionId, input.userId, deps);
  if (!loaded.ok) return loaded;

  const now = deps.clock.now();
  if (loaded.value.status !== 'in-progress') {
    return err(conflict('This exam has already been submitted'));
  }
  if (loaded.value.isExpired(now)) {
    const submitted = loaded.value.submit(now);
    if (submitted.ok) await deps.examSessions.save(submitted.value);
    return err(conflict('Time was already up for this exam'));
  }

  return ok(toRunnerView(loaded.value));
}
