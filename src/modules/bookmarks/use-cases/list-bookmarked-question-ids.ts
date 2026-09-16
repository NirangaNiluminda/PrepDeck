import type { BookmarkRepository } from '../ports/bookmark-repository';

export async function listBookmarkedQuestionIds(
  input: { readonly userId: string },
  deps: { bookmarks: BookmarkRepository },
): Promise<string[]> {
  return deps.bookmarks.listQuestionIds(input.userId);
}
