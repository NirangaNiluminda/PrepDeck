// The module's public API. Other modules (practice, exams, community) import
// from '@/modules/questions' and nothing deeper. Enforce it with an ESLint
// no-restricted-imports rule banning '@/modules/*/domain/*' and
// '@/modules/*/adapters/*' from outside the owning module.
//
// This boundary is what turns the folder into a real module: when the community
// module needs a question, it gets a DTO through a use case, not a raw entity
// and definitely not a collection handle.

// Use cases — the only supported way to do anything.
export { searchQuestions } from './use-cases/search-questions';
export type { SearchQuestionsInput } from './use-cases/search-questions';
export { getQuestion } from './use-cases/get-question';
export type { GetQuestionInput } from './use-cases/get-question';
export { createQuestion } from './use-cases/create-question';
export type { CreateQuestionInput } from './use-cases/create-question';
export { publishQuestion } from './use-cases/publish-question';
export { updateQuestion } from './use-cases/update-question';
export type { UpdateQuestionInput } from './use-cases/update-question';
export { archiveQuestion } from './use-cases/archive-question';
export { restoreQuestion } from './use-cases/restore-question';
export { listQuestionFacets } from './use-cases/list-question-facets';
export type { QuestionFacets } from './use-cases/list-question-facets';
export { importQuestions } from './use-cases/import-questions';
export type {
  ImportQuestionItem,
  ImportOutcome,
  ImportReport,
} from './use-cases/import-questions';

// Contracts other modules legitimately need.
export type {
  QuestionRepository,
  QuestionFilter,
  QuestionSort,
  TopicCount,
  TagCount,
} from './ports/question-repository';
export type { QuestionSummary, QuestionDetail } from './ports/dto';
export { QUESTION_TYPES, QUESTION_STATUSES } from './domain/question';
export type {
  QuestionType,
  QuestionStatus,
  QuestionContent,
  QuestionAnswer,
  McqOption,
} from './domain/question';
export { DIFFICULTIES } from './domain/difficulty';
export type { Difficulty } from './domain/difficulty';
export type { FieldChange } from './domain/question-diff';
export type { TopicNode } from './domain/topic-tree';

// Adapters — exported for the composition root and tests only.
export { InMemoryQuestionRepository } from './adapters/in-memory/in-memory-question-repository';
export { MongoQuestionRepository } from './adapters/mongo/mongo-question-repository';
export { QUESTION_INDEXES } from './adapters/mongo/question-document';
export type { QuestionDocument } from './adapters/mongo/question-document';
