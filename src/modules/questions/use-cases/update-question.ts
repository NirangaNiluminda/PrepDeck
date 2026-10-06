import type { Clock, IdGenerator } from '@/shared/ports';
import { type Result, ok, err, conflict, forbidden, notFound } from '@/shared/result';
import type { QuestionContent } from '../domain/question';
import type { QuestionRepository } from '../ports/question-repository';
import type { QuestionRevisionRepository } from '../ports/question-revision-repository';
import { type QuestionDetail, toDetail } from '../ports/dto';

export interface UpdateQuestionInput extends QuestionContent {
  readonly id: string;
  readonly editorId: string;
  readonly editorIsAdmin: boolean;
}

export async function updateQuestion(
  input: UpdateQuestionInput,
  deps: { questions: QuestionRepository; revisions: QuestionRevisionRepository; clock: Clock; ids: IdGenerator },
): Promise<Result<QuestionDetail>> {
  const { id, editorId, editorIsAdmin, ...content } = input;
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

  // Snapshot the pre-edit content so it can be listed and reverted to later —
  // saved alongside, never blocking, the edit it's a record of.
  await deps.revisions.save({
    id: deps.ids.next(),
    questionId: id,
    version: existing.version,
    content: {
      slug: existing.slug,
      stem: existing.stem,
      type: existing.type,
      difficulty: existing.difficulty,
      topicPath: existing.topicPath.value,
      tags: existing.tags,
      answer: existing.answer,
      options: existing.options,
      source: existing.source,
    },
    editedBy: editorId,
    createdAt: deps.clock.now(),
  });

  await deps.questions.save(question);
  return ok(toDetail(question, true));
}
