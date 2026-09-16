import type { Clock } from '@/shared/ports';
import { type Result, ok, err, validationError } from '@/shared/result';
import type { BookmarkRepository } from '../ports/bookmark-repository';

export interface SetBookmarkInput {
  /** From the session, never the request. */
  readonly userId: string;
  readonly questionId: string;
  readonly bookmarked: boolean;
}

/**
 * Sets the state rather than toggling it, so a double-click or a retried
 * request lands on the state the user saw on screen instead of flipping back.
 */
export async function setBookmark(
  input: SetBookmarkInput,
  deps: { bookmarks: BookmarkRepository; clock: Clock },
): Promise<Result<{ bookmarked: boolean }>> {
  if (!input.userId || !input.questionId.trim()) {
    return err(validationError('A user and a question are required'));
  }

  if (input.bookmarked) {
    await deps.bookmarks.add({
      userId: input.userId,
      questionId: input.questionId,
      createdAt: deps.clock.now(),
    });
  } else {
    await deps.bookmarks.remove(input.userId, input.questionId);
  }

  return ok({ bookmarked: input.bookmarked });
}
