import type { QuestionRepository } from '@/modules/questions';
import { type TopicMastery, weakestTopics } from '../domain/mastery';
import type { ReviewCardRepository } from '../ports/review-card-repository';
import { computeTopicMastery } from './_topic-mastery';

export interface GetWeakAreasInput {
  readonly userId: string;
  /** Topics with fewer reviewed questions than this are too noisy to call "weak" and are left out. */
  readonly minReviewed?: number;
  readonly limit?: number;
}

export interface GetWeakAreasDeps {
  readonly reviewCards: ReviewCardRepository;
  readonly questions: QuestionRepository;
}

const DEFAULT_MIN_REVIEWED = 3;
const DEFAULT_LIMIT = 3;

export async function getWeakAreas(
  input: GetWeakAreasInput,
  deps: GetWeakAreasDeps,
): Promise<readonly TopicMastery[]> {
  const { topics } = await computeTopicMastery(input.userId, deps);
  return weakestTopics(topics, {
    minReviewed: input.minReviewed ?? DEFAULT_MIN_REVIEWED,
    limit: input.limit ?? DEFAULT_LIMIT,
  });
}
