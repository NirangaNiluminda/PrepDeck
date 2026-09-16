import { systemClock, uuidGenerator } from '@/shared/system-adapters';
import type { Clock, IdGenerator } from '@/shared/ports';
import {
  MongoQuestionRepository,
  type QuestionRepository,
  type QuestionDocument,
} from '@/modules/questions';
import { getDb } from './mongo-client';

/**
 * The composition root: the one place that knows which concrete adapter backs
 * which port. Swapping Mongo for Postgres is a change here and a new adapter
 * file — nothing in domain, use-cases, or routes moves.
 */
export interface Container {
  readonly questions: QuestionRepository;
  readonly clock: Clock;
  readonly ids: IdGenerator;
}

let cached: Container | undefined;

export async function getContainer(): Promise<Container> {
  if (cached) return cached;

  const db = await getDb();

  cached = {
    questions: new MongoQuestionRepository(db.collection<QuestionDocument>('questions')),
    clock: systemClock,
    ids: uuidGenerator,
  };

  return cached;
}

/** Tests build their own container from in-memory adapters — see tests/. */
export const buildContainer = (overrides: Container): Container => overrides;
