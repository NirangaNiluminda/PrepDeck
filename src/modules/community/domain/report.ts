import { type Result, ok, err, validationError } from '@/shared/result';

export const REPORT_REASONS = ['incorrect', 'duplicate', 'offensive', 'other'] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_STATUSES = ['open', 'resolved', 'dismissed'] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export interface ReportProps {
  readonly id: string;
  readonly reporterId: string;
  readonly questionId: string;
  readonly reason: ReportReason;
  readonly note?: string;
  readonly status: ReportStatus;
  readonly resolvedBy?: string;
  readonly resolvedAt?: Date;
  readonly createdAt: Date;
}

export interface NewReportInput {
  readonly id: string;
  readonly reporterId: string;
  readonly questionId: string;
  readonly reason: string;
  readonly note?: string;
  readonly now: Date;
}

const isReportReason = (v: unknown): v is ReportReason =>
  typeof v === 'string' && (REPORT_REASONS as readonly string[]).includes(v);

export class Report {
  private constructor(private readonly props: ReportProps) {}

  static create(input: NewReportInput): Result<Report> {
    if (!isReportReason(input.reason)) {
      return err(validationError(`Unknown report reason '${input.reason}'`));
    }
    return ok(
      new Report({
        id: input.id,
        reporterId: input.reporterId,
        questionId: input.questionId,
        reason: input.reason,
        note: input.note?.trim() || undefined,
        status: 'open',
        createdAt: input.now,
      }),
    );
  }

  static fromPersistence(props: ReportProps): Report {
    return new Report(props);
  }

  resolve(resolvedBy: string, status: 'resolved' | 'dismissed', now: Date): Result<Report> {
    if (this.props.status !== 'open') {
      return err(validationError(`Only an open report can be resolved (status: ${this.props.status})`));
    }
    return ok(new Report({ ...this.props, status, resolvedBy, resolvedAt: now }));
  }

  get id() { return this.props.id; }
  get reporterId() { return this.props.reporterId; }
  get questionId() { return this.props.questionId; }
  get reason() { return this.props.reason; }
  get note() { return this.props.note; }
  get status() { return this.props.status; }
  get resolvedBy() { return this.props.resolvedBy; }
  get resolvedAt() { return this.props.resolvedAt; }
  get createdAt() { return this.props.createdAt; }

  snapshot(): ReportProps {
    return this.props;
  }
}
