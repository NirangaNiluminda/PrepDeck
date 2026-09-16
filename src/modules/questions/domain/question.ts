import { type Result, ok, err, validationError } from '@/shared/result';
import { type Difficulty, isDifficulty } from './difficulty';
import { TopicPath } from './topic-path';

export const QUESTION_TYPES = ['mcq', 'short-answer', 'flashcard', 'code'] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const QUESTION_STATUSES = ['draft', 'in-review', 'published', 'archived'] as const;
export type QuestionStatus = (typeof QUESTION_STATUSES)[number];

export interface McqOption {
  readonly id: string;
  readonly text: string;
  readonly correct: boolean;
}

/**
 * The model answer travels with the question as a value object rather than a
 * separate aggregate: it is never queried or edited independently, and the two
 * must always change together. Split it out only if answers gain their own
 * lifecycle (multiple community answers per question, voted on separately).
 */
export interface QuestionAnswer {
  readonly modelAnswer: string;
  /** Phrases a self-graded answer is checked against. Drives short-answer scoring. */
  readonly keyPoints: readonly string[];
  readonly explanation?: string;
  readonly references?: readonly string[];
}

export interface QuestionProps {
  readonly id: string;
  readonly stem: string;
  readonly type: QuestionType;
  readonly difficulty: Difficulty;
  readonly topicPath: TopicPath;
  readonly tags: readonly string[];
  readonly answer: QuestionAnswer;
  readonly options?: readonly McqOption[];
  readonly status: QuestionStatus;
  readonly authorId: string;
  readonly source?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
}

export interface NewQuestionInput {
  readonly id: string;
  readonly stem: string;
  readonly type: QuestionType;
  readonly difficulty: Difficulty;
  readonly topicPath: string;
  readonly tags?: readonly string[];
  readonly answer: QuestionAnswer;
  readonly options?: readonly McqOption[];
  readonly authorId: string;
  readonly source?: string;
  readonly now: Date;
}

const MIN_STEM = 10;
const MAX_STEM = 2000;
const MAX_TAGS = 10;

const normaliseTags = (tags: readonly string[] = []): string[] =>
  Array.from(new Set(tags.map((t) => t.trim().toLowerCase()).filter(Boolean))).sort();

export class Question {
  private constructor(private readonly props: QuestionProps) {}

  // ── Construction ────────────────────────────────────────────────────────

  /** Enforces every invariant. There is no other way to make a valid Question. */
  static create(input: NewQuestionInput): Result<Question> {
    const stem = input.stem.trim();

    if (stem.length < MIN_STEM) {
      return err(validationError(`Question must be at least ${MIN_STEM} characters`));
    }
    if (stem.length > MAX_STEM) {
      return err(validationError(`Question may not exceed ${MAX_STEM} characters`));
    }
    if (!isDifficulty(input.difficulty)) {
      return err(validationError(`Unknown difficulty '${input.difficulty}'`));
    }
    if (!input.answer.modelAnswer.trim()) {
      return err(validationError('A model answer is required'));
    }

    const tags = normaliseTags(input.tags);
    if (tags.length > MAX_TAGS) {
      return err(validationError(`A question may carry at most ${MAX_TAGS} tags`));
    }

    const topic = TopicPath.create(input.topicPath);
    if (!topic.ok) return topic;

    const optionCheck = Question.validateOptions(input.type, input.options);
    if (!optionCheck.ok) return optionCheck;

    return ok(
      new Question({
        id: input.id,
        stem,
        type: input.type,
        difficulty: input.difficulty,
        topicPath: topic.value,
        tags,
        answer: input.answer,
        options: input.options,
        status: 'draft',
        authorId: input.authorId,
        source: input.source,
        createdAt: input.now,
        updatedAt: input.now,
        version: 1,
      }),
    );
  }

  /**
   * Rehydrate from storage. Skips invariant checks by design: the data was
   * already valid when written, and a later rule change must not make existing
   * rows unreadable. Only persistence adapters may call this.
   */
  static fromPersistence(props: QuestionProps): Question {
    return new Question(props);
  }

  private static validateOptions(
    type: QuestionType,
    options?: readonly McqOption[],
  ): Result<true> {
    if (type !== 'mcq') {
      return options?.length
        ? err(validationError('Only multiple-choice questions may carry options'))
        : ok(true);
    }
    if (!options || options.length < 2) {
      return err(validationError('A multiple-choice question needs at least 2 options'));
    }
    if (options.filter((o) => o.correct).length !== 1) {
      return err(validationError('Exactly one option must be marked correct'));
    }
    return ok(true);
  }

  // ── Behaviour (state transitions live on the entity, not in use cases) ──

  submitForReview(now: Date): Result<Question> {
    if (this.props.status !== 'draft') {
      return err(validationError(`Only drafts can be submitted (status: ${this.props.status})`));
    }
    return ok(this.with({ status: 'in-review' }, now));
  }

  publish(now: Date): Result<Question> {
    if (this.props.status === 'published') {
      return err(validationError('Question is already published'));
    }
    if (this.props.status === 'archived') {
      return err(validationError('Archived questions must be restored before publishing'));
    }
    return ok(this.with({ status: 'published' }, now));
  }

  /** Soft delete. Community content is never physically removed. */
  archive(now: Date): Question {
    return this.with({ status: 'archived' }, now);
  }

  reviseContent(
    patch: { stem?: string; answer?: QuestionAnswer; difficulty?: Difficulty; tags?: readonly string[] },
    now: Date,
  ): Result<Question> {
    const stem = patch.stem?.trim() ?? this.props.stem;
    if (stem.length < MIN_STEM) {
      return err(validationError(`Question must be at least ${MIN_STEM} characters`));
    }
    return ok(
      this.with(
        {
          stem,
          answer: patch.answer ?? this.props.answer,
          difficulty: patch.difficulty ?? this.props.difficulty,
          tags: patch.tags ? normaliseTags(patch.tags) : this.props.tags,
        },
        now,
      ),
    );
  }

  private with(patch: Partial<QuestionProps>, now: Date): Question {
    return new Question({
      ...this.props,
      ...patch,
      updatedAt: now,
      version: this.props.version + 1,
    });
  }

  // ── Reads ───────────────────────────────────────────────────────────────

  get id() { return this.props.id; }
  get stem() { return this.props.stem; }
  get type() { return this.props.type; }
  get difficulty() { return this.props.difficulty; }
  get topicPath() { return this.props.topicPath; }
  get tags() { return this.props.tags; }
  get answer() { return this.props.answer; }
  get options() { return this.props.options; }
  get status() { return this.props.status; }
  get authorId() { return this.props.authorId; }
  get source() { return this.props.source; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }
  get version() { return this.props.version; }

  get isVisibleToLearners(): boolean {
    return this.props.status === 'published';
  }

  /** Read-only copy for persistence adapters and mappers. */
  snapshot(): QuestionProps {
    return this.props;
  }
}
