import { systemClock, uuidGenerator } from '@/shared/system-adapters';
import type { Clock, IdGenerator } from '@/shared/ports';
import {
  MongoQuestionRepository,
  type QuestionRepository,
  type QuestionDocument,
} from '@/modules/questions';
import {
  MongoBookmarkRepository,
  type BookmarkRepository,
  type BookmarkDocument,
} from '@/modules/bookmarks';
import {
  MongoAttemptRepository,
  MongoReviewCardRepository,
  sm2Scheduler,
  type AttemptDocument,
  type AttemptRepository,
  type ReviewCardDocument,
  type ReviewCardRepository,
  type ReviewScheduler,
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
import { DevAuthProvider, type AuthProvider, type Session } from '@/modules/auth';
import { getDb } from './mongo-client';
import { NextAuthAuthProvider } from './next-auth-provider';

/**
 * The composition root: the one place that knows which concrete adapter backs
 * which port. Swapping Mongo for Postgres is a change here and a new adapter
 * file — nothing in domain, use-cases, or routes moves.
 */
export interface Container {
  readonly questions: QuestionRepository;
  readonly bookmarks: BookmarkRepository;
  readonly reviewCards: ReviewCardRepository;
  readonly attempts: AttemptRepository;
  readonly notes: NoteRepository;
  readonly examSessions: ExamSessionRepository;
  readonly profiles: UserProfileRepository;
  readonly auth: AuthProvider;
  readonly scheduler: ReviewScheduler;
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
    bookmarks: new MongoBookmarkRepository(db.collection<BookmarkDocument>('bookmarks')),
    reviewCards: new MongoReviewCardRepository(db.collection<ReviewCardDocument>('reviewCards')),
    attempts: new MongoAttemptRepository(db.collection<AttemptDocument>('attempts')),
    notes: new MongoNoteRepository(db.collection<NoteDocument>('notes')),
    examSessions: new MongoExamSessionRepository(db.collection<ExamSessionDocument>('examSessions')),
    profiles: new MongoUserProfileRepository(db.collection<UserProfileDocument>('userProfiles')),
    auth: hasGitHubAuth ? new NextAuthAuthProvider() : new DevAuthProvider(),
    scheduler: sm2Scheduler,
    clock: systemClock,
    ids: uuidGenerator,
  };

  return cached;
}

/** Tests build their own container from in-memory adapters — see tests/. */
export const buildContainer = (overrides: Container): Container => overrides;

/** The one place every route handler, server action and page reads identity from. */
export const getSession = async (): Promise<Session | null> => (await getContainer()).auth.getSession();
