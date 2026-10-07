import { type Result, ok, err, validationError } from '@/shared/result';

export const STUDY_PACK_STATUSES = ['active', 'archived'] as const;
export type StudyPackStatus = (typeof STUDY_PACK_STATUSES)[number];

export const MAX_PACK_NAME_LENGTH = 60;
export const MAX_PACK_TOPICS = 20;
/** Loose strings, like UserSettings.preferredDifficulty: domain code never imports the questions module's types. */
const KNOWN_DIFFICULTIES = ['easy', 'medium', 'hard'];
const TOPIC_PATH = /^[a-z0-9-]+(\/[a-z0-9-]+){0,3}$/;

export interface StudyPackProps {
  readonly id: string;
  /** Owner. Every read and write is scoped to it; another user's pack is NOT_FOUND, never FORBIDDEN. */
  readonly userId: string;
  readonly name: string;
  /** OR-ed: a question under any of these topics (or their descendants) belongs to the pack. */
  readonly topicPaths: readonly string[];
  /** Empty means every difficulty. */
  readonly difficulties: readonly string[];
  readonly status: StudyPackStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface NewStudyPack {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly topicPaths: readonly string[];
  readonly difficulties: readonly string[];
}

const unique = (values: readonly string[]) => [...new Set(values.map((v) => v.trim().toLowerCase()).filter(Boolean))];

/**
 * A saved selection of topics to work through. It holds no progress of its
 * own: how far along a pack is comes from the learner's review cards (see
 * pack-progress.ts), so it can never drift from what was actually practised,
 * and stopping halfway needs nothing saved to resume.
 */
export class StudyPack {
  private constructor(private readonly props: StudyPackProps) {}

  static create(input: NewStudyPack, now: Date): Result<StudyPack> {
    const name = input.name.trim();
    if (!name) return err(validationError('Give the pack a name'));
    if (name.length > MAX_PACK_NAME_LENGTH) {
      return err(validationError(`Pack names can be at most ${MAX_PACK_NAME_LENGTH} characters`));
    }

    const topicPaths = unique(input.topicPaths);
    if (topicPaths.length === 0) return err(validationError('Pick at least one topic'));
    if (topicPaths.length > MAX_PACK_TOPICS) {
      return err(validationError(`A pack can cover at most ${MAX_PACK_TOPICS} topics`));
    }
    const badTopic = topicPaths.find((t) => !TOPIC_PATH.test(t));
    if (badTopic) return err(validationError(`'${badTopic}' is not a topic`));

    const difficulties = unique(input.difficulties);
    const badDifficulty = difficulties.find((d) => !KNOWN_DIFFICULTIES.includes(d));
    if (badDifficulty) return err(validationError(`Unknown difficulty '${badDifficulty}'`));

    return ok(
      new StudyPack({
        id: input.id,
        userId: input.userId,
        name,
        topicPaths,
        difficulties,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      }),
    );
  }

  static fromPersistence(props: StudyPackProps): StudyPack {
    return new StudyPack(props);
  }

  /** Soft delete. Idempotent: archiving an archived pack is not an error. */
  archive(now: Date): StudyPack {
    if (this.props.status === 'archived') return this;
    return new StudyPack({ ...this.props, status: 'archived', updatedAt: now });
  }

  get id() { return this.props.id; }
  get userId() { return this.props.userId; }
  get name() { return this.props.name; }
  get topicPaths() { return this.props.topicPaths; }
  get difficulties() { return this.props.difficulties; }
  get status() { return this.props.status; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  snapshot(): StudyPackProps {
    return this.props;
  }
}
