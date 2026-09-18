import type { ExamSession } from '../../domain/exam-session';
import type { ExamSessionRepository } from '../../ports/exam-session-repository';

export class InMemoryExamSessionRepository implements ExamSessionRepository {
  private readonly store = new Map<string, ExamSession>();

  async findById(id: string): Promise<ExamSession | null> {
    return this.store.get(id) ?? null;
  }

  async listByUser(userId: string): Promise<ExamSession[]> {
    return [...this.store.values()]
      .filter((s) => s.userId === userId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }

  async save(session: ExamSession): Promise<void> {
    this.store.set(session.id, session);
  }

  // ── Test helpers (not part of the port) ────────────────────────────────

  get size(): number {
    return this.store.size;
  }
}
