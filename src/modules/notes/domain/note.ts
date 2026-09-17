export interface Note {
  readonly userId: string;
  readonly questionId: string;
  readonly content: string;
  readonly updatedAt: Date;
}

export const MAX_NOTE_LENGTH = 4000;
