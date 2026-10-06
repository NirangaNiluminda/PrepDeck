import type { Page, Pagination } from '@/shared/ports';
import type { Submission } from '../domain/submission';
import type { SubmissionStatus } from '../domain/submission';

export interface SubmissionFilter {
  readonly statuses?: readonly SubmissionStatus[];
  readonly authorId?: string;
  readonly page?: Pagination;
}

export interface SubmissionRepository {
  findById(id: string): Promise<Submission | null>;
  findByFilter(filter: SubmissionFilter): Promise<Page<Submission>>;
  save(submission: Submission): Promise<void>;
}
