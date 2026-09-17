import type { NoteRepository } from '../ports/note-repository';

export async function getNote(
  input: { readonly userId: string; readonly questionId: string },
  deps: { notes: NoteRepository },
): Promise<string> {
  const note = await deps.notes.get(input.userId, input.questionId);
  return note?.content ?? '';
}
