'use client';

import { useEffect, useState } from 'react';
import { Kbd } from './badges';
import { OptionList } from './option-list';

interface Option {
  readonly id: string;
  readonly text: string;
}

interface AnswerRevealProps {
  readonly options?: readonly Option[];
  readonly correctOptionId?: string;
  /** The answer, rendered on the server and hidden until revealed. */
  readonly children: React.ReactNode;
}

/**
 * Hides the answer until asked, because reading an answer you haven't tried to
 * recall first teaches very little. For multiple choice, picking an option
 * reveals the answer and marks the pick right or wrong.
 */
export function AnswerReveal({ options, correctOptionId, children }: AnswerRevealProps) {
  const [revealed, setRevealed] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== ' ' || event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      // Space already presses a focused control and types into fields.
      const target = event.target as HTMLElement;
      if (target.closest('a, button, input, textarea, select, summary, [contenteditable="true"]')) return;
      event.preventDefault();
      setRevealed((shown) => !shown);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const toggle = () => {
    if (revealed) setPicked(null);
    setRevealed(!revealed);
  };

  return (
    <div>
      {options && options.length > 0 && (
        <OptionList
          options={options}
          correctOptionId={correctOptionId}
          revealed={revealed}
          picked={picked}
          onPick={(optionId) => {
            setPicked(optionId);
            setRevealed(true);
          }}
        />
      )}

      {revealed ? (
        <button
          type="button"
          onClick={toggle}
          aria-expanded
          aria-controls="answer"
          className={`${options?.length ? 'mt-6' : ''} inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-zinc-600 ring-1 ring-inset ring-line hover:bg-surface-muted dark:text-zinc-300`}
        >
          🙈 Hide answer <Kbd>Space</Kbd>
        </button>
      ) : (
        <div
          className={`${options?.length ? 'mt-6' : ''} rounded-3xl border-2 border-dashed border-brand-200 bg-brand-50/50 px-6 py-8 text-center dark:border-brand-400/25 dark:bg-brand-400/5`}
        >
          <p aria-hidden className="text-4xl">
            🤔
          </p>
          <p className="mt-2 font-bold text-zinc-900 dark:text-zinc-50">
            {options?.length ? 'Pick an answer, or reveal it' : 'Have a go first'}
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
            Say your answer out loud or sketch it out, then check yourself. Trying to recall is what makes it stick.
          </p>
          <button
            type="button"
            onClick={toggle}
            aria-expanded={false}
            aria-controls="answer"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-fuchsia-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            ✨ Reveal answer <Kbd>Space</Kbd>
          </button>
        </div>
      )}

      <div id="answer" hidden={!revealed} className="mt-8 animate-rise">
        {children}
      </div>
    </div>
  );
}
