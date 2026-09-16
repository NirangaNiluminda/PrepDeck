import type { Clock } from '@/shared/ports';
import { type Result, ok, err, conflict, forbidden, notFound } from '@/shared/result';
import type { QuestionContent } from '../domain/question';
import type { QuestionRepository } from '../ports/question-repository';
import { type QuestionDetail, toDetail } from '../ports/dto';

export interface UpdateQuestionInput extends QuestionContent {
  readonly id: string;
  readonly editorIsAdmin: boolean;
}

export async function updateQuestion(
  input: UpdateQuestionInput,
  deps: { questions: QuestionRepository; clock: Clock },
): Promise<Result<QuestionDetail>> {
  const { id, editorIsAdmin, ...content } = input;
  if (!editorIsAdmin) {
    return err(forbidden('Only moderators may edit questions'));
  }

  const existing = await deps.questions.findById(id);
  if (!existing) return err(notFound('Question', id));

  const revised = existing.reviseContent(content, deps.clock.now());
  if (!revised.ok) return revised;
  const question = revised.value;

  if (await deps.questions.existsWithStem(question.stem, id)) {
    return err(conflict('A question with this wording already exists'));
  }
  if (question.slug) {
    const owner = await deps.questions.findBySlug(question.slug);
    if (owner && owner.id !== id) return err(conflict(`Slug '${question.slug}' is already taken`));
  }

  await deps.questions.save(question);
  return ok(toDetail(question, true));
}
