import type { Attempt } from '../domain/attempt';

export interface AttemptRepository {
  save(attempt: Attempt): Promise<void>;
  /**
   * Distinct calendar dates (UTC, `YYYY-MM-DD`) this user practised on,
   * newest first, capped at `limit`. Enough to walk backward from today and
   * count a streak without loading every attempt ever made.
   */
  listRecentPracticeDates(userId: string, limit: number): Promise<string[]>;
}
