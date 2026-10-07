import type { StudyPack } from '../domain/study-pack';

export interface StudyPackRepository {
  /** Null for a pack that doesn't exist *or* belongs to someone else — the two look the same to a caller. */
  findForUser(userId: string, id: string): Promise<StudyPack | null>;
  /** Active packs only, newest first. Always scoped to one user. */
  listActiveByUser(userId: string): Promise<StudyPack[]>;
  countActiveByUser(userId: string): Promise<number>;
  save(pack: StudyPack): Promise<void>;
}
