'use server';

import { revalidatePath } from 'next/cache';
import { getContainer, getSession } from '@/composition/container';
import { setBookmark } from '@/modules/bookmarks';
import { writeLimitError } from '../_lib/write-guard';

// Server actions are reachable by a direct POST, not just this app's UI, so
// identity comes from the session and every field is checked here.
export async function setBookmarkAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Sign in to bookmark questions');

  const limited = await writeLimitError('bookmark', session.userId);
  if (limited) throw new Error(limited);

  const questionId = formData.get('questionId');
  const bookmarked = formData.get('bookmarked');
  if (typeof questionId !== 'string' || (bookmarked !== 'true' && bookmarked !== 'false')) {
    throw new Error('Invalid bookmark request');
  }

  const result = await setBookmark(
    { userId: session.userId, questionId, bookmarked: bookmarked === 'true' },
    await getContainer(),
  );
  if (!result.ok) throw new Error(result.error.message);

  revalidatePath('/', 'layout');
}
