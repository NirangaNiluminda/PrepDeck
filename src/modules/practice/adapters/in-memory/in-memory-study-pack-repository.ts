import type { StudyPack } from '../../domain/study-pack';
import type { StudyPackRepository } from '../../ports/study-pack-repository';

export class InMemoryStudyPackRepository implements StudyPackRepository {
  private readonly store = new Map<string, StudyPack>();

  async findForUser(userId: string, id: string): Promise<StudyPack | null> {
    const pack = this.store.get(id);
    return pack && pack.userId === userId ? pack : null;
  }

  async listActiveByUser(userId: string): Promise<StudyPack[]> {
    return [...this.store.values()]
      .filter((p) => p.userId === userId && p.status === 'active')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async countActiveByUser(userId: string): Promise<number> {
    return (await this.listActiveByUser(userId)).length;
  }

  async save(pack: StudyPack): Promise<void> {
    this.store.set(pack.id, pack);
  }
}
