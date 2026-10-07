'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { recordAttemptAction } from '../actions/practice';
import { RATING_LABELS, TYPE_LABELS, formatInterval } from '../_lib/labels';
import { AnswerBody } from './answer-body';
import { DifficultyBadge, Kbd, TopicChip, TopicTrail } from './badges';
import { Markdown } from './markdown';
import { OptionList } from './option-list';
import { topicStyle } from '../_lib/labels';

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

interface PracticeSessionProps {
  readonly cards: readonly SessionCard[];
  /** Where Pause and the end screen go back to. */
  readonly exitHref: string;
  /** This session's own URL: reloading it picks up whatever is still waiting. */
  readonly againHref: string;
}

export function PracticeSession({ cards: initialCards, exitHref, againHref }: PracticeSessionProps) {
  // Frozen at the start: `index` points into this list, so it must never
  // change under it mid-session, whatever the server re-renders.
  const [cards] = useState(initialCards);
  const [index, setIndex] = useState(0);
  const [counts, setCounts] = useState<Record<Rating, number>>({ again: 0, hard: 0, good: 0, easy: 0 });
  const [failedCount, setFailedCount] = useState(0);
  const [savingCount, setSavingCount] = useState(0);

  const current = cards[index];
  const done = index >= cards.length;

  // Advance immediately; the attempt is recorded in the background so a
  // 100-card session never waits on the network between cards. `savingCount`
  // only matters for the very last card: without it, finishing a session and
  // immediately navigating away could outrun that last save arriving at a
  // real database over a real network, silently dropping it.
  const advance = (rating: Rating, timeTakenMs: number, picked: string | null) => {
    const correct =
      current.question.options && current.question.answer?.correctOptionId
        ? picked === current.question.answer.correctOptionId
        : undefined;

    setSavingCount((n) => n + 1);
    recordAttemptAction({ questionId: current.question.id, rating, timeTakenMs, correct })
      .catch(() => setFailedCount((n) => n + 1))
      .finally(() => setSavingCount((n) => n - 1));
    setCounts((c) => ({ ...c, [rating]: c[rating] + 1 }));
    setIndex((i) => i + 1);
  };

  if (done) {
    return savingCount > 0 ? (
      <FinishingUp />
    ) : (
      <SessionComplete counts={counts} failedCount={failedCount} exitHref={exitHref} againHref={againHref} />
    );
  }
  if (!current) return null;

  return (
    <div>
      <div className="mb-5">
        <div className="flex items-center justify-between text-sm font-semibold text-zinc-600 dark:text-zinc-300">
          <span>
            Card {index + 1} <span className="font-medium text-zinc-400">of {cards.length}</span>
          </span>
          <span className="flex items-center gap-2">
            {current.isNew && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-400/15 dark:text-amber-300">
                ✨ New card
              </span>
            )}
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {RATINGS.filter((r) => counts[r] > 0).map((r) => `${RATING_EMOJI[r]} ${counts[r]}`).join('  ')}
            </span>
            {/* Nothing to save on the way out: every rating was saved as it was
                given, so the queue simply resumes from the next unrated card. */}
            <Link
              href={exitHref}
              title="Every rating is already saved. Come back any time to carry on from here."
              className="rounded-full px-2.5 py-1 text-xs font-bold text-zinc-600 ring-1 ring-inset ring-line hover:bg-surface-muted dark:text-zinc-300"
            >
              ⏸ Pause
            </Link>
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Session progress"
          aria-valuemin={0}
          aria-valuemax={cards.length}
          aria-valuenow={index}
          className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface-muted"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-fuchsia-500 transition-[width] duration-500"
            style={{ width: `${Math.max((index / cards.length) * 100, 2)}%` }}
          />
        </div>
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
    <div className="animate-rise">
      <div className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <span aria-hidden className={`absolute inset-x-0 top-0 h-1.5 ${topicStyle(card.question.topicPath).accent}`} />
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <TopicChip path={card.question.topicPath} />
          {card.question.topicPath.includes('/') && <TopicTrail path={card.question.topicPath} hideRoot />}
          <DifficultyBadge difficulty={card.question.difficulty} />
          <span className="rounded-full bg-surface-muted px-2 py-0.5 font-medium">
            {TYPE_LABELS[card.question.type] ?? card.question.type}
          </span>
        </div>
        <div className="mt-4 text-xl font-bold leading-snug text-zinc-900 dark:text-zinc-50 [&_.prose]:text-inherit [&_p]:my-0">
          <Markdown className="prose-lg font-bold">{card.question.stem}</Markdown>
        </div>

        {card.question.options && card.question.options.length > 0 && (
          <div className="mt-6">
            <OptionList
              options={card.question.options}
              correctOptionId={card.question.answer?.correctOptionId}
              revealed={revealed}
              picked={picked}
              onPick={(optionId) => {
                setPicked(optionId);
                setRevealed(true);
              }}
            />
          </div>
        )}

        {!revealed && (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-fuchsia-500 px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-brand-600/25 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            ✨ Show answer <Kbd>Space</Kbd>
          </button>
        )}
      </div>

      {revealed && (
        <div className="mt-6 animate-rise space-y-6">
          {card.question.answer && <AnswerBody answer={card.question.answer} />}
          <div className="sticky bottom-4 rounded-3xl border border-line bg-surface/95 p-4 shadow-lg backdrop-blur">
            <p className="mb-3 text-center text-sm font-bold text-zinc-700 dark:text-zinc-200">How well did you know it?</p>
            <RatingBar previewIntervals={card.previewIntervals} onRate={rate} />
          </div>
        </div>
      )}
    </div>
  );
}

const RATING_EMOJI: Record<Rating, string> = { again: '😵', hard: '😬', good: '🙂', easy: '😎' };

function RatingBar({ previewIntervals, onRate }: { previewIntervals: Record<Rating, number>; onRate: (r: Rating) => void }) {
  const RATING_STYLE: Record<Rating, string> = {
    again: 'border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-400 dark:border-rose-400/25 dark:bg-rose-400/10 dark:text-rose-300',
    hard: 'border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-400 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300',
    good: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-300',
    easy: 'border-sky-200 bg-sky-50 text-sky-700 hover:border-sky-400 dark:border-sky-400/25 dark:bg-sky-400/10 dark:text-sky-300',
  };

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {RATINGS.map((rating, i) => (
        <button
          key={rating}
          type="button"
          onClick={() => onRate(rating)}
          className={`flex flex-col items-center gap-0.5 rounded-2xl border-2 px-3 py-2.5 text-sm font-bold transition hover:-translate-y-0.5 ${RATING_STYLE[rating]}`}
        >
          <span aria-hidden className="text-2xl leading-none">
            {RATING_EMOJI[rating]}
          </span>
          <span className="mt-1 flex items-center gap-1.5">
            {RATING_LABELS[rating]}
            <Kbd>{i + 1}</Kbd>
          </span>
          <span className="text-xs font-medium opacity-75">next in {formatInterval(previewIntervals[rating])}</span>
        </button>
      ))}
    </div>
  );
}

function FinishingUp() {
  return (
    <div className="py-16 text-center">
      <p aria-hidden className="animate-pulse text-4xl">
        💾
      </p>
      <p className="mt-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">Saving your last few ratings…</p>
    </div>
  );
}

const RATING_TILE: Record<Rating, string> = {
  again: 'bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300',
  hard: 'bg-amber-50 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300',
  good: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300',
  easy: 'bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300',
};

interface SessionCompleteProps {
  readonly counts: Record<Rating, number>;
  readonly failedCount: number;
  readonly exitHref: string;
  readonly againHref: string;
}

function SessionComplete({ counts, failedCount, exitHref, againHref }: SessionCompleteProps) {
  const total = useMemo(() => RATINGS.reduce((sum, r) => sum + counts[r], 0), [counts]);
  const knewIt = counts.good + counts.easy;
  const headline =
    total > 0 && knewIt / total >= 0.8 ? 'Brilliant session!' : knewIt / total >= 0.5 ? 'Nice work!' : 'Every rep counts!';

  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-surface px-6 py-12 text-center shadow-sm">
      <span aria-hidden className="pointer-events-none absolute -left-10 -top-10 size-40 rounded-full bg-brand-500/10" />
      <span aria-hidden className="pointer-events-none absolute -bottom-12 -right-8 size-44 rounded-full bg-fuchsia-500/10" />
      <p aria-hidden className="relative animate-pop text-6xl">
        🎉
      </p>
      <p className="relative mt-4 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">{headline}</p>
      <p className="relative mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        You reviewed <span className="font-bold text-zinc-900 dark:text-zinc-50">{total}</span>{' '}
        {total === 1 ? 'card' : 'cards'}. Each one is now scheduled for the right moment to see it again.
      </p>
      <dl className="relative mx-auto mt-8 grid max-w-md grid-cols-4 gap-2 text-sm">
        {RATINGS.map((rating) => (
          <div key={rating} className={`rounded-2xl px-2 py-3 ${RATING_TILE[rating]}`}>
            <dt className="text-xs font-semibold">
              <span aria-hidden>{RATING_EMOJI[rating]} </span>
              {RATING_LABELS[rating]}
            </dt>
            <dd className="mt-1 text-2xl font-extrabold">{counts[rating]}</dd>
          </div>
        ))}
      </dl>
      {failedCount > 0 && (
        <p role="alert" className="relative mx-auto mt-6 max-w-sm text-sm text-rose-600 dark:text-rose-400">
          {failedCount} {failedCount === 1 ? 'rating' : 'ratings'} did not save — your progress numbers may be off for
          this session.
        </p>
      )}
      <div className="relative mt-8 flex flex-wrap justify-center gap-3 text-sm">
        <Link
          href={againHref}
          className="rounded-full bg-gradient-to-r from-brand-600 to-fuchsia-500 px-5 py-2.5 font-bold text-white shadow-md shadow-brand-600/25 transition hover:-translate-y-0.5"
        >
          Keep going →
        </Link>
        <Link
          href={exitHref}
          className="rounded-full px-5 py-2.5 font-bold text-zinc-700 ring-1 ring-inset ring-line hover:bg-surface-muted dark:text-zinc-200"
        >
          🧠 All practice
        </Link>
        <Link
          href="/progress"
          className="rounded-full px-5 py-2.5 font-bold text-zinc-700 ring-1 ring-inset ring-line hover:bg-surface-muted dark:text-zinc-200"
        >
          📈 View progress
        </Link>
      </div>
    </div>
  );
}
