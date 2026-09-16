import type { Clock } from '@/shared/ports';
import { type Result, ok, err, notFound, forbidden } from '@/shared/result';
import type { QuestionRepository } from '../ports/question-repository';
import { type QuestionDetail, toDetail } from '../ports/dto';

export interface ArchiveQuestionInput {
  readonly id: string;
  readonly moderatorIsAdmin: boolean;
}

/** The only "delete" there is: the question is hidden, never removed. */
export async function archiveQuestion(
  input: ArchiveQuestionInput,
  deps: { questions: QuestionRepository; clock: Clock },
): Promise<Result<QuestionDetail>> {
  if (!input.moderatorIsAdmin) {
    return err(forbidden('Only moderators may archive questions'));
  }

  const question = await deps.questions.findById(input.id);
  if (!question) return err(notFound('Question', input.id));

  const archived = question.archive(deps.clock.now());
  if (!archived.ok) return archived;

  await deps.questions.save(archived.value);
  return ok(toDetail(archived.value, true));
}
