'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { recordAttemptAction } from '../actions/practice';
import { TYPE_LABELS, topicLabel } from '../_lib/labels';
import { AnswerBody } from './answer-body';
import { DifficultyBadge, Kbd, TopicChip } from './badges';
import { InlineMarkdown } from './markdown';
import { OptionList } from './option-list';

type Status = 'new' | 'due' | 'learning' | 'learned';

// A local echo of StudyPackItem — client components never import '@/modules/*'.
export interface StudyListItem {
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
  readonly status: Status;
}

const STATUS: Record<Status, { label: string; pill: string; dot: string }> = {
  new: { label: 'New', pill: 'bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300', dot: 'bg-sky-400' },
  due: { label: 'Due', pill: 'bg-amber-50 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300', dot: 'bg-amber-400' },
  learning: { label: 'Learning', pill: 'bg-brand-50 text-brand-700 dark:bg-brand-400/10 dark:text-brand-300', dot: 'bg-brand-400' },
  learned: { label: 'Learned', pill: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300', dot: 'bg-emerald-500' },
};
const FILTERS: readonly ('all' | Status)[] = ['all', 'new', 'due', 'learning', 'learned'];

type Rated = 'again' | 'good';
type SaveState = 'saving' | 'saved' | 'failed';

/**
 * A study pack as one readable page: every question in place, each opening
 * to its answer without leaving the list. Rating one ("Not yet" / "Got it")
 * saves it as a practice attempt, so the list and flashcards share progress,
 * then moves straight on to the next question still to read.
 */
export function StudyList({ items }: { items: readonly StudyListItem[] }) {
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [query, setQuery] = useState('');
  const [rated, setRated] = useState<ReadonlyMap<string, Rated>>(new Map());
  const [saves, setSaves] = useState<ReadonlyMap<string, SaveState>>(new Map());
  const [active, setActive] = useState<string | null>(null);
  const openedAt = useRef(new Map<string, number>());

  // A rating made here moves a card on; the list reflects it without a reload.
  const statusOf = (item: StudyListItem): Status => (rated.has(item.question.id) ? 'learning' : item.status);

  const needle = query.trim().toLowerCase();
  const visible = items.filter(
    (item) => (filter === 'all' || statusOf(item) === filter) && (!needle || item.question.stem.toLowerCase().includes(needle)),
  );
  const counts = FILTERS.reduce(
    (acc, f) => ({ ...acc, [f]: f === 'all' ? items.length : items.filter((i) => statusOf(i) === f).length }),
    {} as Record<'all' | Status, number>,
  );

  const toggle = (id: string) => {
    setActive(id);
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        openedAt.current.set(id, Date.now());
      }
      return next;
    });
  };

  const rate = (id: string, rating: Rated) => {
    const started = openedAt.current.get(id) ?? Date.now();
    setRated((m) => new Map(m).set(id, rating));
    setSaves((m) => new Map(m).set(id, 'saving'));
    recordAttemptAction({ questionId: id, rating, timeTakenMs: Date.now() - started })
      .then(() => setSaves((m) => new Map(m).set(id, 'saved')))
      .catch(() => setSaves((m) => new Map(m).set(id, 'failed')));

    // Close this one and open the next question not yet rated in this visit.
    const index = visible.findIndex((i) => i.question.id === id);
    const next = visible.slice(index + 1).find((i) => !rated.has(i.question.id) && i.question.id !== id);
    setOpen((current) => {
      const updated = new Set(current);
      updated.delete(id);
      if (next) {
        updated.add(next.question.id);
        openedAt.current.set(next.question.id, Date.now());
      }
      return updated;
    });
    if (next) {
      setActive(next.question.id);
      requestAnimationFrame(() =>
        document.getElementById(`q-${next.question.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      );
    }
  };

  // j / k move between questions; 1 / 2 rate the one being read.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement;
      if (target.closest('input, textarea, select, [contenteditable="true"]')) return;

      if (event.key === 'j' || event.key === 'k') {
        const headers = [...document.querySelectorAll<HTMLButtonElement>('[data-study-toggle]')];
        if (headers.length === 0) return;
        event.preventDefault();
        const current = headers.indexOf(document.activeElement as HTMLButtonElement);
        const next = current === -1 ? 0 : Math.min(Math.max(current + (event.key === 'j' ? 1 : -1), 0), headers.length - 1);
        headers[next].focus();
        headers[next].scrollIntoView({ block: 'nearest' });
        return;
      }
      if ((event.key === '1' || event.key === '2') && active && open.has(active)) {
        event.preventDefault();
        rate(active, event.key === '1' ? 'again' : 'good');
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  });

  // Consecutive items under the same topic share one heading.
  const groups: { topicPath: string; items: StudyListItem[] }[] = [];
  for (const item of visible) {
    const last = groups[groups.length - 1];
    if (last && last.topicPath === item.question.topicPath) last.items.push(item);
    else groups.push({ topicPath: item.question.topicPath, items: [item] });
  }
  const allOpen = visible.length > 0 && visible.every((i) => open.has(i.question.id));

  return (
    <div>
      <div className="sticky top-16 z-10 -mx-4 border-b border-line bg-background/90 px-4 py-3 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 overflow-x-auto [scrollbar-width:none]">
            {FILTERS.filter((f) => f === 'all' || counts[f] > 0).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  filter === f
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-surface text-zinc-600 ring-1 ring-inset ring-line hover:text-brand-700 dark:text-zinc-300'
                }`}
              >
                {f === 'all' ? 'All' : STATUS[f].label} <span className="opacity-70">{counts[f]}</span>
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find a question…"
              aria-label="Find a question in this pack"
              className="w-40 rounded-full border border-line bg-surface px-3 py-1.5 text-xs focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/15 sm:w-52"
            />
            <button
              type="button"
              onClick={() => setOpen(allOpen ? new Set() : new Set(visible.map((i) => i.question.id)))}
              className="shrink-0 rounded-full px-3 py-1.5 text-xs font-bold text-zinc-600 ring-1 ring-inset ring-line hover:bg-surface-muted dark:text-zinc-300"
            >
              {allOpen ? 'Collapse all' : 'Expand all'}
            </button>
          </div>
        </div>
        <p className="mt-2 hidden items-center gap-1.5 text-xs text-zinc-500 sm:flex dark:text-zinc-400">
          Click a question to see its answer · <Kbd>j</Kbd> <Kbd>k</Kbd> move · <Kbd>Enter</Kbd> open ·{' '}
          <Kbd>1</Kbd> not yet · <Kbd>2</Kbd> got it
        </p>
      </div>

      {visible.length === 0 && (
        <p className="mt-6 rounded-3xl border-2 border-dashed border-line px-4 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
          {needle ? 'No question here matches that search.' : 'Nothing in this group right now.'}
        </p>
      )}

      {groups.map((group) => (
        <section key={`${group.topicPath}-${group.items[0].question.id}`} className="mt-6">
          <h2 className="mb-2 flex flex-wrap items-center gap-2 text-sm font-bold text-zinc-700 dark:text-zinc-200">
            <TopicChip path={group.topicPath} />
            {group.topicPath
              .split('/')
              .slice(1)
              .map(topicLabel)
              .join(' › ')}
            <span className="text-xs font-medium text-zinc-400">{group.items.length}</span>
          </h2>
          <ol className="space-y-2">
            {group.items.map((item) => (
              <StudyRow
                key={item.question.id}
                item={item}
                number={items.indexOf(item) + 1}
                status={statusOf(item)}
                isOpen={open.has(item.question.id)}
                rating={rated.get(item.question.id)}
                save={saves.get(item.question.id)}
                onToggle={() => toggle(item.question.id)}
                onRate={(r) => rate(item.question.id, r)}
              />
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

interface StudyRowProps {
  readonly item: StudyListItem;
  readonly number: number;
  readonly status: Status;
  readonly isOpen: boolean;
  readonly rating?: Rated;
  readonly save?: SaveState;
  readonly onToggle: () => void;
  readonly onRate: (rating: Rated) => void;
}

function StudyRow({ item, number, status, isOpen, rating, save, onToggle, onRate }: StudyRowProps) {
  const { question } = item;
  const panelId = `a-${question.id}`;

  return (
    <li
      id={`q-${question.id}`}
      className={`scroll-mt-36 overflow-hidden rounded-2xl border bg-surface shadow-sm transition ${
        isOpen ? 'border-brand-300 shadow-md shadow-brand-500/10 dark:border-brand-500/40' : 'border-line hover:border-brand-200'
      }`}
    >
      <button
        type="button"
        data-study-toggle
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left"
      >
        <span className="mt-0.5 w-6 shrink-0 text-right text-xs font-bold tabular-nums text-zinc-400">{number}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
            <InlineMarkdown>{question.stem}</InlineMarkdown>
          </span>
          <span className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold ${STATUS[status].pill}`}>
              <span aria-hidden className={`size-1.5 rounded-full ${STATUS[status].dot}`} />
              {STATUS[status].label}
            </span>
            <DifficultyBadge difficulty={question.difficulty} />
            <span>{TYPE_LABELS[question.type] ?? question.type}</span>
            {/* Shown on the closed row too: rating closes it and moves on. */}
            {save === 'saved' && (
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {rating === 'good' ? '✅ Got it · saved' : '🔁 Not yet · saved'}
              </span>
            )}
            {save === 'saving' && <span>Saving…</span>}
            {save === 'failed' && <span className="font-bold text-rose-600 dark:text-rose-400">⚠ Not saved, open to rate again</span>}
          </span>
        </span>
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`mt-1 size-5 shrink-0 text-zinc-400 transition-transform ${isOpen ? 'rotate-180 text-brand-500' : ''}`}
        >
          <path d="M5.5 7.5L10 12l4.5-4.5" stroke="currentColor" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Rendered only while open: a pack can hold dozens of answers, and
          parsing all their markdown up front would slow the first paint. */}
      {isOpen && (
        <div id={panelId} className="animate-rise border-t border-line bg-background/40 px-4 pb-4 pt-4 sm:pl-13">
          {question.options && question.options.length > 0 && (
            <div className="mb-4">
              <OptionList
                options={question.options}
                correctOptionId={question.answer?.correctOptionId}
                revealed
                picked={null}
                onPick={() => {}}
              />
            </div>
          )}
          {question.answer ? (
            <AnswerBody answer={question.answer} />
          ) : (
            <p className="text-sm text-zinc-500">No answer has been written for this question yet.</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl bg-surface p-3 ring-1 ring-inset ring-line">
            <span className="mr-auto text-sm font-bold text-zinc-700 dark:text-zinc-200">Did you know this?</span>
            <button
              type="button"
              onClick={() => onRate('again')}
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700 transition hover:border-rose-400 dark:border-rose-400/25 dark:bg-rose-400/10 dark:text-rose-300"
            >
              🔁 Not yet <Kbd>1</Kbd>
            </button>
            <button
              type="button"
              onClick={() => onRate('good')}
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 transition hover:border-emerald-400 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-300"
            >
              ✅ Got it <Kbd>2</Kbd>
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>
              {save === 'saved' &&
                (rating === 'good' ? 'Saved. It comes back for review in a few days.' : 'Saved. It comes back soon for another go.')}
            </span>
            <Link href={`/questions/${question.id}`} className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
              Notes &amp; full page ↗
            </Link>
          </div>
        </div>
      )}
    </li>
  );
}
