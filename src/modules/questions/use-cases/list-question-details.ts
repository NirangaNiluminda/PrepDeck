import type { QuestionFilter, QuestionRepository } from '../ports/question-repository';
import { type QuestionDetail, toDetail } from '../ports/dto';

export type ListQuestionDetailsInput = Omit<QuestionFilter, 'statuses'>;

const DEFAULT_PAGE = { limit: 500, offset: 0 };

/**
 * Many questions with their answers in one query, for reading a whole set on
 * one page (a study pack's list). Published only, like sampleQuestions: it
 * serves learners, so drafts never leak in whoever is asking.
 */
export async function listQuestionDetails(
  input: ListQuestionDetailsInput,
  deps: { questions: QuestionRepository },
): Promise<QuestionDetail[]> {
  const page = await deps.questions.findByFilter({
    ...input,
    statuses: ['published'],
    page: input.page ?? DEFAULT_PAGE,
    sort: input.sort ?? 'oldest',
  });
  return page.items.map((q) => toDetail(q, true));
}
