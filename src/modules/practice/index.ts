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
export { createStudyPack, MAX_ACTIVE_PACKS } from './use-cases/create-study-pack';
export type { CreateStudyPackInput } from './use-cases/create-study-pack';
export { listStudyPacks } from './use-cases/list-study-packs';
export type { ListStudyPacksInput } from './use-cases/list-study-packs';
export { getStudyPack } from './use-cases/get-study-pack';
export type { GetStudyPackInput } from './use-cases/get-study-pack';
export { archiveStudyPack } from './use-cases/archive-study-pack';
export type { ArchiveStudyPackInput } from './use-cases/archive-study-pack';

// Contracts other modules legitimately need.
export type { ReviewCardRepository, MasteryInput } from './ports/review-card-repository';
export type { AttemptRepository } from './ports/attempt-repository';
export type { ReviewScheduler, ReviewState } from './ports/review-scheduler';
export type { DueCard, ProgressSummary, StudyPackView } from './ports/dto';
export type { StudyPackRepository } from './ports/study-pack-repository';
export { StudyPack, MAX_PACK_NAME_LENGTH, MAX_PACK_TOPICS } from './domain/study-pack';
export { packProgress } from './domain/pack-progress';
export type { PackProgress, CardState } from './domain/pack-progress';
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
export { InMemoryStudyPackRepository } from './adapters/in-memory/in-memory-study-pack-repository';
export { MongoStudyPackRepository } from './adapters/mongo/mongo-study-pack-repository';
export { STUDY_PACK_INDEXES } from './adapters/mongo/study-pack-document';
export type { StudyPackDocument } from './adapters/mongo/study-pack-document';
export { REVIEW_CARD_INDEXES, ATTEMPT_INDEXES } from './adapters/mongo/documents';
export type { ReviewCardDocument, AttemptDocument } from './adapters/mongo/documents';
