// Shared by app/actions/exams.ts (logging practice attempts) and the results
// page (showing time per question) — both run server-side, so sharing this
// plain function between a 'use server' file and a Server Component is fine;
// it never needs to cross into client code.

export interface TimedAnswer {
  readonly questionId: string;
  readonly type: string;
  readonly answeredAt?: string;
}

/**
 * Gap since the previous MCQ was answered, or since the exam started for the
 * first one. Only MCQ answeredAt timestamps happen during the timed portion —
 * a non-MCQ question is self-graded afterward, in the untimed review phase,
 * so it gets no entry here; see the exams module's own note on this.
 */
export function computeMcqTimings(startedAt: string, questions: readonly TimedAnswer[]): Map<string, number> {
  const answered = questions
    .filter((q) => q.type === 'mcq' && q.answeredAt)
    .sort((a, b) => new Date(a.answeredAt!).getTime() - new Date(b.answeredAt!).getTime());

  const timings = new Map<string, number>();
  let previousAt = new Date(startedAt).getTime();
  for (const q of answered) {
    const at = new Date(q.answeredAt!).getTime();
    timings.set(q.questionId, Math.max(0, at - previousAt));
    previousAt = at;
  }
  return timings;
}
