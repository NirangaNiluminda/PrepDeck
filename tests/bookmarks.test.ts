import { describe, it, expect } from 'vitest';
import type { Clock } from '@/shared/ports';
import {
  InMemoryBookmarkRepository,
  listBookmarkedQuestionIds,
  setBookmark,
} from '@/modules/bookmarks';

// Advances a minute per call, so ordering by createdAt is observable.
const tickingClock = (): Clock => {
  let minute = 0;
  return { now: () => new Date(Date.UTC(2026, 0, 15, 10, minute++)) };
};

const deps = () => ({ bookmarks: new InMemoryBookmarkRepository(), clock: tickingClock() });

describe('setBookmark', () => {
  it('bookmarks a question and lists it', async () => {
    const d = deps();

    const result = await setBookmark({ userId: 'u1', questionId: 'q-1', bookmarked: true }, d);

    expect(result.ok && result.value).toEqual({ bookmarked: true });
    expect(await listBookmarkedQuestionIds({ userId: 'u1' }, d)).toEqual(['q-1']);
  });

  it('is idempotent in both directions', async () => {
    const d = deps();

    await setBookmark({ userId: 'u1', questionId: 'q-1', bookmarked: true }, d);
    await setBookmark({ userId: 'u1', questionId: 'q-1', bookmarked: true }, d);
    await setBookmark({ userId: 'u1', questionId: 'q-2', bookmarked: false }, d);

    expect(await listBookmarkedQuestionIds({ userId: 'u1' }, d)).toEqual(['q-1']);
  });

  it('removes a bookmark', async () => {
    const d = deps();
    await setBookmark({ userId: 'u1', questionId: 'q-1', bookmarked: true }, d);

    await setBookmark({ userId: 'u1', questionId: 'q-1', bookmarked: false }, d);

    expect(await listBookmarkedQuestionIds({ userId: 'u1' }, d)).toEqual([]);
  });

  it('rejects a missing user or question', async () => {
    const d = deps();

    const noUser = await setBookmark({ userId: '', questionId: 'q-1', bookmarked: true }, d);
    const noQuestion = await setBookmark({ userId: 'u1', questionId: ' ', bookmarked: true }, d);

    expect(!noUser.ok && noUser.error.code).toBe('VALIDATION');
    expect(!noQuestion.ok && noQuestion.error.code).toBe('VALIDATION');
  });
});

describe('listBookmarkedQuestionIds', () => {
  it('lists the most recent bookmark first', async () => {
    const d = deps();
    for (const questionId of ['q-1', 'q-2', 'q-3']) {
      await setBookmark({ userId: 'u1', questionId, bookmarked: true }, d);
    }

    expect(await listBookmarkedQuestionIds({ userId: 'u1' }, d)).toEqual(['q-3', 'q-2', 'q-1']);
  });

  it("never shows one user another user's bookmarks", async () => {
    const d = deps();
    await setBookmark({ userId: 'alice', questionId: 'q-1', bookmarked: true }, d);
    await setBookmark({ userId: 'bob', questionId: 'q-2', bookmarked: true }, d);
    await setBookmark({ userId: 'bob', questionId: 'q-1', bookmarked: false }, d);

    expect(await listBookmarkedQuestionIds({ userId: 'alice' }, d)).toEqual(['q-1']);
    expect(await listBookmarkedQuestionIds({ userId: 'bob' }, d)).toEqual(['q-2']);
  });
});
