import type { Clock } from '@/shared/ports';
import { type Result, ok, err, notFound, forbidden } from '@/shared/result';
import type { QuestionRepository } from '../ports/question-repository';
import { type QuestionDetail, toDetail } from '../ports/dto';

export interface RestoreQuestionInput {
  readonly id: string;
  readonly moderatorIsAdmin: boolean;
}

export async function restoreQuestion(
  input: RestoreQuestionInput,
  deps: { questions: QuestionRepository; clock: Clock },
): Promise<Result<QuestionDetail>> {
  if (!input.moderatorIsAdmin) {
    return err(forbidden('Only moderators may restore questions'));
  }

  const question = await deps.questions.findById(input.id);
  if (!question) return err(notFound('Question', input.id));

  const restored = question.restore(deps.clock.now());
  if (!restored.ok) return restored;

  await deps.questions.save(restored.value);
  return ok(toDetail(restored.value, true));
}
