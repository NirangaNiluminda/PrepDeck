import type { Clock } from '@/shared/ports';
import { type Result, ok, err, notFound, forbidden } from '@/shared/result';
import type { QuestionRepository } from '../ports/question-repository';
import { type QuestionDetail, toDetail } from '../ports/dto';

export interface PublishQuestionInput {
  readonly id: string;
  readonly moderatorId: string;
  readonly moderatorIsAdmin: boolean;
}

export async function publishQuestion(
  input: PublishQuestionInput,
  deps: { questions: QuestionRepository; clock: Clock },
): Promise<Result<QuestionDetail>> {
  if (!input.moderatorIsAdmin) {
    return err(forbidden('Only moderators may publish questions'));
  }

  const question = await deps.questions.findById(input.id);
  if (!question) return err(notFound('Question', input.id));

  // The transition rule lives on the entity, so it holds no matter which use
  // case, importer, or admin script triggers it.
  const published = question.publish(deps.clock.now());
  if (!published.ok) return published;

  await deps.questions.save(published.value);
  return ok(toDetail(published.value, true));
}
