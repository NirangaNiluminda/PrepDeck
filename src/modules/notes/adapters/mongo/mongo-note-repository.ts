import type { Collection } from 'mongodb';
import type { Note } from '../../domain/note';
import type { NoteRepository } from '../../ports/note-repository';
import { type NoteDocument, noteIdOf } from './note-document';

export class MongoNoteRepository implements NoteRepository {
  constructor(private readonly collection: Collection<NoteDocument>) {}

  async get(userId: string, questionId: string): Promise<Note | null> {
    const doc = await this.collection.findOne({ _id: noteIdOf(userId, questionId) });
    return doc ? { userId: doc.userId, questionId: doc.questionId, content: doc.content, updatedAt: doc.updatedAt } : null;
  }

  async upsert(note: Note): Promise<void> {
    const doc: NoteDocument = {
      _id: noteIdOf(note.userId, note.questionId),
      userId: note.userId,
      questionId: note.questionId,
      content: note.content,
      updatedAt: note.updatedAt,
    };
    await this.collection.replaceOne({ _id: doc._id }, doc, { upsert: true });
  }

  async remove(userId: string, questionId: string): Promise<void> {
    await this.collection.deleteOne({ _id: noteIdOf(userId, questionId) });
  }
}
