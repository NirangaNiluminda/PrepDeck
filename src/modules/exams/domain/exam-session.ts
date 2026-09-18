import { type Result, ok, err, validationError } from '@/shared/result';
import type { ExamAnswer } from './exam-answer';
import {
  type ExamConfig,
  MAX_DURATION_MINUTES,
  MAX_QUESTIONS,
  MIN_DURATION_MINUTES,
  MIN_QUESTIONS,
} from './exam-config';
import type { ExamQuestionSnapshot } from './exam-question-snapshot';
import { type ExamScore, computeScore } from './scoring';

export const EXAM_STATUSES = ['in-progress', 'awaiting-review', 'graded'] as const;
export type ExamStatus = (typeof EXAM_STATUSES)[number];

export interface ExamSessionProps {
  readonly id: string;
  readonly userId: string;
  readonly config: ExamConfig;
  readonly snapshots: readonly ExamQuestionSnapshot[];
  readonly answers: ReadonlyMap<string, ExamAnswer>;
  readonly status: ExamStatus;
  readonly startedAt: Date;
  readonly finishedAt?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface NewExamSessionInput {
  readonly id: string;
  readonly userId: string;
  readonly config: ExamConfig;
  readonly snapshots: readonly ExamQuestionSnapshot[];
  readonly now: Date;
}

export class ExamSession {
  private constructor(private readonly props: ExamSessionProps) {}

  /** Starts running immediately — there is no separate "created but not started" state. */
  static start(input: NewExamSessionInput): Result<ExamSession> {
    const { config } = input;
    if (config.count < MIN_QUESTIONS || config.count > MAX_QUESTIONS) {
      return err(validationError(`An exam must have between ${MIN_QUESTIONS} and ${MAX_QUESTIONS} questions`));
    }
    if (config.durationMinutes < MIN_DURATION_MINUTES || config.durationMinutes > MAX_DURATION_MINUTES) {
      return err(
        validationError(`Duration must be between ${MIN_DURATION_MINUTES} and ${MAX_DURATION_MINUTES} minutes`),
      );
    }
    if (input.snapshots.length === 0) {
      return err(validationError('No published questions matched this exam\'s filters'));
    }

    return ok(
      new ExamSession({
        id: input.id,
        userId: input.userId,
        config: input.config,
        snapshots: input.snapshots,
        answers: new Map(),
        status: 'in-progress',
        startedAt: input.now,
        createdAt: input.now,
        updatedAt: input.now,
      }),
    );
  }

  /**
   * Rehydrate from storage. Skips invariant checks by design — see
   * Question.fromPersistence for the same reasoning. Only persistence
   * adapters may call this.
   */
  static fromPersistence(props: ExamSessionProps): ExamSession {
    return new ExamSession(props);
  }

  // ── Behaviour ────────────────────────────────────────────────────────────

  /** Picks or changes an MCQ answer. Saved immediately — there is no separate autosave step to lose. */
  recordAnswer(questionId: string, selectedOptionId: string, now: Date): Result<ExamSession> {
    if (this.props.status !== 'in-progress') {
      return err(validationError('This exam is no longer in progress'));
    }
    if (this.isExpired(now)) {
      return err(validationError('Time is up — submit the exam'));
    }
    const snapshot = this.snapshotFor(questionId);
    if (!snapshot) return err(validationError('This question is not part of this exam'));
    if (snapshot.type !== 'mcq') {
      return err(validationError('Only multiple-choice questions take a selected option'));
    }
    if (!snapshot.options?.some((o) => o.id === selectedOptionId)) {
      return err(validationError(`Unknown option '${selectedOptionId}'`));
    }

    return ok(this.withAnswer(questionId, { selectedOptionId }, now));
  }

  toggleFlag(questionId: string, flagged: boolean, now: Date): Result<ExamSession> {
    if (this.props.status !== 'in-progress') {
      return err(validationError('This exam is no longer in progress'));
    }
    if (!this.snapshotFor(questionId)) {
      return err(validationError('This question is not part of this exam'));
    }
    return ok(this.withAnswer(questionId, { flagged }, now));
  }

  /**
   * Ends the timed portion. MCQs are already fully gradable; anything else
   * moves to `awaiting-review` until the learner self-grades it, or straight
   * to `graded` if the exam was all MCQ.
   */
  submit(now: Date): Result<ExamSession> {
    if (this.props.status !== 'in-progress') {
      return err(validationError('This exam has already been submitted'));
    }
    const needsSelfGrade = this.props.snapshots.some((s) => s.type !== 'mcq');
    return ok(
      new ExamSession({
        ...this.props,
        status: needsSelfGrade ? 'awaiting-review' : 'graded',
        finishedAt: now,
        updatedAt: now,
      }),
    );
  }

  /** The learner's own judgment against the model answer, for a question that can't be auto-scored. */
  selfGrade(questionId: string, correct: boolean, now: Date): Result<ExamSession> {
    if (this.props.status !== 'awaiting-review') {
      return err(validationError('This exam is not awaiting review'));
    }
    const snapshot = this.snapshotFor(questionId);
    if (!snapshot) return err(validationError('This question is not part of this exam'));
    if (snapshot.type === 'mcq') {
      return err(validationError('Multiple-choice questions are scored automatically'));
    }

    const graded = this.withAnswer(questionId, { selfGradedCorrect: correct }, now);
    const stillPending = graded.props.snapshots.some(
      (s) => s.type !== 'mcq' && graded.props.answers.get(s.questionId)?.selfGradedCorrect === undefined,
    );
    return ok(
      new ExamSession({ ...graded.props, status: stillPending ? 'awaiting-review' : 'graded', updatedAt: now }),
    );
  }

  private withAnswer(questionId: string, patch: Partial<Omit<ExamAnswer, 'questionId'>>, now: Date): ExamSession {
    const existing = this.props.answers.get(questionId);
    const answers = new Map(this.props.answers);
    answers.set(questionId, {
      questionId,
      selectedOptionId: existing?.selectedOptionId,
      selfGradedCorrect: existing?.selfGradedCorrect,
      flagged: existing?.flagged ?? false,
      answeredAt: existing?.answeredAt,
      ...patch,
    });
    return new ExamSession({ ...this.props, answers, updatedAt: now });
  }

  private snapshotFor(questionId: string): ExamQuestionSnapshot | undefined {
    return this.props.snapshots.find((s) => s.questionId === questionId);
  }

  // ── Reads ───────────────────────────────────────────────────────────────

  get id() { return this.props.id; }
  get userId() { return this.props.userId; }
  get config() { return this.props.config; }
  get snapshots() { return this.props.snapshots; }
  get answers() { return this.props.answers; }
  get status() { return this.props.status; }
  get startedAt() { return this.props.startedAt; }
  get finishedAt() { return this.props.finishedAt; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  get deadline(): Date {
    return new Date(this.props.startedAt.getTime() + this.props.config.durationMinutes * 60_000);
  }

  isExpired(now: Date): boolean {
    return now.getTime() > this.deadline.getTime();
  }

  get score(): ExamScore {
    return computeScore(this.props.snapshots, this.props.answers);
  }

  /** Read-only copy for persistence adapters and mappers. */
  snapshot(): ExamSessionProps {
    return this.props;
  }
}
