import { systemClock, uuidGenerator } from '@/shared/system-adapters';
import type { Clock, IdGenerator, RateLimiter } from '@/shared/ports';
import {
  MongoQuestionRepository,
  MongoQuestionRevisionRepository,
  type QuestionRepository,
  type QuestionRevisionRepository,
  type QuestionDocument,
  type QuestionRevisionDocument,
} from '@/modules/questions';
import {
  MongoBookmarkRepository,
  type BookmarkRepository,
  type BookmarkDocument,
} from '@/modules/bookmarks';
import {
  MongoAttemptRepository,
  MongoReviewCardRepository,
  MongoStudyPackRepository,
  sm2Scheduler,
  type AttemptDocument,
  type AttemptRepository,
  type ReviewCardDocument,
  type ReviewCardRepository,
  type ReviewScheduler,
  type StudyPackDocument,
  type StudyPackRepository,
} from '@/modules/practice';
import {
  MongoNoteRepository,
  type NoteDocument,
  type NoteRepository,
} from '@/modules/notes';
import {
  MongoExamSessionRepository,
  type ExamSessionDocument,
  type ExamSessionRepository,
} from '@/modules/exams';
import {
  MongoUserProfileRepository,
  type UserProfileDocument,
  type UserProfileRepository,
} from '@/modules/users';
import {
  MongoSubmissionRepository,
  MongoVoteRepository,
  MongoReportRepository,
  type SubmissionDocument,
  type SubmissionRepository,
  type VoteDocument,
  type VoteRepository,
  type ReportDocument,
  type ReportRepository,
} from '@/modules/community';
import { DevAuthProvider, type AuthProvider, type Session } from '@/modules/auth';
import { getDb } from './mongo-client';
import { NextAuthAuthProvider } from './next-auth-provider';
import { MongoRateLimiter, type RateLimitDocument } from './mongo-rate-limiter';

/**
 * The composition root: the one place that knows which concrete adapter backs
 * which port. Swapping Mongo for Postgres is a change here and a new adapter
 * file — nothing in domain, use-cases, or routes moves.
 */
export interface Container {
  readonly questions: QuestionRepository;
  readonly revisions: QuestionRevisionRepository;
  readonly bookmarks: BookmarkRepository;
  readonly reviewCards: ReviewCardRepository;
  readonly attempts: AttemptRepository;
  readonly studyPacks: StudyPackRepository;
  readonly notes: NoteRepository;
  readonly examSessions: ExamSessionRepository;
  readonly profiles: UserProfileRepository;
  readonly submissions: SubmissionRepository;
  readonly votes: VoteRepository;
  readonly reports: ReportRepository;
  readonly auth: AuthProvider;
  readonly scheduler: ReviewScheduler;
  readonly rateLimiter: RateLimiter;
  readonly clock: Clock;
  readonly ids: IdGenerator;
}

let cached: Container | undefined;

// GitHub OAuth is opt-in: without both set, the dev provider (DEV_USER_ID /
// DEV_USER_ROLE) keeps working exactly as before. See .env.example for the
// full list this needs, including AUTH_SECRET. Exported so the header knows
// whether to show real Sign in / Sign out controls at all — the dev provider
// isn't a real session, so there's nothing for those buttons to do under it.
export const hasGitHubAuth = Boolean(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET);

export async function getContainer(): Promise<Container> {
  if (cached) return cached;

  const db = await getDb();

  cached = {
    questions: new MongoQuestionRepository(db.collection<QuestionDocument>('questions')),
    revisions: new MongoQuestionRevisionRepository(db.collection<QuestionRevisionDocument>('questionRevisions')),
    bookmarks: new MongoBookmarkRepository(db.collection<BookmarkDocument>('bookmarks')),
    reviewCards: new MongoReviewCardRepository(db.collection<ReviewCardDocument>('reviewCards')),
    attempts: new MongoAttemptRepository(db.collection<AttemptDocument>('attempts')),
    studyPacks: new MongoStudyPackRepository(db.collection<StudyPackDocument>('studyPacks')),
    notes: new MongoNoteRepository(db.collection<NoteDocument>('notes')),
    examSessions: new MongoExamSessionRepository(db.collection<ExamSessionDocument>('examSessions')),
    profiles: new MongoUserProfileRepository(db.collection<UserProfileDocument>('userProfiles')),
    submissions: new MongoSubmissionRepository(db.collection<SubmissionDocument>('submissions')),
    votes: new MongoVoteRepository(db.collection<VoteDocument>('votes')),
    reports: new MongoReportRepository(db.collection<ReportDocument>('reports')),
    auth: hasGitHubAuth ? new NextAuthAuthProvider() : new DevAuthProvider(),
    scheduler: sm2Scheduler,
    rateLimiter: new MongoRateLimiter(db.collection<RateLimitDocument>('rateLimits')),
    clock: systemClock,
    ids: uuidGenerator,
  };

  return cached;
}

/** Tests build their own container from in-memory adapters — see tests/. */
export const buildContainer = (overrides: Container): Container => overrides;

/** The one place every route handler, server action and page reads identity from. */
export const getSession = async (): Promise<Session | null> => (await getContainer()).auth.getSession();
