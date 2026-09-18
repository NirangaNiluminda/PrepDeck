// The module's public API. `exams` depends on `questions` (via its public API
// — sampleQuestions never touches the questions collection directly) and
// nothing else. It deliberately does NOT depend on `practice`, even though
// an exam answer is exactly the kind of recall evidence practice's scheduler
// cares about: the app layer (a server action) calls both `submitExam` /
// `selfGradeExamAnswer` here and `recordAttempt` from '@/modules/practice',
// passing the resulting examSessionId through. Composing sibling modules in
// the app layer, rather than one importing the other, is what keeps either
// one deletable without the other noticing.

export { startExam } from './use-cases/start-exam';
export type { StartExamInput } from './use-cases/start-exam';
export { recordExamAnswer } from './use-cases/record-exam-answer';
export type { RecordExamAnswerInput } from './use-cases/record-exam-answer';
export { toggleExamFlag } from './use-cases/toggle-exam-flag';
export type { ToggleExamFlagInput } from './use-cases/toggle-exam-flag';
export { submitExam } from './use-cases/submit-exam';
export { selfGradeExamAnswer } from './use-cases/self-grade-exam-answer';
export type { SelfGradeExamAnswerInput } from './use-cases/self-grade-exam-answer';
export { getExamRunnerView } from './use-cases/get-exam-runner-view';
export { getExamResults } from './use-cases/get-exam-results';
export { listExamHistory } from './use-cases/list-exam-history';

// Contracts other modules/the app layer legitimately need.
export type { ExamSessionRepository } from './ports/exam-session-repository';
export type {
  ExamRunnerView,
  ExamRunnerQuestion,
  ExamResultsView,
  ExamReviewQuestion,
  ExamHistoryItem,
} from './ports/dto';
export type { ExamConfig } from './domain/exam-config';
export { MIN_QUESTIONS, MAX_QUESTIONS, MIN_DURATION_MINUTES, MAX_DURATION_MINUTES } from './domain/exam-config';
export type { ExamQuestionSnapshot, ExamOptionSnapshot } from './domain/exam-question-snapshot';
export type { ExamAnswer } from './domain/exam-answer';
// The entity itself, exported for tests only (tests/exam-session.test.ts) —
// every real caller goes through the use cases above.
export { ExamSession, EXAM_STATUSES } from './domain/exam-session';
export type { ExamStatus } from './domain/exam-session';
export { computeScore } from './domain/scoring';
export type { ExamScore, TopicScore } from './domain/scoring';

// Adapters — exported for the composition root and tests only.
export { InMemoryExamSessionRepository } from './adapters/in-memory/in-memory-exam-session-repository';
export { MongoExamSessionRepository } from './adapters/mongo/mongo-exam-session-repository';
export { EXAM_SESSION_INDEXES } from './adapters/mongo/exam-session-document';
export type { ExamSessionDocument } from './adapters/mongo/exam-session-document';
