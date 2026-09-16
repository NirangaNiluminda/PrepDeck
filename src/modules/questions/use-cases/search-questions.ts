import type { Page } from '@/shared/ports';
import { DEFAULT_PAGE } from '@/shared/ports';
import type { QuestionFilter, QuestionRepository } from '../ports/question-repository';
import { type QuestionSummary, toSummary } from '../ports/dto';

export interface SearchQuestionsDeps {
  readonly questions: QuestionRepository;
}

export interface SearchQuestionsInput extends QuestionFilter {
  /** Set by the route handler from the session, never from the request body. */
  readonly viewerIsAdmin: boolean;
}

/**
 * Use cases are plain functions taking (input, deps). No class, no constructor,
 * no IUseCase<TIn, TOut>. Still fully substitutable — the test passes the
 * in-memory repository and never touches a database.
 */
export async function searchQuestions(
  input: SearchQuestionsInput,
  deps: SearchQuestionsDeps,
): Promise<Page<QuestionSummary>> {
  const { viewerIsAdmin, ...filter } = input;

  // Authorisation is policy, so it belongs here rather than in the adapter or
  // the route. Learners see published questions only, whatever they ask for.
  const statuses = viewerIsAdmin ? filter.statuses : (['published'] as const);

  const page = await deps.questions.findByFilter({
    ...filter,
    statuses,
    page: filter.page ?? DEFAULT_PAGE,
    sort: filter.sort ?? 'newest',
  });

  return { ...page, items: page.items.map(toSummary) };
}
