import type { QuestionContent, SimilarQuestion } from '@/modules/questions';
import { type Result, ok, err, validationError } from '@/shared/result';

export const SUBMISSION_STATUSES = ['pending', 'approved', 'rejected', 'changes-requested'] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export const MODERATION_DECISIONS = ['approved', 'rejected', 'changes-requested'] as const;
export type ModerationDecision = (typeof MODERATION_DECISIONS)[number];

export interface ModerationEvent {
  readonly reviewerId: string;
  readonly decision: ModerationDecision;
  readonly note?: string;
  readonly at: Date;
}

export interface SubmissionProps {
  readonly id: string;
  readonly authorId: string;
  readonly content: QuestionContent;
  readonly status: SubmissionStatus;
  /** Computed at submit/revise time so a moderator sees them without a fresh lookup. */
  readonly possibleDuplicates: readonly SimilarQuestion[];
  /** Set once a moderator approves this submission and it becomes a real Question. */
  readonly questionId?: string;
  readonly history: readonly ModerationEvent[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface NewSubmissionInput {
  readonly id: string;
  readonly authorId: string;
  readonly content: QuestionContent;
  readonly possibleDuplicates: readonly SimilarQuestion[];
  readonly now: Date;
}

export class Submission {
  private constructor(private readonly props: SubmissionProps) {}

  static create(input: NewSubmissionInput): Submission {
    return new Submission({
      id: input.id,
      authorId: input.authorId,
      content: input.content,
      status: 'pending',
      possibleDuplicates: input.possibleDuplicates,
      history: [],
      createdAt: input.now,
      updatedAt: input.now,
    });
  }

  static fromPersistence(props: SubmissionProps): Submission {
    return new Submission(props);
  }

  // ── Moderator actions — only ever on a pending submission ──────────────

  approve(reviewerId: string, questionId: string, note: string | undefined, now: Date): Result<Submission> {
    const gate = this.requirePending();
    if (!gate.ok) return gate;
    return ok(this.decide('approved', reviewerId, note, now, { questionId }));
  }

  reject(reviewerId: string, note: string | undefined, now: Date): Result<Submission> {
    const gate = this.requirePending();
    if (!gate.ok) return gate;
    return ok(this.decide('rejected', reviewerId, note, now));
  }

  /** Distinct from reject: the author can revise and resubmit rather than starting over. */
  requestChanges(reviewerId: string, note: string, now: Date): Result<Submission> {
    const gate = this.requirePending();
    if (!gate.ok) return gate;
    if (!note.trim()) {
      return err(validationError('Requesting changes needs a note explaining what to change'));
    }
    return ok(this.decide('changes-requested', reviewerId, note, now));
  }

  // ── Author action — only after changes were requested ───────────────────

  /** Re-validated content is the caller's job (Question.validateContent); this only manages the state transition. */
  revise(content: QuestionContent, possibleDuplicates: readonly SimilarQuestion[], now: Date): Result<Submission> {
    if (this.props.status !== 'changes-requested') {
      return err(validationError(`Only a submission with changes requested can be revised (status: ${this.props.status})`));
    }
    return ok(
      new Submission({ ...this.props, content, possibleDuplicates, status: 'pending', updatedAt: now }),
    );
  }

  private requirePending(): Result<true> {
    if (this.props.status !== 'pending') {
      return err(validationError(`Only a pending submission can be moderated (status: ${this.props.status})`));
    }
    return ok(true);
  }

  private decide(
    decision: ModerationDecision,
    reviewerId: string,
    note: string | undefined,
    now: Date,
    patch: Partial<SubmissionProps> = {},
  ): Submission {
    const event: ModerationEvent = { reviewerId, decision, note: note?.trim() || undefined, at: now };
    return new Submission({
      ...this.props,
      ...patch,
      status: decision,
      history: [...this.props.history, event],
      updatedAt: now,
    });
  }

  get id() { return this.props.id; }
  get authorId() { return this.props.authorId; }
  get content() { return this.props.content; }
  get status() { return this.props.status; }
  get possibleDuplicates() { return this.props.possibleDuplicates; }
  get questionId() { return this.props.questionId; }
  get history() { return this.props.history; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  snapshot(): SubmissionProps {
    return this.props;
  }
}
