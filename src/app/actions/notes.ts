'use server';

import { getContainer, getSession } from '@/composition/container';
import { setNote } from '@/modules/notes';
import { writeLimitError } from '../_lib/write-guard';

export async function setNoteAction(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Sign in to save notes' };

  const limited = await writeLimitError('note', session.userId);
  if (limited) return { ok: false, error: limited };

  const questionId = formData.get('questionId');
  const content = formData.get('content');
  if (typeof questionId !== 'string' || typeof content !== 'string') {
    return { ok: false, error: 'Invalid note' };
  }

  const result = await setNote({ userId: session.userId, questionId, content }, await getContainer());
  return result.ok ? { ok: true } : { ok: false, error: result.error.message };
}
