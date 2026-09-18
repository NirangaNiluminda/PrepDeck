import type { Clock } from '@/shared/ports';
import { type Result, ok } from '@/shared/result';
import { type ExamRunnerView, toRunnerView } from '../ports/dto';
import type { ExamSessionRepository } from '../ports/exam-session-repository';
import { loadOwnedSession } from './_load-owned-session';

export interface RecordExamAnswerInput {
  readonly examSessionId: string;
  readonly userId: string;
  readonly questionId: string;
  readonly selectedOptionId: string;
}

export async function recordExamAnswer(
  input: RecordExamAnswerInput,
  deps: { examSessions: ExamSessionRepository; clock: Clock },
): Promise<Result<ExamRunnerView>> {
  const loaded = await loadOwnedSession(input.examSessionId, input.userId, deps);
  if (!loaded.ok) return loaded;

  const answered = loaded.value.recordAnswer(input.questionId, input.selectedOptionId, deps.clock.now());
  if (!answered.ok) return answered;

  await deps.examSessions.save(answered.value);
  return ok(toRunnerView(answered.value));
}
