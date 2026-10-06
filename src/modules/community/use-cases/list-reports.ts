import type { Page } from '@/shared/ports';
import { type Result, ok, err, forbidden } from '@/shared/result';
import type { ReportStatus } from '../domain/report';
import type { ReportRepository } from '../ports/report-repository';
import { type ReportView, toReportView } from '../ports/dto';

export interface ListReportsInput {
  readonly viewerIsAdmin: boolean;
  readonly statuses?: readonly ReportStatus[];
}

export async function listReports(
  input: ListReportsInput,
  deps: { reports: ReportRepository },
): Promise<Result<Page<ReportView>>> {
  if (!input.viewerIsAdmin) {
    return err(forbidden('Only moderators may view reports'));
  }
  const page = await deps.reports.findByFilter({ statuses: input.statuses ?? ['open'] });
  return ok({ ...page, items: page.items.map(toReportView) });
}
