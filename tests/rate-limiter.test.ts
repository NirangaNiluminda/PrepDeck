import { describe, it, expect } from 'vitest';
import { InMemoryRateLimiter } from '@/shared/rate-limiter';

// Advances one second per call so window boundaries are observable.
const tickingClock = (startSeconds = 0) => {
  let seconds = startSeconds;
  return { now: () => new Date(seconds++ * 1000) };
};

/** A clock the test can move forward on demand, to cross a window boundary. */
const settableClock = (startMs = 0) => {
  let ms = startMs;
  return { now: () => new Date(ms), advance: (byMs: number) => { ms += byMs; } };
};

describe('InMemoryRateLimiter', () => {
  it('allows up to the limit within a window', async () => {
    const limiter = new InMemoryRateLimiter(tickingClock());

    const results = await Promise.all([
      limiter.consume('k', 3, 60),
      limiter.consume('k', 3, 60),
      limiter.consume('k', 3, 60),
    ]);

    expect(results).toEqual([true, true, true]);
  });

  it('rejects once the limit is exceeded in the same window', async () => {
    const limiter = new InMemoryRateLimiter(tickingClock());
    await limiter.consume('k', 2, 60);
    await limiter.consume('k', 2, 60);

    const third = await limiter.consume('k', 2, 60);

    expect(third).toBe(false);
  });

  it('keeps separate keys independent', async () => {
    const limiter = new InMemoryRateLimiter(tickingClock());
    await limiter.consume('a', 1, 60);

    const other = await limiter.consume('b', 1, 60);

    expect(other).toBe(true);
  });

  it('resets once the window rolls over', async () => {
    const clock = settableClock(0);
    const limiter = new InMemoryRateLimiter(clock);
    await limiter.consume('k', 1, 1); // window [0s, 1s)
    expect(await limiter.consume('k', 1, 1)).toBe(false); // still in it

    clock.advance(2000); // now well into the next window

    expect(await limiter.consume('k', 1, 1)).toBe(true);
  });
});
