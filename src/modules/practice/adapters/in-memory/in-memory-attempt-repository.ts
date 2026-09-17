import type { Attempt } from '../../domain/attempt';
import type { AttemptRepository } from '../../ports/attempt-repository';

const dayKey = (date: Date): string => date.toISOString().slice(0, 10);

export class InMemoryAttemptRepository implements AttemptRepository {
  private readonly store: Attempt[] = [];

  async save(attempt: Attempt): Promise<void> {
    this.store.push(attempt);
  }

  async listRecentPracticeDates(userId: string, limit: number): Promise<string[]> {
    const dates = new Set(this.store.filter((a) => a.userId === userId).map((a) => dayKey(a.timestamp)));
    return [...dates].sort().reverse().slice(0, limit);
  }

  // ── Test helpers (not part of the port) ────────────────────────────────

  get size(): number {
    return this.store.length;
  }
}
