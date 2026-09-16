import type { QuestionStatus } from './question';

/**
 * Learners only ever see published questions, whatever they ask for. Admins
 * get the statuses they request, or every status when they request none.
 */
export const visibleStatuses = (
  viewerIsAdmin: boolean,
  requested?: readonly QuestionStatus[],
): readonly QuestionStatus[] | undefined => (viewerIsAdmin ? requested : ['published']);
