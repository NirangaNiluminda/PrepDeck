'use client';

import { useEffect, useState } from 'react';
import { Kbd } from './badges';

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
        <div role="group" aria-label="Options" className="space-y-2">
          {options.map((option, index) => {
            const isCorrect = revealed && option.id === correctOptionId;
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
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1 text-zinc-800 dark:text-zinc-200">{option.text}</span>
                {isCorrect && <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Correct</span>}
                {isWrongPick && <span className="text-xs font-medium text-rose-700 dark:text-rose-300">Your pick</span>}
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={toggle}
        aria-expanded={revealed}
        aria-controls="answer"
        className={`${options?.length ? 'mt-6' : ''} inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500`}
      >
        {revealed ? 'Hide answer' : 'Show answer'}
        <Kbd>Space</Kbd>
      </button>

      <div id="answer" hidden={!revealed} className="mt-8">
        {children}
      </div>
    </div>
  );
}
