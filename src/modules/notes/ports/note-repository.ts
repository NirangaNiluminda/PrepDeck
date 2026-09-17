import type { Note } from '../domain/note';

/** Every method is scoped to one user; there is deliberately no cross-user read. */
export interface NoteRepository {
  get(userId: string, questionId: string): Promise<Note | null>;
  /** Empty content deletes the note rather than storing a blank row. */
  upsert(note: Note): Promise<void>;
  remove(userId: string, questionId: string): Promise<void>;
}
