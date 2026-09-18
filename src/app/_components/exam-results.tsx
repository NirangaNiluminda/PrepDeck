import type { ExamResultsView } from '@/modules/exams';
import { EXAM_STATUS_LABELS, formatDuration } from '../_lib/labels';
import { computeMcqTimings } from '../_lib/exam-timing';
import { AnswerBody } from './answer-body';
import { DifficultyBadge, TopicTrail } from './badges';
import { InlineMarkdown } from './markdown';

// Server Component only — never imported by a 'use client' file — so it can
// take the real ExamResultsView type directly rather than a local echo.
export function ExamResults({ view }: { readonly view: ExamResultsView }) {
  const timings = computeMcqTimings(view.startedAt, view.questions);
  const totalMs = view.finishedAt ? new Date(view.finishedAt).getTime() - new Date(view.startedAt).getTime() : undefined;

  return (
    <div className="space-y-10">
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-xl font-semibold tracking-tight">Results</h1>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{EXAM_STATUS_LABELS[view.status] ?? view.status}</span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <Stat label="Score" value={`${view.score.percent}%`} />
          <Stat label="Correct" value={`${view.score.correct} / ${view.score.total}`} />
          <Stat label="Time taken" value={totalMs !== undefined ? formatDuration(totalMs) : '—'} />
        </div>
        {view.score.pending > 0 && (
          <p className="mt-3 text-sm text-amber-700 dark:text-amber-400">
            {view.score.pending} question{view.score.pending === 1 ? '' : 's'} still awaiting your self-grade.
          </p>
        )}
      </div>

      {view.score.byTopic.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">By topic</h2>
          <ul className="space-y-1.5">
            {view.score.byTopic.map((t) => (
              <li key={t.topicPath} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-zinc-700 dark:text-zinc-300">
                  <TopicTrail path={t.topicPath} linked />
                </span>
                <span className="tabular-nums text-zinc-500 dark:text-zinc-400">
                  {t.correct} / {t.total}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Review</h2>
        <ol className="space-y-3">
          {view.questions.map((q, i) => (
            <li key={q.questionId} className="rounded-lg border border-zinc-200 dark:border-zinc-800">
              <details>
                <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-2.5 [&::-webkit-details-marker]:hidden">
                  <ResultMark correct={q.correct} />
                  <span className="min-w-0 flex-1 truncate text-sm text-zinc-800 dark:text-zinc-200">
                    {i + 1}. <InlineMarkdown>{q.stem}</InlineMarkdown>
                  </span>
                  <DifficultyBadge difficulty={q.difficulty} />
                  {timings.has(q.questionId) && (
                    <span className="text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
                      {formatDuration(timings.get(q.questionId)!)}
                    </span>
                  )}
                </summary>
                <div className="border-t border-zinc-200 px-3 py-4 dark:border-zinc-800">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    <TopicTrail path={q.topicPath} linked />
                  </p>
                  {q.options && (
                    <ul className="mt-3 space-y-1.5">
                      {q.options.map((o) => (
                        <li
                          key={o.id}
                          className={`rounded-md px-2.5 py-1.5 text-sm ${
                            o.correct
                              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300'
                              : o.id === q.selectedOptionId
                                ? 'bg-rose-50 text-rose-800 dark:bg-rose-400/10 dark:text-rose-300'
                                : 'text-zinc-600 dark:text-zinc-400'
                          }`}
                        >
                          {o.text}
                          {o.id === q.selectedOptionId && !o.correct && ' — your answer'}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-4">
                    <AnswerBody answer={q.answer} />
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800">
      <p className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{value}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  );
}

function ResultMark({ correct }: { correct?: boolean }) {
  if (correct === undefined) {
    return <span className="size-2.5 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-600" title="Not yet graded" />;
  }
  return (
    <span
      className={`size-2.5 shrink-0 rounded-full ${correct ? 'bg-emerald-500' : 'bg-rose-500'}`}
      title={correct ? 'Correct' : 'Incorrect'}
    />
  );
}
