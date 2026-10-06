import type { Page } from '@/shared/ports';
import { DEFAULT_PAGE } from '@/shared/ports';
import type { Report } from '../../domain/report';
import type { ReportFilter, ReportRepository } from '../../ports/report-repository';

export class InMemoryReportRepository implements ReportRepository {
  private readonly store = new Map<string, Report>();

  async findById(id: string): Promise<Report | null> {
    return this.store.get(id) ?? null;
  }

  async findByFilter(filter: ReportFilter): Promise<Page<Report>> {
    const matched = [...this.store.values()]
      .filter((r) => !filter.statuses?.length || filter.statuses.includes(r.status))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const { limit, offset } = filter.page ?? DEFAULT_PAGE;
    return { items: matched.slice(offset, offset + limit), total: matched.length, limit, offset };
  }

  async save(report: Report): Promise<void> {
    this.store.set(report.id, report);
  }
}
