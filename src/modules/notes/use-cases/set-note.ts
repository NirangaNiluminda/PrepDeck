import type { Clock } from '@/shared/ports';
import { type Result, ok, err, validationError } from '@/shared/result';
import { MAX_NOTE_LENGTH } from '../domain/note';
import type { NoteRepository } from '../ports/note-repository';

export interface SetNoteInput {
  /** From the session, never the request. */
  readonly userId: string;
  readonly questionId: string;
  readonly content: string;
}

/**
 * The founder's own rewording of a question, private to them — where the
 * plan says the actual learning happens. Saving empty content clears the
 * note rather than leaving a blank row a listing would have to skip.
 */
export async function setNote(
  input: SetNoteInput,
  deps: { notes: NoteRepository; clock: Clock },
): Promise<Result<{ content: string }>> {
  if (!input.userId || !input.questionId.trim()) {
    return err(validationError('A user and a question are required'));
  }
  const content = input.content.trim();
  if (content.length > MAX_NOTE_LENGTH) {
    return err(validationError(`A note may not exceed ${MAX_NOTE_LENGTH} characters`));
  }

  if (content) {
    await deps.notes.upsert({ userId: input.userId, questionId: input.questionId, content, updatedAt: deps.clock.now() });
  } else {
    await deps.notes.remove(input.userId, input.questionId);
  }

  return ok({ content });
}
