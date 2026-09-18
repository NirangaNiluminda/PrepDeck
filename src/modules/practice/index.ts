// The module's public API. Other modules import from '@/modules/practice' and
// nothing deeper. `practice` itself gets questions through '@/modules/questions'
// use cases, never that module's repository — the same rule in reverse.

export { recordAttempt } from './use-cases/record-attempt';
export type { RecordAttemptInput, RecordAttemptResult } from './use-cases/record-attempt';
export { getDueQueue } from './use-cases/get-due-queue';
export type { GetDueQueueInput } from './use-cases/get-due-queue';
export { getProgress } from './use-cases/get-progress';
export type { GetProgressInput } from './use-cases/get-progress';
export { getWeakAreas } from './use-cases/get-weak-areas';
export type { GetWeakAreasInput } from './use-cases/get-weak-areas';

// Contracts other modules legitimately need.
export type { ReviewCardRepository, MasteryInput } from './ports/review-card-repository';
export type { AttemptRepository } from './ports/attempt-repository';
export type { ReviewScheduler, ReviewState } from './ports/review-scheduler';
export type { DueCard, ProgressSummary } from './ports/dto';
export { RATINGS } from './domain/rating';
export type { Rating } from './domain/rating';
export { questionMastery, buildTopicMastery, weakestTopics } from './domain/mastery';
export type { TopicMastery } from './domain/mastery';
export { sm2Scheduler, EASE_DEFAULT, EASE_MIN, NEW_REVIEW_STATE } from './domain/scheduler';
export { startOfDayInTimezone } from './domain/day-boundary';

// Adapters — exported for the composition root and tests only.
export { InMemoryReviewCardRepository } from './adapters/in-memory/in-memory-review-card-repository';
export { InMemoryAttemptRepository } from './adapters/in-memory/in-memory-attempt-repository';
export { MongoReviewCardRepository } from './adapters/mongo/mongo-review-card-repository';
export { MongoAttemptRepository } from './adapters/mongo/mongo-attempt-repository';
export { REVIEW_CARD_INDEXES, ATTEMPT_INDEXES } from './adapters/mongo/documents';
export type { ReviewCardDocument, AttemptDocument } from './adapters/mongo/documents';
