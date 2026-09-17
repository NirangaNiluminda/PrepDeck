import { searchQuestions, type QuestionRepository } from '@/modules/questions';
import { type TopicMastery, buildTopicMastery, questionMastery } from '../domain/mastery';
import type { ReviewCardRepository } from '../ports/review-card-repository';

/**
 * Shared by getProgress and getWeakAreas so both read the same numbers.
 * Not exported from index.ts — an internal helper, not a use case of its own.
 *
 * ReviewCard has no topic; only the questions module knows topic paths. This
 * fetches every reviewed question's summary in one call through the public
 * `searchQuestions` API (never the questions collection directly) to build
 * the join. Fine at a few hundred reviewed questions; if that stops being
 * true, this is the one place to add a repository-level aggregation.
 */
export async function computeTopicMastery(
  userId: string,
  deps: { readonly reviewCards: ReviewCardRepository; readonly questions: QuestionRepository },
): Promise<{ readonly topics: readonly TopicMastery[]; readonly totalReviewed: number }> {
  const inputs = await deps.reviewCards.listMasteryInputs(userId);
  if (inputs.length === 0) return { topics: [], totalReviewed: 0 };

  const ids = inputs.map((i) => i.questionId);
  const page = await searchQuestions(
    { ids, page: { limit: ids.length, offset: 0 }, viewerIsAdmin: false },
    { questions: deps.questions },
  );
  const topicOf = new Map(page.items.map((q) => [q.id, q.topicPath]));

  const entries = inputs
    .filter((input) => topicOf.has(input.questionId))
    .map((input) => ({ topicPath: topicOf.get(input.questionId)!, mastery: questionMastery(input) }));

  return { topics: buildTopicMastery(entries), totalReviewed: inputs.length };
}
