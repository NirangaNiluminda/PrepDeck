import type { Clock, RateLimiter } from './ports';

/**
 * Fixed-window, not sliding: a burst can land two windows' worth of calls
 * right at the boundary. That imprecision is fine for an abuse guard at this
 * scale — see composition/mongo-rate-limiter.ts for the same trade-off made
 * atomic across processes.
 */
export class InMemoryRateLimiter implements RateLimiter {
  private readonly buckets = new Map<string, { windowStart: number; count: number }>();

  constructor(private readonly clock: Clock) {}

  async consume(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    const windowMs = windowSeconds * 1000;
    const windowStart = Math.floor(this.clock.now().getTime() / windowMs) * windowMs;

    const bucket = this.buckets.get(key);
    if (!bucket || bucket.windowStart !== windowStart) {
      this.buckets.set(key, { windowStart, count: 1 });
      return true;
    }

    bucket.count += 1;
    return bucket.count <= limit;
  }

  // ── Test helper (not part of the port) ────────────────────────────────
  clear(): void {
    this.buckets.clear();
  }
}
