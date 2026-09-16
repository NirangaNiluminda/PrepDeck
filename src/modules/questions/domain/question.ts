import { type Result, ok, err, validationError } from '@/shared/result';
import { type Difficulty, isDifficulty } from './difficulty';
import { isSlug } from './slug';
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
  /**
   * Stable key for questions that live in files, so importing the same file
   * again updates the question instead of duplicating it. Questions created
   * through the API or admin UI may have none.
   */
  readonly slug?: string;
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

/** Everything an author controls. Identity, lifecycle and audit fields are not in here. */
export interface QuestionContent {
  readonly slug?: string;
  readonly stem: string;
  readonly type: QuestionType;
  readonly difficulty: Difficulty;
  readonly topicPath: string;
  readonly tags?: readonly string[];
  readonly answer: QuestionAnswer;
  readonly options?: readonly McqOption[];
  readonly source?: string;
}

export interface NewQuestionInput extends QuestionContent {
  readonly id: string;
  readonly authorId: string;
  readonly now: Date;
}

type ValidContent = Pick<
  QuestionProps,
  'slug' | 'stem' | 'type' | 'difficulty' | 'topicPath' | 'tags' | 'answer' | 'options' | 'source'
>;

const MIN_STEM = 10;
const MAX_STEM = 2000;
const MAX_TAGS = 10;

const normaliseTags = (tags: readonly string[] = []): string[] =>
  Array.from(new Set(tags.map((t) => t.trim().toLowerCase()).filter(Boolean))).sort();

const optionalText = (value?: string): string | undefined => value?.trim() || undefined;

const isQuestionType = (v: unknown): v is QuestionType =>
  typeof v === 'string' && (QUESTION_TYPES as readonly string[]).includes(v);

// References are rendered as links. Restricting them to http(s) keeps a
// javascript: URL from ever reaching an href, whichever entry point wrote it.
const isWebUrl = (value: string): boolean => /^https?:\/\//i.test(value) && URL.canParse(value);

export class Question {
  private constructor(private readonly props: QuestionProps) {}

  // ── Construction ────────────────────────────────────────────────────────

  /** Enforces every invariant. There is no other way to make a valid Question. */
  static create(input: NewQuestionInput): Result<Question> {
    const content = Question.validate(input);
    if (!content.ok) return content;

    return ok(
      new Question({
        ...content.value,
        id: input.id,
        status: 'draft',
        authorId: input.authorId,
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

  /**
   * The single gate for author-controlled content, shared by create and
   * revise so an edit can never bypass a rule that creation enforces. Also
   * normalises, so the same content always produces the same stored shape
   * whichever entry point it came through.
   */
  private static validate(content: QuestionContent): Result<ValidContent> {
    const stem = content.stem.trim();

    if (stem.length < MIN_STEM) {
      return err(validationError(`Question must be at least ${MIN_STEM} characters`));
    }
    if (stem.length > MAX_STEM) {
      return err(validationError(`Question may not exceed ${MAX_STEM} characters`));
    }
    if (!isQuestionType(content.type)) {
      return err(validationError(`Unknown question type '${content.type}'`));
    }
    if (!isDifficulty(content.difficulty)) {
      return err(validationError(`Unknown difficulty '${content.difficulty}'`));
    }

    const modelAnswer = content.answer.modelAnswer.trim();
    if (!modelAnswer) {
      return err(validationError('A model answer is required'));
    }

    const tags = normaliseTags(content.tags);
    if (tags.length > MAX_TAGS) {
      return err(validationError(`A question may carry at most ${MAX_TAGS} tags`));
    }

    const slug = optionalText(content.slug);
    if (slug !== undefined && !isSlug(slug)) {
      return err(validationError(`Slug '${slug}' must be lowercase words joined by hyphens`));
    }

    const topic = TopicPath.create(content.topicPath);
    if (!topic.ok) return topic;

    const optionCheck = Question.validateOptions(content.type, content.options);
    if (!optionCheck.ok) return optionCheck;

    const references = content.answer.references?.map((r) => r.trim()).filter(Boolean);
    const badReference = references?.find((r) => !isWebUrl(r));
    if (badReference) {
      return err(validationError(`References must be http or https links; found "${badReference}"`));
    }

    return ok({
      slug,
      stem,
      type: content.type,
      difficulty: content.difficulty,
      topicPath: topic.value,
      tags,
      answer: {
        modelAnswer,
        keyPoints: content.answer.keyPoints.map((k) => k.trim()).filter(Boolean),
        explanation: optionalText(content.answer.explanation),
        references: references?.length ? references : undefined,
      },
      options:
        content.type === 'mcq'
          ? content.options?.map((o) => ({ id: o.id, text: o.text.trim(), correct: o.correct }))
          : undefined,
      source: optionalText(content.source),
    });
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
    if (new Set(options.map((o) => o.id)).size !== options.length) {
      return err(validationError('Option ids must be unique'));
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
  archive(now: Date): Result<Question> {
    if (this.props.status === 'archived') {
      return err(validationError('Question is already archived'));
    }
    return ok(this.with({ status: 'archived' }, now));
  }

  /** Undoes archive. The question comes back as a draft and must be published again. */
  restore(now: Date): Result<Question> {
    if (this.props.status !== 'archived') {
      return err(validationError('Only archived questions can be restored'));
    }
    return ok(this.with({ status: 'draft' }, now));
  }

  /**
   * Replaces the author-controlled content wholesale rather than patching it,
   * so a field can be cleared (an explanation removed, say) as easily as it
   * can be changed. Status, author and createdAt are untouched.
   */
  reviseContent(content: QuestionContent, now: Date): Result<Question> {
    const valid = Question.validate(content);
    if (!valid.ok) return valid;
    return ok(this.with(valid.value, now));
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
  get slug() { return this.props.slug; }
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
