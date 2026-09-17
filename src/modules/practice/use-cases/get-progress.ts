import type { QuestionRepository } from '@/modules/questions';
import { computeStreak } from '../domain/streak';
import type { ProgressSummary } from '../ports/dto';
import type { AttemptRepository } from '../ports/attempt-repository';
import type { ReviewCardRepository } from '../ports/review-card-repository';
import { computeTopicMastery } from './_topic-mastery';

export interface GetProgressInput {
  readonly userId: string;
  readonly now: Date;
}

export interface GetProgressDeps {
  readonly reviewCards: ReviewCardRepository;
  readonly attempts: AttemptRepository;
  readonly questions: QuestionRepository;
}

const STREAK_LOOKBACK_DAYS = 400;

export async function getProgress(input: GetProgressInput, deps: GetProgressDeps): Promise<ProgressSummary> {
  const [cardsDue, practiceDates, { topics, totalReviewed }] = await Promise.all([
    deps.reviewCards.countDue(input.userId, input.now),
    deps.attempts.listRecentPracticeDates(input.userId, STREAK_LOOKBACK_DAYS),
    computeTopicMastery(input.userId, deps),
  ]);

  return { streak: computeStreak(practiceDates, input.now), cardsDue, totalReviewed, topics };
}
