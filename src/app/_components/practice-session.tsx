'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { recordAttemptAction } from '../actions/practice';
import { RATING_LABELS, TYPE_LABELS, formatInterval } from '../_lib/labels';
import { AnswerBody } from './answer-body';
import { DifficultyBadge, Kbd, TopicTrail } from './badges';
import { Markdown } from './markdown';

type Rating = 'again' | 'hard' | 'good' | 'easy';
const RATING_KEYS: Record<'1' | '2' | '3' | '4', Rating> = { '1': 'again', '2': 'hard', '3': 'good', '4': 'easy' };
const RATINGS: readonly Rating[] = ['again', 'hard', 'good', 'easy'];

// A local, minimal shape rather than importing DueCard/QuestionDetail from
// '@/modules/practice' or '@/modules/questions': those index files also
// export Mongo adapters, and a client component must never import a module,
// full stop — see CLAUDE.md.
export interface SessionCard {
  readonly question: {
    readonly id: string;
    readonly stem: string;
    readonly type: string;
    readonly difficulty: string;
    readonly topicPath: string;
    readonly options?: readonly { id: string; text: string }[];
    readonly answer?: {
      readonly modelAnswer: string;
      readonly keyPoints: readonly string[];
      readonly explanation?: string;
      readonly references?: readonly string[];
      readonly correctOptionId?: string;
    };
  };
  readonly isNew: boolean;
  readonly previewIntervals: Record<Rating, number>;
}

export function PracticeSession({ cards }: { cards: readonly SessionCard[] }) {
  const [index, setIndex] = useState(0);
  const [counts, setCounts] = useState<Record<Rating, number>>({ again: 0, hard: 0, good: 0, easy: 0 });
  const [failedCount, setFailedCount] = useState(0);

  const current = cards[index];
  const done = index >= cards.length;

  // Advance immediately; the attempt is recorded in the background so a
  // 100-card session never waits on the network between cards.
  const advance = (rating: Rating, timeTakenMs: number, picked: string | null) => {
    const correct =
      current.question.options && current.question.answer?.correctOptionId
        ? picked === current.question.answer.correctOptionId
        : undefined;

    recordAttemptAction({ questionId: current.question.id, rating, timeTakenMs, correct }).catch(() => {
      setFailedCount((n) => n + 1);
    });
    setCounts((c) => ({ ...c, [rating]: c[rating] + 1 }));
    setIndex((i) => i + 1);
  };

  if (done) return <SessionComplete counts={counts} failedCount={failedCount} />;
  if (!current) return null;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
        <span>
          Card {index + 1} of {cards.length}
        </span>
        {current.isNew && (
          <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-300">
            New
          </span>
        )}
      </div>

      {/* Keyed by question id so switching cards remounts this fresh — reveal
          state, the MCQ pick and the per-card timer all reset for free,
          without an effect syncing them to the new card. */}
      <PracticeCard key={current.question.id} card={current} onRate={advance} />

      {failedCount > 0 && (
        <p role="alert" className="mt-6 text-sm text-rose-600 dark:text-rose-400">
          {failedCount} {failedCount === 1 ? 'rating' : 'ratings'} failed to save. Your session can continue; check your connection.
        </p>
      )}
    </div>
  );
}

interface PracticeCardProps {
  readonly card: SessionCard;
  readonly onRate: (rating: Rating, timeTakenMs: number, picked: string | null) => void;
}

function PracticeCard({ card, onRate }: PracticeCardProps) {
  const [revealed, setRevealed] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const startedAt = useRef(0);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const rate = (rating: Rating) => onRate(rating, Date.now() - startedAt.current, picked);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === ' ') {
        event.preventDefault();
        setRevealed((r) => !r);
        return;
      }
      if (!revealed) return; // rate only after attempting recall
      const rating = RATING_KEYS[event.key as keyof typeof RATING_KEYS];
      if (rating) rate(rating);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `rate` closes over `picked`, already a dependency
  }, [revealed, picked]);

  return (
    <div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        <TopicTrail path={card.question.topicPath} />
      </p>
      <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <DifficultyBadge difficulty={card.question.difficulty} />
        <span>{TYPE_LABELS[card.question.type] ?? card.question.type}</span>
      </div>
      <div className="mt-4 text-xl font-medium leading-snug text-zinc-900 dark:text-zinc-50">
        <Markdown>{card.question.stem}</Markdown>
      </div>

      {card.question.options && card.question.options.length > 0 && (
        <div role="group" aria-label="Options" className="mt-6 space-y-2">
          {card.question.options.map((option, i) => {
            const isCorrect = revealed && option.id === card.question.answer?.correctOptionId;
            const isWrongPick = revealed && picked === option.id && !isCorrect;
            const tone = isCorrect
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-400/10'
              : isWrongPick
                ? 'border-rose-500 bg-rose-50 dark:bg-rose-400/10'
                : 'border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600';
            return (
              <button
                key={option.id}
                type="button"
                disabled={revealed}
                onClick={() => {
                  setPicked(option.id);
                  setRevealed(true);
                }}
                className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm disabled:cursor-default ${tone}`}
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-current font-mono text-xs text-zinc-500">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1 text-zinc-800 dark:text-zinc-200">{option.text}</span>
              </button>
            );
          })}
        </div>
      )}

      {!revealed ? (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Show answer <Kbd>Space</Kbd>
        </button>
      ) : (
        <div className="mt-8 space-y-8">
          {card.question.answer && <AnswerBody answer={card.question.answer} />}
          <RatingBar previewIntervals={card.previewIntervals} onRate={rate} />
        </div>
      )}
    </div>
  );
}

function RatingBar({ previewIntervals, onRate }: { previewIntervals: Record<Rating, number>; onRate: (r: Rating) => void }) {
  const RATING_STYLE: Record<Rating, string> = {
    again: 'bg-rose-600 hover:bg-rose-500',
    hard: 'bg-amber-600 hover:bg-amber-500',
    good: 'bg-emerald-600 hover:bg-emerald-500',
    easy: 'bg-sky-600 hover:bg-sky-500',
  };

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {RATINGS.map((rating, i) => (
        <button
          key={rating}
          type="button"
          onClick={() => onRate(rating)}
          className={`flex flex-col items-center gap-0.5 rounded-md px-3 py-2 text-sm font-medium text-white ${RATING_STYLE[rating]}`}
        >
          <span className="flex items-center gap-1.5">
            {RATING_LABELS[rating]}
            <Kbd>{i + 1}</Kbd>
          </span>
          <span className="text-xs opacity-80">{formatInterval(previewIntervals[rating])}</span>
        </button>
      ))}
    </div>
  );
}

function SessionComplete({ counts, failedCount }: { counts: Record<Rating, number>; failedCount: number }) {
  const total = useMemo(() => RATINGS.reduce((sum, r) => sum + counts[r], 0), [counts]);

  return (
    <div className="py-12 text-center">
      <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Session complete</p>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {total} {total === 1 ? 'card' : 'cards'} reviewed.
      </p>
      <dl className="mx-auto mt-6 grid max-w-xs grid-cols-4 gap-2 text-sm">
        {RATINGS.map((rating) => (
          <div key={rating}>
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">{RATING_LABELS[rating]}</dt>
            <dd className="font-semibold text-zinc-900 dark:text-zinc-50">{counts[rating]}</dd>
          </div>
        ))}
      </dl>
      {failedCount > 0 && (
        <p role="alert" className="mx-auto mt-6 max-w-sm text-sm text-rose-600 dark:text-rose-400">
          {failedCount} {failedCount === 1 ? 'rating' : 'ratings'} did not save — your progress numbers may be off for
          this session.
        </p>
      )}
      <div className="mt-8 flex justify-center gap-4 text-sm">
        <Link href="/practice" className="rounded-md bg-indigo-600 px-3 py-1.5 font-medium text-white hover:bg-indigo-500">
          Practice more
        </Link>
        <Link href="/progress" className="rounded-md px-3 py-1.5 font-medium text-zinc-700 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-100 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-800">
          View progress
        </Link>
      </div>
    </div>
  );
}
