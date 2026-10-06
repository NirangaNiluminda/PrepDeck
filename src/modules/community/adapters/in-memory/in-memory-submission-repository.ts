import type { Page } from '@/shared/ports';
import { DEFAULT_PAGE } from '@/shared/ports';
import type { Submission } from '../../domain/submission';
import type { SubmissionFilter, SubmissionRepository } from '../../ports/submission-repository';

export class InMemorySubmissionRepository implements SubmissionRepository {
  private readonly store = new Map<string, Submission>();

  async findById(id: string): Promise<Submission | null> {
    return this.store.get(id) ?? null;
  }

  async findByFilter(filter: SubmissionFilter): Promise<Page<Submission>> {
    const matched = [...this.store.values()]
      .filter((s) => !filter.statuses?.length || filter.statuses.includes(s.status))
      .filter((s) => !filter.authorId || s.authorId === filter.authorId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const { limit, offset } = filter.page ?? DEFAULT_PAGE;
    return { items: matched.slice(offset, offset + limit), total: matched.length, limit, offset };
  }

  async save(submission: Submission): Promise<void> {
    this.store.set(submission.id, submission);
  }
}
