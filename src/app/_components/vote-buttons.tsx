'use client';

import { useOptimistic } from 'react';
import type { VoteDirection } from '@/modules/community';
import { castVoteAction } from '../actions/community';

interface VoteButtonsProps {
  readonly questionId: string;
  readonly score: number;
  readonly viewerDirection: VoteDirection | null;
}

interface VoteState {
  readonly score: number;
  readonly direction: VoteDirection | null;
}

const BUTTON = 'rounded-md p-1 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300';

/**
 * Clicking the direction you're already on removes the vote — same "send the
 * state you want, not a toggle" reasoning as BookmarkButton, and the same
 * `<form action={...}>` shape so the optimistic update lands inside the
 * transition React requires for it.
 */
export function VoteButtons({ questionId, score, viewerDirection }: VoteButtonsProps) {
  const [state, setState] = useOptimistic<VoteState>({ score, direction: viewerDirection });

  const vote = (direction: VoteDirection) => async () => {
    const next = state.direction === direction ? 0 : direction;
    setState({ score: state.score - (state.direction ?? 0) + next, direction: next === 0 ? null : next });

    const formData = new FormData();
    formData.set('questionId', questionId);
    formData.set('direction', String(next));
    await castVoteAction(formData);
  };

  return (
    <div className="flex items-center gap-1">
      <form action={vote(1)}>
        <button
          type="submit"
          aria-pressed={state.direction === 1}
          aria-label="Upvote"
          className={`${BUTTON} ${state.direction === 1 ? 'text-emerald-600 dark:text-emerald-400' : ''}`}
        >
          <svg aria-hidden viewBox="0 0 20 20" className="size-4" fill="currentColor">
            <path d="M10 4l6 7h-4v5H8v-5H4l6-7z" />
          </svg>
        </button>
      </form>
      <span data-testid="vote-score" className="min-w-6 text-center text-sm tabular-nums text-zinc-700 dark:text-zinc-300">
        {state.score}
      </span>
      <form action={vote(-1)}>
        <button
          type="submit"
          aria-pressed={state.direction === -1}
          aria-label="Downvote"
          className={`${BUTTON} ${state.direction === -1 ? 'text-rose-600 dark:text-rose-400' : ''}`}
        >
          <svg aria-hidden viewBox="0 0 20 20" className="size-4" fill="currentColor">
            <path d="M10 16l-6-7h4V4h4v5h4l-6 7z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
