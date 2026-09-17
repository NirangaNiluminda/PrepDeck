import { describe, it, expect } from 'vitest';
import {
  EASE_DEFAULT,
  EASE_MIN,
  NEW_REVIEW_STATE,
  buildTopicMastery,
  questionMastery,
  sm2Scheduler,
  weakestTopics,
  type Rating,
} from '@/modules/practice';

/**
 * THE TEST THAT PROVES THE SCHEDULER IS PURE.
 *
 * No Date.now(), no database, no clock injected even — sm2Scheduler.next()
 * takes `now` only to compute nothing here (ReviewCard adds the interval to
 * it). If a future change needs real time inside the scheduler itself, that
 * is a sign the algorithm stopped being a pure function.
 */

const NOW = new Date('2026-01-15T10:00:00Z');
const review = (state = NEW_REVIEW_STATE, rating: Rating) => sm2Scheduler.next(state, rating, NOW);

describe('sm2Scheduler', () => {
  it('graduates a new card through the fixed learning steps', () => {
    const first = review(NEW_REVIEW_STATE, 'good');
    expect(first.interval).toBe(1);

    const second = review(first, 'good');
    expect(second.interval).toBe(6);

    const third = review(second, 'good');
    expect(third.interval).toBe(Math.round(6 * second.easeFactor));
  });

  it('gives an easy new card a longer first interval than a good one', () => {
    const easy = review(NEW_REVIEW_STATE, 'easy');
    const good = review(NEW_REVIEW_STATE, 'good');

    expect(easy.interval).toBeGreaterThan(good.interval);
  });

  it('sends "again" back to a 1-day interval from any stage', () => {
    const established = { interval: 40, easeFactor: 2.8, lapses: 0 };

    expect(review(NEW_REVIEW_STATE, 'again').interval).toBe(1);
    expect(review({ interval: 6, easeFactor: 2.5, lapses: 0 }, 'again').interval).toBe(1);
    expect(review(established, 'again').interval).toBe(1);
  });

  it('counts a lapse only when an established card (interval > 1) is forgotten', () => {
    const newCard = review(NEW_REVIEW_STATE, 'again');
    const onceReviewed = review({ interval: 1, easeFactor: 2.5, lapses: 0 }, 'again');
    const established = review({ interval: 20, easeFactor: 2.5, lapses: 2 }, 'again');

    expect(newCard.lapses).toBe(0);
    expect(onceReviewed.lapses).toBe(0);
    expect(established.lapses).toBe(3);
  });

  it('grows an established interval by the ease factor on "good"', () => {
    const state = { interval: 10, easeFactor: 2.0, lapses: 0 };

    const result = review(state, 'good');

    expect(result.interval).toBe(20); // round(10 * 2.0)
    expect(result.easeFactor).toBe(2.0); // "good" does not move the ease factor
  });

  it('grows an established interval more on "easy" than "good", and less on "hard"', () => {
    const state = { interval: 10, easeFactor: 2.0, lapses: 0 };

    const hard = review(state, 'hard');
    const good = review(state, 'good');
    const easy = review(state, 'easy');

    expect(hard.interval).toBeLessThan(good.interval);
    expect(good.interval).toBeLessThan(easy.interval);
  });

  it('moves the ease factor by rating and floors it at EASE_MIN', () => {
    const barelyAbove = { interval: 10, easeFactor: EASE_MIN + 0.05, lapses: 0 };

    expect(review(barelyAbove, 'again').easeFactor).toBe(EASE_MIN);
    expect(review({ interval: 10, easeFactor: EASE_DEFAULT, lapses: 0 }, 'hard').easeFactor).toBeCloseTo(2.35);
    expect(review({ interval: 10, easeFactor: EASE_DEFAULT, lapses: 0 }, 'easy').easeFactor).toBeCloseTo(2.65);
  });

  it('never lets "again" push the ease factor below EASE_MIN even repeatedly', () => {
    let state = NEW_REVIEW_STATE;
    for (let i = 0; i < 20; i++) state = review(state, 'again');

    expect(state.easeFactor).toBe(EASE_MIN);
  });

  it('is a pure function: identical input always produces identical output', () => {
    const state = { interval: 14, easeFactor: 2.3, lapses: 1 };

    const a = sm2Scheduler.next(state, 'good', NOW);
    const b = sm2Scheduler.next(state, 'good', new Date('2099-01-01T00:00:00Z'));

    expect(a).toEqual(b);
  });
});

describe('questionMastery', () => {
  it('is zero for a card that has never been successfully reviewed', () => {
    expect(questionMastery({ interval: 0, easeFactor: EASE_DEFAULT })).toBe(0);
  });

  it('rises as a card matures towards a 21-day interval with a growing ease factor', () => {
    const early = questionMastery({ interval: 6, easeFactor: EASE_DEFAULT });
    const maturing = questionMastery({ interval: 21, easeFactor: EASE_DEFAULT });
    const strong = questionMastery({ interval: 60, easeFactor: 3.2 });

    expect(early).toBeGreaterThan(0);
    expect(maturing).toBeGreaterThan(early);
    expect(strong).toBeGreaterThan(maturing);
    expect(strong).toBeLessThanOrEqual(100);
  });

  it('never exceeds 100 even for a very mature, high-ease card', () => {
    expect(questionMastery({ interval: 400, easeFactor: 4.5 })).toBeLessThanOrEqual(100);
  });
});

describe('buildTopicMastery', () => {
  it('rolls mastery up to ancestors as an average, leaving untouched topics unscored', () => {
    const tree = buildTopicMastery([
      { topicPath: 'devops/docker', mastery: 80 },
      { topicPath: 'devops/iac', mastery: 40 },
      { topicPath: 'security/web', mastery: 60 },
    ]);

    const devops = tree.find((t) => t.slug === 'devops')!;
    expect(devops.mastery).toBe(60); // average of 80 and 40
    expect(devops.reviewedCount).toBe(2);
    expect(devops.children.find((c) => c.slug === 'docker')?.mastery).toBe(80);

    const security = tree.find((t) => t.slug === 'security')!;
    expect(security.mastery).toBe(60);
  });

  it('averages multiple questions under the same exact topic', () => {
    const tree = buildTopicMastery([
      { topicPath: 'dsa/sorting', mastery: 20 },
      { topicPath: 'dsa/sorting', mastery: 100 },
    ]);

    expect(tree[0].mastery).toBe(60);
    expect(tree[0].reviewedCount).toBe(2);
  });
});

describe('weakestTopics', () => {
  it('excludes topics below the minimum sample size and sorts ascending by mastery', () => {
    const tree = buildTopicMastery([
      { topicPath: 'devops', mastery: 90 },
      { topicPath: 'devops', mastery: 70 },
      { topicPath: 'security', mastery: 10 },
      { topicPath: 'security', mastery: 30 },
      { topicPath: 'dsa', mastery: 5 }, // only one review — excluded by minReviewed
    ]);

    const weakest = weakestTopics(tree, { minReviewed: 2, limit: 5 });

    expect(weakest.map((t) => t.slug)).toEqual(['security', 'devops']);
  });

  it('respects the limit', () => {
    const tree = buildTopicMastery([
      { topicPath: 'a', mastery: 10 },
      { topicPath: 'a', mastery: 10 },
      { topicPath: 'b', mastery: 20 },
      { topicPath: 'b', mastery: 20 },
      { topicPath: 'c', mastery: 30 },
      { topicPath: 'c', mastery: 30 },
    ]);

    expect(weakestTopics(tree, { minReviewed: 1, limit: 2 })).toHaveLength(2);
  });
});
