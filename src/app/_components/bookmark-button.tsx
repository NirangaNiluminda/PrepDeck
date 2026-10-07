'use client';

import { useOptimistic } from 'react';
import { setBookmarkAction } from '../actions/bookmarks';

/**
 * Flips immediately and lets the server catch up. The hidden field carries the
 * state the user is asking for, not "toggle", so a double click can't undo itself.
 */
export function BookmarkButton({ questionId, bookmarked }: { questionId: string; bookmarked: boolean }) {
  const [shown, setShown] = useOptimistic(bookmarked);
  const label = shown ? 'Remove bookmark' : 'Bookmark this question';

  return (
    <form
      action={async (formData) => {
        setShown(formData.get('bookmarked') === 'true');
        await setBookmarkAction(formData);
      }}
    >
      <input type="hidden" name="questionId" value={questionId} />
      <input type="hidden" name="bookmarked" value={String(!shown)} />
      <button
        type="submit"
        aria-pressed={shown}
        aria-label={label}
        title={label}
        data-bookmark-button
        className={`rounded-full p-1.5 transition-colors hover:bg-amber-50 dark:hover:bg-amber-400/10 ${
          shown ? 'text-amber-400' : 'text-zinc-400 hover:text-amber-500 dark:text-zinc-500 dark:hover:text-amber-300'
        }`}
      >
        {/* Pops only while the optimistic star is ahead of the server, i.e. right
            after a click — not for every already-starred card on page load. */}
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          className={`size-5 ${shown && !bookmarked ? 'animate-pop' : ''}`}
          fill={shown ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinejoin="round" d="M10 2.5l2.35 4.76 5.25.77-3.8 3.7.9 5.23L10 14.49l-4.7 2.47.9-5.23-3.8-3.7 5.25-.77L10 2.5z" />
        </svg>
      </button>
    </form>
  );
}
