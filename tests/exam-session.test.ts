import { describe, it, expect } from 'vitest';
import { ExamSession, computeScore, type ExamQuestionSnapshot } from '@/modules/exams';

/**
 * ExamSession and computeScore need no I/O at all — the whole timed-exam
 * lifecycle (answer, flag, submit, self-grade, score) is exercised here with
 * plain objects and fixed dates, the same proof-of-abstraction the questions
 * and practice modules already carry.
 */

const NOW = new Date('2026-01-15T10:00:00Z');
const soon = (minutes: number) => new Date(NOW.getTime() + minutes * 60_000);

const mcq = (questionId: string, correctId = 'b', topicPath = 'devops'): ExamQuestionSnapshot => ({
  questionId,
  stem: `MCQ ${questionId}`,
  type: 'mcq',
  difficulty: 'medium',
  topicPath,
  options: [
    { id: 'a', text: 'Wrong', correct: correctId === 'a' },
    { id: 'b', text: 'Right', correct: correctId === 'b' },
  ],
  answer: { modelAnswer: 'Right is correct.', keyPoints: [] },
});

const shortAnswer = (questionId: string, topicPath = 'security'): ExamQuestionSnapshot => ({
  questionId,
  stem: `Short answer ${questionId}`,
  type: 'short-answer',
  difficulty: 'medium',
  topicPath,
  answer: { modelAnswer: 'The model answer.', keyPoints: ['a point'] },
});

const start = (snapshots: ExamQuestionSnapshot[], overrides: Partial<{ count: number; durationMinutes: number }> = {}) =>
  ExamSession.start({
    id: 'exam-1',
    userId: 'u1',
    config: { count: snapshots.length, durationMinutes: 30, ...overrides },
    snapshots,
    now: NOW,
  });

/** Throws on a validation failure — every happy-path test starts from a known-good exam. */
function startOk(snapshots: ExamQuestionSnapshot[], overrides: Partial<{ count: number; durationMinutes: number }> = {}): ExamSession {
  const result = start(snapshots, overrides);
  if (!result.ok) throw new Error(result.error.message);
  return result.value;
}

describe('ExamSession.start', () => {
  it('rejects a config with no matching questions', () => {
    const result = start([], { count: 10 });
    expect(!result.ok && result.error.message).toMatch(/No published questions/);
  });

  it('rejects a duration outside 1–240 minutes', () => {
    const result = start([mcq('q1')], { durationMinutes: 0 });
    expect(!result.ok && result.error.code).toBe('VALIDATION');
  });

  it('starts in-progress with no answers yet', () => {
    const exam = startOk([mcq('q1'), shortAnswer('q2')]);
    expect(exam.status).toBe('in-progress');
    expect(exam.answers.size).toBe(0);
    expect(exam.deadline).toEqual(soon(30));
  });
});

describe('recordAnswer', () => {
  it('records a valid MCQ pick and can change it', () => {
    const first = startOk([mcq('q1')]).recordAnswer('q1', 'a', soon(1));
    const second = first.ok ? first.value.recordAnswer('q1', 'b', soon(2)) : first;

    expect(second.ok && second.value.answers.get('q1')?.selectedOptionId).toBe('b');
  });

  it('rejects an answer for a question not in this exam, an unknown option, and a non-MCQ answer', () => {
    const exam = startOk([mcq('q1'), shortAnswer('q2')]);

    expect(exam.recordAnswer('nope', 'a', soon(1)).ok).toBe(false);
    expect(exam.recordAnswer('q1', 'z', soon(1)).ok).toBe(false);
    expect(exam.recordAnswer('q2', 'a', soon(1)).ok).toBe(false);
  });

  it('refuses to record an answer once time is up, even though status is still in-progress', () => {
    const exam = startOk([mcq('q1')], { durationMinutes: 10 });

    const result = exam.recordAnswer('q1', 'b', soon(11));

    expect(!result.ok && result.error.message).toMatch(/Time is up/);
  });

  it('preserves the flag when an answer is recorded, and vice versa', () => {
    const flagged = startOk([mcq('q1')]).toggleFlag('q1', true, soon(1));
    const answered = flagged.ok ? flagged.value.recordAnswer('q1', 'a', soon(2)) : flagged;

    expect(answered.ok && answered.value.answers.get('q1')?.flagged).toBe(true);

    const unflagged = answered.ok ? answered.value.toggleFlag('q1', false, soon(3)) : answered;
    expect(unflagged.ok && unflagged.value.answers.get('q1')?.selectedOptionId).toBe('a');
    expect(unflagged.ok && unflagged.value.answers.get('q1')?.flagged).toBe(false);
  });
});

describe('submit', () => {
  it('goes straight to graded when every question is MCQ', () => {
    const submitted = startOk([mcq('q1'), mcq('q2')]).submit(soon(5));

    expect(submitted.ok && submitted.value.status).toBe('graded');
    expect(submitted.ok && submitted.value.finishedAt).toEqual(soon(5));
  });

  it('goes to awaiting-review when a non-MCQ question needs self-grading', () => {
    const submitted = startOk([mcq('q1'), shortAnswer('q2')]).submit(soon(5));

    expect(submitted.ok && submitted.value.status).toBe('awaiting-review');
  });

  it('can be submitted late, and cannot be submitted twice', () => {
    const exam = startOk([mcq('q1')], { durationMinutes: 10 });

    const late = exam.submit(soon(20));
    expect(late.ok).toBe(true);

    const again = late.ok ? late.value.submit(soon(21)) : late;
    expect(!again.ok && again.error.message).toMatch(/already been submitted/);
  });
});

describe('selfGrade', () => {
  function awaitingReview(): ExamSession {
    const submitted = startOk([mcq('q1'), shortAnswer('q2'), shortAnswer('q3')]).submit(soon(5));
    if (!submitted.ok) throw new Error(submitted.error.message);
    return submitted.value;
  }

  it('rejects self-grading an MCQ and self-grading before submission', () => {
    expect(startOk([mcq('q1')]).selfGrade('q1', true, soon(1)).ok).toBe(false);
    expect(awaitingReview().selfGrade('q1', true, soon(6)).ok).toBe(false); // q1 is the MCQ
  });

  it('stays awaiting-review until every non-MCQ question is graded, then moves to graded', () => {
    const oneGraded = awaitingReview().selfGrade('q2', true, soon(6));
    expect(oneGraded.ok && oneGraded.value.status).toBe('awaiting-review');

    const bothGraded = oneGraded.ok ? oneGraded.value.selfGrade('q3', false, soon(7)) : oneGraded;
    expect(bothGraded.ok && bothGraded.value.status).toBe('graded');
  });
});

describe('computeScore', () => {
  it('scores an unanswered MCQ as wrong, not pending', () => {
    const score = computeScore([mcq('q1')], new Map());

    expect(score).toMatchObject({ correct: 0, total: 1, pending: 0, percent: 0 });
  });

  it('excludes an ungraded non-MCQ question from total and percent, counting it as pending', () => {
    const score = computeScore(
      [mcq('q1'), shortAnswer('q2')],
      new Map([['q1', { questionId: 'q1', selectedOptionId: 'b', flagged: false }]]),
    );

    expect(score).toMatchObject({ correct: 1, total: 1, pending: 1, percent: 100 });
  });

  it('breaks the score down by topic', () => {
    const score = computeScore(
      [mcq('q1', 'b', 'devops'), mcq('q2', 'b', 'devops'), mcq('q3', 'b', 'security')],
      new Map([
        ['q1', { questionId: 'q1', selectedOptionId: 'b', flagged: false }], // correct
        ['q2', { questionId: 'q2', selectedOptionId: 'a', flagged: false }], // wrong
        ['q3', { questionId: 'q3', selectedOptionId: 'b', flagged: false }], // correct
      ]),
    );

    expect(score.byTopic).toEqual([
      { topicPath: 'devops', correct: 1, total: 2 },
      { topicPath: 'security', correct: 1, total: 1 },
    ]);
    expect(score.percent).toBe(67); // round(2/3 * 100)
  });

  it('is 0 percent, not NaN, when nothing is graded yet', () => {
    const score = computeScore([shortAnswer('q1')], new Map());

    expect(score.percent).toBe(0);
  });
});
