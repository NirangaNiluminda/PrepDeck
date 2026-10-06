import type { Clock } from '@/shared/ports';
import { type Result, ok, err, forbidden, notFound } from '@/shared/result';
import type { ReportRepository } from '../ports/report-repository';
import { type ReportView, toReportView } from '../ports/dto';

export interface ResolveReportInput {
  readonly reportId: string;
  readonly outcome: 'resolved' | 'dismissed';
  readonly resolverId: string;
  readonly resolverIsAdmin: boolean;
}

/**
 * Deliberately doesn't touch the reported question — archiving it, if
 * warranted, is a separate action a moderator already has on the question
 * page. Keeping resolution and consequence apart means one report can't
 * silently take an action the moderator didn't explicitly choose.
 */
export async function resolveReport(
  input: ResolveReportInput,
  deps: { reports: ReportRepository; clock: Clock },
): Promise<Result<ReportView>> {
  if (!input.resolverIsAdmin) {
    return err(forbidden('Only moderators may resolve reports'));
  }

  const report = await deps.reports.findById(input.reportId);
  if (!report) return err(notFound('Report', input.reportId));

  const resolved = report.resolve(input.resolverId, input.outcome, deps.clock.now());
  if (!resolved.ok) return resolved;

  await deps.reports.save(resolved.value);
  return ok(toReportView(resolved.value));
}
