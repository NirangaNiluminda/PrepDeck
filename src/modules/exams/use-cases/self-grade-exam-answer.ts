import type { Clock } from '@/shared/ports';
import { type Result, ok } from '@/shared/result';
import { type ExamResultsView, toResultsView } from '../ports/dto';
import type { ExamSessionRepository } from '../ports/exam-session-repository';
import { loadOwnedSession } from './_load-owned-session';

export interface SelfGradeExamAnswerInput {
  readonly examSessionId: string;
  readonly userId: string;
  readonly questionId: string;
  readonly correct: boolean;
}

export async function selfGradeExamAnswer(
  input: SelfGradeExamAnswerInput,
  deps: { examSessions: ExamSessionRepository; clock: Clock },
): Promise<Result<ExamResultsView>> {
  const loaded = await loadOwnedSession(input.examSessionId, input.userId, deps);
  if (!loaded.ok) return loaded;

  const graded = loaded.value.selfGrade(input.questionId, input.correct, deps.clock.now());
  if (!graded.ok) return graded;

  await deps.examSessions.save(graded.value);
  return ok(toResultsView(graded.value));
}
