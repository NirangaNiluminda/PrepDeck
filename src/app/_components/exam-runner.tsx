'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { recordExamAnswerAction, submitExamAction, toggleExamFlagAction } from '../actions/exams';
import { TYPE_LABELS } from '../_lib/labels';
import { DifficultyBadge, Kbd, TopicTrail } from './badges';
import { Markdown } from './markdown';

// A local, minimal echo of ExamRunnerQuestion/ExamRunnerView — the same
// client/module wall every other client component in this app keeps.
export interface RunnerQuestion {
  readonly questionId: string;
  readonly stem: string;
  readonly type: string;
  readonly difficulty: string;
  readonly topicPath: string;
  readonly options?: readonly { id: string; text: string }[];
  readonly selectedOptionId?: string;
  readonly flagged: boolean;
}

const OPTION_KEYS: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, '1': 0, '2': 1, '3': 2, '4': 3 };

export function ExamRunner({
  examSessionId,
  deadline,
  questions: initial,
}: {
  readonly examSessionId: string;
  readonly deadline: string;
  readonly questions: readonly RunnerQuestion[];
}) {
  const router = useRouter();
  const [questions, setQuestions] = useState(initial);
  const [index, setIndex] = useState(0);
  const [remainingMs, setRemainingMs] = useState(() => new Date(deadline).getTime() - Date.now());
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);

  const current = questions[index];
  const unansweredMcq = questions.filter((q) => q.type === 'mcq' && !q.selectedOptionId).length;

  const doSubmit = async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    await submitExamAction(examSessionId);
    router.refresh(); // the adaptive /exams/[id] page renders review or results once status has moved on
  };

  useEffect(() => {
    const tick = () => setRemainingMs(new Date(deadline).getTime() - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  useEffect(() => {
    if (remainingMs <= 0) void doSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- doSubmit is stable enough here; re-running on every render would re-fire the guard-protected submit
  }, [remainingMs]);

  const selectOption = (optionId: string) => {
    setQuestions((qs) => qs.map((q, i) => (i === index ? { ...q, selectedOptionId: optionId } : q)));
    recordExamAnswerAction({ examSessionId, questionId: current.questionId, selectedOptionId: optionId }).catch(() => {
      // The next navigator/results view is read from the server, so a failed
      // save here would show up as this answer reverting — visible, not silent.
    });
  };

  const toggleFlag = () => {
    const flagged = !current.flagged;
    setQuestions((qs) => qs.map((q, i) => (i === index ? { ...q, flagged } : q)));
    toggleExamFlagAction({ examSessionId, questionId: current.questionId, flagged }).catch(() => {});
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, questions.length - 1));
      else if (event.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0));
      else if (event.key.toLowerCase() === 'f') toggleFlag();
      else if (current.type === 'mcq' && current.options) {
        const optionIndex = OPTION_KEYS[event.key.toLowerCase()];
        if (optionIndex !== undefined && current.options[optionIndex]) selectOption(current.options[optionIndex].id);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- selectOption/toggleFlag close over `current`/`index`, already deps
  }, [current, index, questions.length]);

  if (submitting) {
    return <p className="py-16 text-center text-sm text-zinc-500 dark:text-zinc-400">Submitting…</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <Countdown remainingMs={remainingMs} />
        <button
          type="button"
          onClick={() => {
            if (unansweredMcq === 0 || window.confirm(`${unansweredMcq} question${unansweredMcq === 1 ? '' : 's'} still unanswered. Submit anyway?`)) {
              void doSubmit();
            }
          }}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Submit exam
        </button>
      </div>

      <Navigator questions={questions} current={index} onJump={setIndex} />

      <div className="mt-6">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <TopicTrail path={current.topicPath} />
        </p>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <DifficultyBadge difficulty={current.difficulty} />
            <span>{TYPE_LABELS[current.type] ?? current.type}</span>
          </div>
          <button
            type="button"
            onClick={toggleFlag}
            aria-pressed={current.flagged}
            className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${
              current.flagged
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300'
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            {current.flagged ? 'Flagged' : 'Flag for review'} <Kbd>F</Kbd>
          </button>
        </div>
        <div className="mt-4 text-lg font-medium leading-snug text-zinc-900 dark:text-zinc-50">
          <Markdown>{current.stem}</Markdown>
        </div>

        {current.options && (
          <div role="group" aria-label="Options" className="mt-6 space-y-2">
            {current.options.map((option, i) => (
              <button
                key={option.id}
                type="button"
                onClick={() => selectOption(option.id)}
                aria-pressed={current.selectedOptionId === option.id}
                className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm ${
                  current.selectedOptionId === option.id
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-400/10'
                    : 'border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600'
                }`}
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-current font-mono text-xs text-zinc-500">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1 text-zinc-800 dark:text-zinc-200">{option.text}</span>
              </button>
            ))}
          </div>
        )}
        {!current.options && (
          <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
            No input to fill in — you&apos;ll compare your own answer against the model answer once the exam is
            submitted.
          </p>
        )}
      </div>

      <div className="mt-8 flex justify-between text-sm">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(i - 1, 0))}
          disabled={index === 0}
          className="rounded-md px-3 py-1.5 font-medium text-zinc-700 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-100 disabled:opacity-40 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-800"
        >
          ← Previous
        </button>
        <button
          type="button"
          onClick={() => setIndex((i) => Math.min(i + 1, questions.length - 1))}
          disabled={index === questions.length - 1}
          className="rounded-md px-3 py-1.5 font-medium text-zinc-700 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-100 disabled:opacity-40 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-800"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

function Countdown({ remainingMs }: { remainingMs: number }) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const low = totalSeconds <= 60;

  return (
    <p
      className={`font-mono text-lg tabular-nums ${low ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-900 dark:text-zinc-100'}`}
      aria-live={low ? 'assertive' : 'off'}
    >
      {minutes}:{String(seconds).padStart(2, '0')}
    </p>
  );
}

function Navigator({
  questions,
  current,
  onJump,
}: {
  readonly questions: readonly RunnerQuestion[];
  readonly current: number;
  readonly onJump: (index: number) => void;
}) {
  return (
    <nav aria-label="Questions" className="mt-4 flex flex-wrap gap-1.5">
      {questions.map((q, i) => {
        const answered = q.type === 'mcq' ? Boolean(q.selectedOptionId) : true;
        const isCurrent = i === current;
        const tone = isCurrent
          ? 'bg-indigo-600 text-white'
          : answered
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300'
            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
        return (
          <button
            key={q.questionId}
            type="button"
            onClick={() => onJump(i)}
            aria-current={isCurrent}
            aria-label={`Question ${i + 1}${answered ? ', answered' : ', unanswered'}${q.flagged ? ', flagged' : ''}`}
            className={`relative flex size-8 items-center justify-center rounded-md text-xs font-medium ${tone}`}
          >
            {i + 1}
            {q.flagged && <span aria-hidden className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-amber-500" />}
          </button>
        );
      })}
    </nav>
  );
}
