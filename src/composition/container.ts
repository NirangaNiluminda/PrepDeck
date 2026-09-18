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
import { getDb } from './mongo-client';

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
  readonly scheduler: ReviewScheduler;
  readonly clock: Clock;
  readonly ids: IdGenerator;
}

let cached: Container | undefined;

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
    scheduler: sm2Scheduler,
    clock: systemClock,
    ids: uuidGenerator,
  };

  return cached;
}

/** Tests build their own container from in-memory adapters — see tests/. */
export const buildContainer = (overrides: Container): Container => overrides;
