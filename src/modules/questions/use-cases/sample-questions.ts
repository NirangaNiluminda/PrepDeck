import type { QuestionFilter, QuestionRepository } from '../ports/question-repository';
import { type QuestionDetail, toDetail } from '../ports/dto';

export interface SampleQuestionsInput extends Omit<QuestionFilter, 'statuses' | 'page' | 'sort'> {
  readonly size: number;
}

/**
 * A random draw for an exam — never gated by viewer role. Unlike browsing,
 * where an admin can inspect drafts, an exam only ever draws from what a
 * learner could otherwise study: published material.
 */
export async function sampleQuestions(
  input: SampleQuestionsInput,
  deps: { questions: QuestionRepository },
): Promise<QuestionDetail[]> {
  const { size, ...filter } = input;
  const drawn = await deps.questions.sample({ ...filter, statuses: ['published'] }, size);
  return drawn.map((q) => toDetail(q, true));
}
