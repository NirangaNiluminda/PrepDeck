import { type Result, ok, err, notFound, forbidden } from '@/shared/result';
import type { QuestionRepository } from '../ports/question-repository';
import { type QuestionDetail, toDetail } from '../ports/dto';

export interface GetQuestionInput {
  readonly id: string;
  readonly viewerId: string | null;
  readonly viewerIsAdmin: boolean;
  /** False during a live exam — the answer is withheld until submission. */
  readonly revealAnswer: boolean;
}

export async function getQuestion(
  input: GetQuestionInput,
  deps: { questions: QuestionRepository },
): Promise<Result<QuestionDetail>> {
  const question = await deps.questions.findById(input.id);
  if (!question) return err(notFound('Question', input.id));

  const isOwner = input.viewerId !== null && question.authorId === input.viewerId;
  if (!question.isVisibleToLearners && !input.viewerIsAdmin && !isOwner) {
    return err(forbidden('This question is not published'));
  }

  return ok(toDetail(question, input.revealAnswer));
}
