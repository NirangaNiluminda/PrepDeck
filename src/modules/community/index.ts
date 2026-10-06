// The module's public API. `community` depends on `questions` (see the module
// map in PROJECT_PLAN.md) and calls straight into its use cases — approving a
// submission calls createQuestion + publishQuestion directly, unlike the
// practice/exams pair, which has to compose in the app layer instead because
// neither depends on the other. See moderate-submission.ts's own comment.

export { submitQuestion } from './use-cases/submit-question';
export type { SubmitQuestionInput } from './use-cases/submit-question';
export { getSubmission } from './use-cases/get-submission';
export type { GetSubmissionInput } from './use-cases/get-submission';
export { resubmitQuestion } from './use-cases/resubmit-question';
export type { ResubmitQuestionInput } from './use-cases/resubmit-question';
export { listSubmissions } from './use-cases/list-submissions';
export type { ListSubmissionsInput } from './use-cases/list-submissions';
export { listMySubmissions } from './use-cases/list-my-submissions';
export type { ListMySubmissionsInput } from './use-cases/list-my-submissions';
export { moderateSubmission } from './use-cases/moderate-submission';
export type { ModerateSubmissionInput } from './use-cases/moderate-submission';
export { castVote } from './use-cases/cast-vote';
export type { CastVoteInput, CastVoteResult } from './use-cases/cast-vote';
export { getVoteSummary } from './use-cases/get-vote-summary';
export type { GetVoteSummaryInput, VoteSummary } from './use-cases/get-vote-summary';
export { recommendQuestions } from './use-cases/recommend-questions';
export type { RecommendQuestionsInput, RecommendedQuestion } from './use-cases/recommend-questions';
export { reportQuestion } from './use-cases/report-question';
export type { ReportQuestionInput } from './use-cases/report-question';
export { listReports } from './use-cases/list-reports';
export type { ListReportsInput } from './use-cases/list-reports';
export { resolveReport } from './use-cases/resolve-report';
export type { ResolveReportInput } from './use-cases/resolve-report';

// Contracts other modules/the composition root legitimately need.
export type { SubmissionRepository, SubmissionFilter } from './ports/submission-repository';
export type { VoteRepository, QuestionVoteTally } from './ports/vote-repository';
export type { ReportRepository, ReportFilter } from './ports/report-repository';
export type { SubmissionView, ReportView } from './ports/dto';
export { SUBMISSION_STATUSES, MODERATION_DECISIONS } from './domain/submission';
export type { SubmissionStatus, ModerationDecision, ModerationEvent } from './domain/submission';
export { VOTE_DIRECTIONS } from './domain/vote';
export type { VoteDirection } from './domain/vote';
export { REPORT_REASONS, REPORT_STATUSES } from './domain/report';
export type { ReportReason, ReportStatus } from './domain/report';

// Adapters — exported for the composition root and tests only.
export { InMemorySubmissionRepository } from './adapters/in-memory/in-memory-submission-repository';
export { InMemoryVoteRepository } from './adapters/in-memory/in-memory-vote-repository';
export { InMemoryReportRepository } from './adapters/in-memory/in-memory-report-repository';
export { MongoSubmissionRepository } from './adapters/mongo/mongo-submission-repository';
export { MongoVoteRepository } from './adapters/mongo/mongo-vote-repository';
export { MongoReportRepository } from './adapters/mongo/mongo-report-repository';
export { SUBMISSION_INDEXES } from './adapters/mongo/submission-document';
export type { SubmissionDocument } from './adapters/mongo/submission-document';
export { VOTE_INDEXES } from './adapters/mongo/vote-document';
export type { VoteDocument } from './adapters/mongo/vote-document';
export { REPORT_INDEXES } from './adapters/mongo/report-document';
export type { ReportDocument } from './adapters/mongo/report-document';
