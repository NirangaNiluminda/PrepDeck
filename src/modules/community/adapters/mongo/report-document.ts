import type { IndexDescription } from 'mongodb';
import { Report, type ReportProps, type ReportReason, type ReportStatus } from '../../domain/report';

export interface ReportDocument {
  _id: string;
  reporterId: string;
  questionId: string;
  reason: ReportReason;
  note?: string;
  status: ReportStatus;
  resolvedBy?: string;
  resolvedAt?: Date;
  createdAt: Date;
}

const withoutUndefined = <T extends object>(value: T): T =>
  Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as T;

export const ReportMapper = {
  toPersistence(report: Report): ReportDocument {
    const p: ReportProps = report.snapshot();
    return withoutUndefined({
      _id: p.id,
      reporterId: p.reporterId,
      questionId: p.questionId,
      reason: p.reason,
      note: p.note,
      status: p.status,
      resolvedBy: p.resolvedBy,
      resolvedAt: p.resolvedAt,
      createdAt: p.createdAt,
    });
  },

  toDomain(doc: ReportDocument): Report {
    return Report.fromPersistence({
      id: doc._id,
      reporterId: doc.reporterId,
      questionId: doc.questionId,
      reason: doc.reason,
      note: doc.note ?? undefined,
      status: doc.status,
      resolvedBy: doc.resolvedBy ?? undefined,
      resolvedAt: doc.resolvedAt ?? undefined,
      createdAt: doc.createdAt,
    });
  },
};

export const REPORT_INDEXES: IndexDescription[] = [
  { key: { status: 1, createdAt: -1 }, name: 'by_status' },
];
