import type { Collection, IndexDescription } from 'mongodb';
import type { RateLimiter } from '@/shared/ports';

/**
 * One document per (key, window), so the increment is a single atomic
 * `findOneAndUpdate` — no read-then-write race across concurrent requests,
 * which an in-memory counter can't promise once there's more than one
 * serverless instance. `expiresAt` lets Mongo's TTL monitor clear old windows
 * instead of this ever running a cleanup job.
 */
export interface RateLimitDocument {
  _id: string;
  count: number;
  expiresAt: Date;
}

export const RATE_LIMIT_INDEXES: IndexDescription[] = [
  { key: { expiresAt: 1 }, name: 'ttl', expireAfterSeconds: 0 },
];

export class MongoRateLimiter implements RateLimiter {
  constructor(private readonly collection: Collection<RateLimitDocument>) {}

  async consume(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    const windowMs = windowSeconds * 1000;
    const now = Date.now();
    const windowStart = Math.floor(now / windowMs) * windowMs;
    const id = `${key}:${windowStart}`;

    const result = await this.collection.findOneAndUpdate(
      { _id: id },
      {
        $inc: { count: 1 },
        // Kept a window past expiry rather than exactly at it, so a slow
        // request straddling the boundary can't outlive its own document.
        $setOnInsert: { expiresAt: new Date(windowStart + windowMs * 2) },
      },
      { upsert: true, returnDocument: 'after' },
    );

    return (result?.count ?? 1) <= limit;
  }
}
