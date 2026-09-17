import type { Note } from '../../domain/note';
import type { NoteRepository } from '../../ports/note-repository';

const keyOf = (userId: string, questionId: string) => JSON.stringify([userId, questionId]);

export class InMemoryNoteRepository implements NoteRepository {
  private readonly store = new Map<string, Note>();

  async get(userId: string, questionId: string): Promise<Note | null> {
    return this.store.get(keyOf(userId, questionId)) ?? null;
  }

  async upsert(note: Note): Promise<void> {
    this.store.set(keyOf(note.userId, note.questionId), note);
  }

  async remove(userId: string, questionId: string): Promise<void> {
    this.store.delete(keyOf(userId, questionId));
  }

  get size(): number {
    return this.store.size;
  }
}
