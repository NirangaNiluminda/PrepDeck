/**
 * Cross-cutting ports. Kept tiny on purpose — abstract only what you
 * genuinely need to fake in a test or swap in production.
 */
export interface Clock {
  now(): Date;
}

export interface IdGenerator {
  next(): string;
}

/**
 * Fixed-window counter, keyed by caller. No external service in the stack
 * (no Redis) — the Mongo-backed adapter in composition/ makes this hold
 * across serverless invocations the same way the in-memory one does in tests.
 */
export interface RateLimiter {
  /** True if this call is within the limit for `key`'s current window and should proceed. */
  consume(key: string, limit: number, windowSeconds: number): Promise<boolean>;
}

export interface Page<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
}

export interface Pagination {
  readonly limit: number;
  readonly offset: number;
}

export const DEFAULT_PAGE: Pagination = { limit: 20, offset: 0 };
