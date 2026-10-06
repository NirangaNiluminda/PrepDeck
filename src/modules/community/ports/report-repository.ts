import type { Page, Pagination } from '@/shared/ports';
import type { Report, ReportStatus } from '../domain/report';

export interface ReportFilter {
  readonly statuses?: readonly ReportStatus[];
  readonly page?: Pagination;
}

export interface ReportRepository {
  findById(id: string): Promise<Report | null>;
  findByFilter(filter: ReportFilter): Promise<Page<Report>>;
  save(report: Report): Promise<void>;
}
