import { describe, it, expect, beforeEach } from 'vitest';
import type { Clock } from '@/shared/ports';
import { sequentialIds } from '@/shared/system-adapters';
import { InMemoryQuestionRepository, createQuestion, publishQuestion } from '@/modules/questions';
import {
  InMemoryExamSessionRepository,
  getExamResults,
  getExamRunnerView,
  listExamHistory,
  recordExamAnswer,
  selfGradeExamAnswer,
  startExam,
  submitExam,
  toggleExamFlag,
} from '@/modules/exams';

/**
 * Exercises the whole timed-exam flow — build, answer, flag, submit,
 * self-grade, results, history — against real (in-memory) questions, with no
 * database. ExamSession's own state-machine rules have their own zero-I/O
 * tests in tests/exam-session.test.ts and are not re-proven here.
 */

const mutableClock = (startIso: string): Clock & { advanceMinutes: (n: number) => void } => {
  let current = new Date(startIso);
  return {
    now: () => current,
    advanceMinutes(n: number) {
      current = new Date(current.getTime() + n * 60_000);
    },
  };
};

const buildDeps = () => ({
  questions: new InMemoryQuestionRepository(),
  examSessions: new InMemoryExamSessionRepository(),
  clock: mutableClock('2026-01-15T10:00:00Z'),
  ids: sequentialIds('exam'),
});
type Deps = ReturnType<typeof buildDeps>;

const questionIds = sequentialIds('q');

/** Publishes n MCQs and m short-answer questions, correct option always 'b'. */
async function seedQuestions(d: Deps, mcqCount: number, shortAnswerCount: number, topicPath = 'devops'): Promise<void> {
  for (let i = 0; i < mcqCount; i++) {
    const created = await createQuestion(
      {
        stem: `MCQ number ${i} in ${topicPath} about container networking and ports?`,
        type: 'mcq',
        difficulty: 'medium',
        topicPath,
        tags: [],
        answer: { modelAnswer: 'B is correct.', keyPoints: [] },
        options: [
          { id: 'a', text: 'Wrong', correct: false },
          { id: 'b', text: 'Right', correct: true },
        ],
        authorId: 'author-1',
      },
      { questions: d.questions, clock: d.clock, ids: questionIds },
    );
    if (!created.ok) throw new Error(created.error.message);
    const published = await publishQuestion(
      { id: created.value.id, moderatorId: 'admin', moderatorIsAdmin: true },
      { questions: d.questions, clock: d.clock },
    );
    if (!published.ok) throw new Error(published.error.message);
  }
  for (let i = 0; i < shortAnswerCount; i++) {
    const created = await createQuestion(
      {
        stem: `Short answer number ${i} in ${topicPath} about idempotent infrastructure changes?`,
        type: 'short-answer',
        difficulty: 'medium',
        topicPath,
        tags: [],
        answer: { modelAnswer: 'The model answer.', keyPoints: ['a point'] },
        authorId: 'author-1',
      },
      { questions: d.questions, clock: d.clock, ids: questionIds },
    );
    if (!created.ok) throw new Error(created.error.message);
    const published = await publishQuestion(
      { id: created.value.id, moderatorId: 'admin', moderatorIsAdmin: true },
      { questions: d.questions, clock: d.clock },
    );
    if (!published.ok) throw new Error(published.error.message);
  }
}

describe('startExam', () => {
  let d: Deps;
  beforeEach(() => { d = buildDeps(); });

  it('draws the requested number of published questions and withholds correct answers', async () => {
    await seedQuestions(d, 3, 0);

    const result = await startExam({ userId: 'u1', count: 2, durationMinutes: 20 }, d);

    expect(result.ok && result.value.questions).toHaveLength(2);
    expect(result.ok && (result.value.questions[0] as { options?: unknown[] }).options?.[0]).not.toHaveProperty('correct');
  });

  it('fails when nothing matches the filters', async () => {
    const result = await startExam({ userId: 'u1', count: 5, durationMinutes: 20, topicPaths: ['nonexistent'] }, d);

    expect(!result.ok && result.error.code).toBe('VALIDATION');
  });

  it('respects a topic filter', async () => {
    await seedQuestions(d, 2, 0, 'devops');
    await seedQuestions(d, 2, 0, 'security');

    const result = await startExam({ userId: 'u1', count: 5, durationMinutes: 20, topicPaths: ['security'] }, d);

    expect(result.ok && result.value.questions).toHaveLength(2);
    expect(result.ok && result.value.questions.every((q) => q.topicPath === 'security')).toBe(true);
  });
});

describe('recordExamAnswer and toggleExamFlag', () => {
  let d: Deps;
  beforeEach(() => { d = buildDeps(); });

  it("records an answer and never lets one user touch another's exam", async () => {
    await seedQuestions(d, 2, 0);
    const started = await startExam({ userId: 'alice', count: 2, durationMinutes: 20 }, d);
    if (!started.ok) throw new Error(started.error.message);
    const questionId = started.value.questions[0].questionId;

    const own = await recordExamAnswer({ examSessionId: started.value.id, userId: 'alice', questionId, selectedOptionId: 'b' }, d);
    const other = await recordExamAnswer({ examSessionId: started.value.id, userId: 'bob', questionId, selectedOptionId: 'a' }, d);

    expect(own.ok && own.value.questions.find((q) => q.questionId === questionId)?.selectedOptionId).toBe('b');
    expect(!other.ok && other.error.code).toBe('NOT_FOUND');
  });

  it('flags a question for review independently of answering it', async () => {
    await seedQuestions(d, 1, 0);
    const started = await startExam({ userId: 'u1', count: 1, durationMinutes: 20 }, d);
    if (!started.ok) throw new Error(started.error.message);
    const questionId = started.value.questions[0].questionId;

    const flagged = await toggleExamFlag({ examSessionId: started.value.id, userId: 'u1', questionId, flagged: true }, d);

    expect(flagged.ok && flagged.value.questions[0].flagged).toBe(true);
    expect(flagged.ok && flagged.value.questions[0].selectedOptionId).toBeUndefined();
  });
});

describe('submitExam and getExamRunnerView', () => {
  let d: Deps;
  beforeEach(() => { d = buildDeps(); });

  it('auto-submits and refuses the runner view once time is up, even without an explicit submit', async () => {
    await seedQuestions(d, 1, 0);
    const started = await startExam({ userId: 'u1', count: 1, durationMinutes: 10 }, d);
    if (!started.ok) throw new Error(started.error.message);

    d.clock.advanceMinutes(11);
    const runnerAfterExpiry = await getExamRunnerView({ examSessionId: started.value.id, userId: 'u1' }, d);

    expect(!runnerAfterExpiry.ok && runnerAfterExpiry.error.code).toBe('CONFLICT');
    const results = await getExamResults({ examSessionId: started.value.id, userId: 'u1' }, d);
    expect(results.ok && results.value.status).toBe('graded'); // auto-submitted server-side
  });

  it('goes straight to graded for an all-MCQ exam and scores it', async () => {
    await seedQuestions(d, 2, 0);
    const started = await startExam({ userId: 'u1', count: 2, durationMinutes: 20 }, d);
    if (!started.ok) throw new Error(started.error.message);
    const [q1, q2] = started.value.questions;
    await recordExamAnswer({ examSessionId: started.value.id, userId: 'u1', questionId: q1.questionId, selectedOptionId: 'b' }, d);
    await recordExamAnswer({ examSessionId: started.value.id, userId: 'u1', questionId: q2.questionId, selectedOptionId: 'a' }, d);

    const submitted = await submitExam({ examSessionId: started.value.id, userId: 'u1' }, d);

    expect(submitted.ok && submitted.value.status).toBe('graded');
    expect(submitted.ok && submitted.value.score).toMatchObject({ correct: 1, total: 2, pending: 0, percent: 50 });
  });

  it('goes to awaiting-review when a short-answer question needs self-grading, and getExamResults refuses while still in-progress', async () => {
    await seedQuestions(d, 1, 1);
    const started = await startExam({ userId: 'u1', count: 2, durationMinutes: 20 }, d);
    if (!started.ok) throw new Error(started.error.message);

    const midExam = await getExamResults({ examSessionId: started.value.id, userId: 'u1' }, d);
    expect(!midExam.ok && midExam.error.code).toBe('CONFLICT');

    const submitted = await submitExam({ examSessionId: started.value.id, userId: 'u1' }, d);
    expect(submitted.ok && submitted.value.status).toBe('awaiting-review');
    expect(submitted.ok && submitted.value.score.pending).toBe(1);
  });
});

describe('selfGradeExamAnswer', () => {
  let d: Deps;
  beforeEach(() => { d = buildDeps(); });

  it('finalises the score once every non-MCQ question is graded', async () => {
    await seedQuestions(d, 0, 2);
    const started = await startExam({ userId: 'u1', count: 2, durationMinutes: 20 }, d);
    if (!started.ok) throw new Error(started.error.message);
    await submitExam({ examSessionId: started.value.id, userId: 'u1' }, d);
    const [q1, q2] = started.value.questions;

    const oneGraded = await selfGradeExamAnswer({ examSessionId: started.value.id, userId: 'u1', questionId: q1.questionId, correct: true }, d);
    expect(oneGraded.ok && oneGraded.value.status).toBe('awaiting-review');

    const done = await selfGradeExamAnswer({ examSessionId: started.value.id, userId: 'u1', questionId: q2.questionId, correct: false }, d);
    expect(done.ok && done.value.status).toBe('graded');
    expect(done.ok && done.value.score).toMatchObject({ correct: 1, total: 2, pending: 0 });
  });

  it('reveals the model answer and correct MCQ option once results are viewable', async () => {
    await seedQuestions(d, 1, 0);
    const started = await startExam({ userId: 'u1', count: 1, durationMinutes: 20 }, d);
    if (!started.ok) throw new Error(started.error.message);
    await submitExam({ examSessionId: started.value.id, userId: 'u1' }, d);

    const results = await getExamResults({ examSessionId: started.value.id, userId: 'u1' }, d);

    expect(results.ok && results.value.questions[0].answer.modelAnswer).toBe('B is correct.');
    expect(results.ok && results.value.questions[0].options?.some((o) => o.correct)).toBe(true);
  });
});

describe('listExamHistory', () => {
  it('lists a user\'s own exams, most recently started first', async () => {
    const d = buildDeps();
    await seedQuestions(d, 1, 0);
    const first = await startExam({ userId: 'u1', count: 1, durationMinutes: 20 }, d);
    d.clock.advanceMinutes(60);
    const second = await startExam({ userId: 'u1', count: 1, durationMinutes: 20 }, d);
    await startExam({ userId: 'someone-else', count: 1, durationMinutes: 20 }, d);
    if (!first.ok || !second.ok) throw new Error('setup failed');

    const history = await listExamHistory({ userId: 'u1' }, d);

    expect(history.map((h) => h.id)).toEqual([second.value.id, first.value.id]);
  });
});
