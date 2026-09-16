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
