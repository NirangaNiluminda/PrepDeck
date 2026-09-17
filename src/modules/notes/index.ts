// The module's public API.

export { setNote } from './use-cases/set-note';
export type { SetNoteInput } from './use-cases/set-note';
export { getNote } from './use-cases/get-note';
export { MAX_NOTE_LENGTH } from './domain/note';

export type { NoteRepository } from './ports/note-repository';

// Adapters — exported for the composition root and tests only.
export { InMemoryNoteRepository } from './adapters/in-memory/in-memory-note-repository';
export { MongoNoteRepository } from './adapters/mongo/mongo-note-repository';
export { NOTE_INDEXES } from './adapters/mongo/note-document';
export type { NoteDocument } from './adapters/mongo/note-document';
