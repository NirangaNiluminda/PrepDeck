import type { ReviewCard } from '../../domain/review-card';
import type { MasteryInput, ReviewCardRepository } from '../../ports/review-card-repository';

const keyOf = (userId: string, questionId: string) => JSON.stringify([userId, questionId]);

export class InMemoryReviewCardRepository implements ReviewCardRepository {
  private readonly store = new Map<string, ReviewCard>();

  async findByUserAndQuestion(userId: string, questionId: string): Promise<ReviewCard | null> {
    return this.store.get(keyOf(userId, questionId)) ?? null;
  }

  async listDue(userId: string, now: Date, limit: number): Promise<ReviewCard[]> {
    return this.byUser(userId)
      .filter((c) => c.isDue(now))
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, limit);
  }

  async countDue(userId: string, now: Date): Promise<number> {
    return this.byUser(userId).filter((c) => c.isDue(now)).length;
  }

  async countCreatedSince(userId: string, since: Date): Promise<number> {
    return this.byUser(userId).filter((c) => c.createdAt.getTime() >= since.getTime()).length;
  }

  async listMasteryInputs(userId: string): Promise<MasteryInput[]> {
    return this.byUser(userId).map((c) => ({
      questionId: c.questionId,
      interval: c.interval,
      easeFactor: c.easeFactor,
    }));
  }

  async save(card: ReviewCard): Promise<void> {
    this.store.set(keyOf(card.userId, card.questionId), card);
  }

  // ── Test helpers (not part of the port) ────────────────────────────────

  get size(): number {
    return this.store.size;
  }

  private byUser(userId: string): ReviewCard[] {
    return [...this.store.values()].filter((c) => c.userId === userId);
  }
}
