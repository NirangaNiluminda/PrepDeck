import type { IndexDescription } from 'mongodb';

export interface NoteDocument {
  _id: string;
  userId: string;
  questionId: string;
  content: string;
  updatedAt: Date;
}

export const noteIdOf = (userId: string, questionId: string): string => JSON.stringify([userId, questionId]);

// _id already scopes lookups to one (user, question) pair; no extra index needed.
export const NOTE_INDEXES: IndexDescription[] = [];
