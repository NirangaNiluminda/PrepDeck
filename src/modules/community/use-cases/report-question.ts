import type { Clock, IdGenerator, RateLimiter } from '@/shared/ports';
import { type Result, ok, err, notFound, rateLimited } from '@/shared/result';
import type { QuestionRepository } from '@/modules/questions';
import { Report } from '../domain/report';
import type { ReportRepository } from '../ports/report-repository';
import { type ReportView, toReportView } from '../ports/dto';

export interface ReportQuestionInput {
  readonly reporterId: string;
  readonly questionId: string;
  readonly reason: string;
  readonly note?: string;
}

const REPORT_LIMIT = 10;
const REPORT_WINDOW_SECONDS = 60 * 60;

export async function reportQuestion(
  input: ReportQuestionInput,
  deps: { reports: ReportRepository; questions: QuestionRepository; rateLimiter: RateLimiter; clock: Clock; ids: IdGenerator },
): Promise<Result<ReportView>> {
  const allowed = await deps.rateLimiter.consume(`report:${input.reporterId}`, REPORT_LIMIT, REPORT_WINDOW_SECONDS);
  if (!allowed) return err(rateLimited('Too many reports — try again later'));

  const question = await deps.questions.findById(input.questionId);
  if (!question) return err(notFound('Question', input.questionId));

  const report = Report.create({
    id: deps.ids.next(),
    reporterId: input.reporterId,
    questionId: input.questionId,
    reason: input.reason,
    note: input.note,
    now: deps.clock.now(),
  });
  if (!report.ok) return report;

  await deps.reports.save(report.value);
  return ok(toReportView(report.value));
}
