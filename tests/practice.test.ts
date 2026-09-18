import { describe, it, expect, beforeEach } from 'vitest';
import type { Clock } from '@/shared/ports';
import { sequentialIds } from '@/shared/system-adapters';
import { InMemoryQuestionRepository, createQuestion, publishQuestion } from '@/modules/questions';
import {
  InMemoryAttemptRepository,
  InMemoryReviewCardRepository,
  getDueQueue,
  getProgress,
  getWeakAreas,
  recordAttempt,
  sm2Scheduler,
} from '@/modules/practice';

/**
 * Integration-level: proves the wiring (recordAttempt drives the scheduler
 * and persists both sides; getDueQueue and getProgress join with the
 * questions module through its public API). The scheduler's own arithmetic
 * and the mastery/streak formulas have their own zero-I/O tests in
 * tests/scheduler.test.ts and are not re-verified here.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

const mutableClock = (startIso: string): Clock & { advanceDays: (n: number) => void } => {
  let current = new Date(startIso);
  return {
    now: () => current,
    advanceDays(n: number) {
      current = new Date(current.getTime() + n * DAY_MS);
    },
  };
};

const buildDeps = () => ({
  questions: new InMemoryQuestionRepository(),
  reviewCards: new InMemoryReviewCardRepository(),
  attempts: new InMemoryAttemptRepository(),
  scheduler: sm2Scheduler,
  clock: mutableClock('2026-01-15T10:00:00Z'),
  ids: sequentialIds('attempt'),
});
type Deps = ReturnType<typeof buildDeps>;

const questionIds = sequentialIds('q');

async function seedPublished(d: Deps, over: Partial<Parameters<typeof createQuestion>[0]> = {}): Promise<string> {
  const qDeps = { questions: d.questions, clock: d.clock, ids: questionIds };
  const created = await createQuestion(
    {
      stem: 'What is the difference between TCP and UDP at the transport layer?',
      type: 'short-answer',
      difficulty: 'medium',
      topicPath: 'devops/iac',
      tags: [],
      answer: { modelAnswer: 'An answer.', keyPoints: [] },
      authorId: 'author-1',
      ...over,
    },
    qDeps,
  );
  if (!created.ok) throw new Error(created.error.message);
  const published = await publishQuestion({ id: created.value.id, moderatorId: 'admin', moderatorIsAdmin: true }, qDeps);
  if (!published.ok) throw new Error(published.error.message);
  return created.value.id;
}

describe('recordAttempt', () => {
  let d: Deps;
  beforeEach(() => { d = buildDeps(); });

  it('creates a review card lazily on the first attempt', async () => {
    const questionId = await seedPublished(d);

    const result = await recordAttempt({ userId: 'u1', questionId, rating: 'good', timeTakenMs: 4000 }, d);

    expect(result.ok).toBe(true);
    expect(result.ok && result.value.interval).toBe(1);
    const card = await d.reviewCards.findByUserAndQuestion('u1', questionId);
    expect(card?.easeFactor).toBe(2.5);
  });

  it('reschedules the same card rather than creating a second one', async () => {
    const questionId = await seedPublished(d);
    await recordAttempt({ userId: 'u1', questionId, rating: 'good', timeTakenMs: 1000 }, d);

    await recordAttempt({ userId: 'u1', questionId, rating: 'good', timeTakenMs: 1000 }, d);

    expect(d.reviewCards.size).toBe(1);
    const card = await d.reviewCards.findByUserAndQuestion('u1', questionId);
    expect(card?.interval).toBe(6);
  });

  it('logs an attempt every time, unlike the review card', async () => {
    const questionId = await seedPublished(d);

    await recordAttempt({ userId: 'u1', questionId, rating: 'good', timeTakenMs: 1000 }, d);
    await recordAttempt({ userId: 'u1', questionId, rating: 'hard', timeTakenMs: 2000 }, d);

    expect(d.attempts.size).toBe(2);
  });

  it('rejects an unknown rating and a missing user without writing anything', async () => {
    const questionId = await seedPublished(d);

    const badRating = await recordAttempt({ userId: 'u1', questionId, rating: 'meh', timeTakenMs: 0 }, d);
    const noUser = await recordAttempt({ userId: '', questionId, rating: 'good', timeTakenMs: 0 }, d);

    expect(!badRating.ok && badRating.error.code).toBe('VALIDATION');
    expect(!noUser.ok && noUser.error.code).toBe('VALIDATION');
    expect(d.reviewCards.size).toBe(0);
    expect(d.attempts.size).toBe(0);
  });

  it('keeps one user\'s cards separate from another\'s for the same question', async () => {
    const questionId = await seedPublished(d);
    await recordAttempt({ userId: 'alice', questionId, rating: 'again', timeTakenMs: 0 }, d);

    await recordAttempt({ userId: 'bob', questionId, rating: 'easy', timeTakenMs: 0 }, d);

    expect((await d.reviewCards.findByUserAndQuestion('alice', questionId))?.interval).toBe(1);
    expect((await d.reviewCards.findByUserAndQuestion('bob', questionId))?.interval).toBe(4);
  });
});

describe('getDueQueue', () => {
  let d: Deps;
  beforeEach(() => { d = buildDeps(); });

  it('offers unseen published questions as new cards up to the daily cap', async () => {
    for (let i = 0; i < 3; i++) await seedPublished(d, { stem: `Question number ${i} about networking basics?` });

    const queue = await getDueQueue({ userId: 'u1', now: d.clock.now(), newCardCap: 2, limit: 10 }, d);

    expect(queue).toHaveLength(2);
    expect(queue.every((c) => c.isNew)).toBe(true);
  });

  it('brings due cards before new ones, oldest due date first', async () => {
    const soonId = await seedPublished(d, { stem: 'This card is due soon, reviewed with a hard rating.' });
    const laterId = await seedPublished(d, { stem: 'This card is due later, reviewed with a good rating.' });
    await recordAttempt({ userId: 'u1', questionId: soonId, rating: 'hard', timeTakenMs: 0 }, d); // due in 1 day
    await recordAttempt({ userId: 'u1', questionId: laterId, rating: 'good', timeTakenMs: 0 }, d); // due in 1 day too, but reviewed after

    d.clock.advanceDays(2);
    const queue = await getDueQueue({ userId: 'u1', now: d.clock.now(), newCardCap: 0, limit: 10 }, d);

    expect(queue.map((c) => c.question.id)).toEqual([soonId, laterId]);
    expect(queue.every((c) => !c.isNew)).toBe(true);
  });

  it('does not offer a card that is not due yet', async () => {
    const questionId = await seedPublished(d);
    await recordAttempt({ userId: 'u1', questionId, rating: 'good', timeTakenMs: 0 }, d); // due in 1 day

    const queue = await getDueQueue({ userId: 'u1', now: d.clock.now(), newCardCap: 0, limit: 10 }, d);

    expect(queue).toHaveLength(0);
  });

  it('never offers an already-seen question as new', async () => {
    const questionId = await seedPublished(d);
    await recordAttempt({ userId: 'u1', questionId, rating: 'good', timeTakenMs: 0 }, d);

    const queue = await getDueQueue({ userId: 'u1', now: d.clock.now(), newCardCap: 10, limit: 10 }, d);

    expect(queue).toHaveLength(0); // the one question that exists is already seen, and not due for a day
  });

  it('previews the interval each rating would produce, from the card\'s real state for a due card and fresh for a new one', async () => {
    const dueId = await seedPublished(d, { stem: 'A card already reviewed once, due again soon.' });
    await seedPublished(d, { stem: 'A card never reviewed before, offered as new.' });
    await recordAttempt({ userId: 'u1', questionId: dueId, rating: 'good', timeTakenMs: 0 }, d); // due in 6 days
    d.clock.advanceDays(6);

    const queue = await getDueQueue({ userId: 'u1', now: d.clock.now(), newCardCap: 10, limit: 10 }, d);

    const due = queue.find((c) => c.question.id === dueId)!;
    expect(due.previewIntervals.again).toBe(1);
    expect(due.previewIntervals.good).toBeGreaterThan(1); // grown from the established interval, not a fresh-card step

    const fresh = queue.find((c) => c.isNew)!;
    expect(fresh.previewIntervals).toEqual({ again: 1, hard: 1, good: 1, easy: 4 }); // the fixed new-card learning steps
  });

  it('restricts to a topic and its descendants', async () => {
    await seedPublished(d, { stem: 'A DevOps question about pipelines and deploys.', topicPath: 'devops/ci-cd' });
    await seedPublished(d, { stem: 'A database question about indexes and joins.', topicPath: 'databases/indexing' });

    const queue = await getDueQueue({ userId: 'u1', now: d.clock.now(), newCardCap: 10, limit: 10, topicPath: 'devops' }, d);

    expect(queue).toHaveLength(1);
    expect(queue[0].question.topicPath).toBe('devops/ci-cd');
  });

  it('biases new material toward a preferred difficulty, without affecting due cards', async () => {
    const easyId = await seedPublished(d, { stem: 'An easy question about HTTP verbs.', difficulty: 'easy' });
    await seedPublished(d, { stem: 'A hard question about consensus algorithms.', difficulty: 'hard' });
    await recordAttempt({ userId: 'u1', questionId: easyId, rating: 'hard', timeTakenMs: 0 }, d); // due in 3 days, still "easy"
    d.clock.advanceDays(3);

    const queue = await getDueQueue(
      { userId: 'u1', now: d.clock.now(), newCardCap: 10, limit: 10, preferredDifficulty: 'hard' },
      d,
    );

    // The easy card is due and comes back regardless of preference; only the
    // *new* pool — the hard question — is filtered by it.
    expect(queue.map((c) => c.question.difficulty).sort()).toEqual(['easy', 'hard']);
  });

  it("draws the daily new-card cap's boundary in the user's own timezone, not UTC", async () => {
    const q1 = await seedPublished(d, { stem: 'The question each user reviews earlier in the day.' });
    await seedPublished(d, { stem: 'A second question, available to introduce as new.' });

    // 10:00 UTC on the 15th is 15:30 on the 15th in Colombo (UTC+5:30) — the
    // same calendar day there too, just later. Reviewing here uses up one
    // slot of a newCardCap: 1 budget for whichever zone counts it as "today".
    for (const userId of ['utc-user', 'colombo-user']) {
      await recordAttempt({ userId, questionId: q1, rating: 'good', timeTakenMs: 0 }, { ...d, clock: { now: () => new Date('2026-01-15T10:00:00Z') } });
    }

    // By 22:00 UTC the same day, it's already 03:30 on the 16th in Colombo —
    // the review above now falls on *yesterday* there, freeing the slot.
    const now = new Date('2026-01-15T22:00:00Z');
    const utcQueue = await getDueQueue({ userId: 'utc-user', now, newCardCap: 1, limit: 10, timezone: 'UTC' }, d);
    const colomboQueue = await getDueQueue({ userId: 'colombo-user', now, newCardCap: 1, limit: 10, timezone: 'Asia/Colombo' }, d);

    expect(utcQueue).toHaveLength(0); // budget already spent today, UTC
    expect(colomboQueue).toHaveLength(1); // that review was "yesterday" in Colombo — budget is free again
  });
});

describe('getProgress', () => {
  let d: Deps;
  beforeEach(() => { d = buildDeps(); });

  it('reports zero cards due and no topics before anything has been reviewed', async () => {
    const progress = await getProgress({ userId: 'u1', now: d.clock.now() }, d);

    expect(progress).toEqual({ streak: 0, cardsDue: 0, totalReviewed: 0, topics: [] });
  });

  it('counts cards due today and rolls reviewed questions up into topic mastery', async () => {
    const devopsId = await seedPublished(d, { stem: 'A DevOps question about container networking.', topicPath: 'devops/docker' });
    await seedPublished(d, { stem: 'A second DevOps question about IaC state files.', topicPath: 'devops/iac' });
    await recordAttempt({ userId: 'u1', questionId: devopsId, rating: 'again', timeTakenMs: 0 }, d); // due tomorrow, not today

    const progress = await getProgress({ userId: 'u1', now: d.clock.now() }, d);

    expect(progress.cardsDue).toBe(0);
    expect(progress.totalReviewed).toBe(1);
    expect(progress.topics.find((t) => t.slug === 'devops')?.reviewedCount).toBe(1);
  });

  it('builds a streak from distinct practice days, unbroken by multiple attempts on the same day', async () => {
    const questionId = await seedPublished(d);
    await recordAttempt({ userId: 'u1', questionId, rating: 'good', timeTakenMs: 0 }, d); // day 1, attempt 1
    await recordAttempt({ userId: 'u1', questionId, rating: 'good', timeTakenMs: 0 }, d); // day 1, attempt 2 (same day)
    d.clock.advanceDays(1);
    await recordAttempt({ userId: 'u1', questionId, rating: 'good', timeTakenMs: 0 }, d); // day 2

    const progress = await getProgress({ userId: 'u1', now: d.clock.now() }, d);

    expect(progress.streak).toBe(2);
  });
});

describe('getWeakAreas', () => {
  let d: Deps;
  beforeEach(() => { d = buildDeps(); });

  it('suggests the lowest-mastery topic with enough reviewed questions', async () => {
    const strongA = await seedPublished(d, { stem: 'Strong topic question A about load balancers.', topicPath: 'devops' });
    const strongB = await seedPublished(d, { stem: 'Strong topic question B about reverse proxies.', topicPath: 'devops' });
    const weakA = await seedPublished(d, { stem: 'Weak topic question A about race conditions.', topicPath: 'concurrency' });
    const weakB = await seedPublished(d, { stem: 'Weak topic question B about deadlocks in databases.', topicPath: 'concurrency' });

    for (const id of [strongA, strongB]) {
      await recordAttempt({ userId: 'u1', questionId: id, rating: 'good', timeTakenMs: 0 }, d);
      d.clock.advanceDays(400); // let the card mature so its mastery score is high
      await recordAttempt({ userId: 'u1', questionId: id, rating: 'easy', timeTakenMs: 0 }, d);
      d.clock.advanceDays(-400);
    }
    for (const id of [weakA, weakB]) {
      await recordAttempt({ userId: 'u1', questionId: id, rating: 'again', timeTakenMs: 0 }, d);
    }

    const weakest = await getWeakAreas({ userId: 'u1', minReviewed: 2 }, d);

    expect(weakest[0]?.slug).toBe('concurrency');
  });

  it('leaves out a topic with fewer reviewed questions than the minimum', async () => {
    const oneReviewId = await seedPublished(d, { stem: 'Only one question is reviewed in this topic.', topicPath: 'security' });
    await recordAttempt({ userId: 'u1', questionId: oneReviewId, rating: 'again', timeTakenMs: 0 }, d);

    const weakest = await getWeakAreas({ userId: 'u1', minReviewed: 2 }, d);

    expect(weakest).toHaveLength(0);
  });
});
