import { MATURE_INTERVAL_DAYS, questionMastery } from './mastery';

/** The slice of a review card that progress reads. */
export interface CardState {
  readonly questionId: string;
  readonly interval: number;
  readonly easeFactor: number;
  readonly dueDate: Date;
  readonly updatedAt: Date;
}

export interface PackProgress {
  /** Published questions currently in the pack. Grows when matching questions are added. */
  readonly total: number;
  /** Of those, how many the learner has rated at least once. */
  readonly started: number;
  /** Started cards whose review is due now. */
  readonly due: number;
  /** Never-seen questions still waiting: total − started. */
  readonly notStarted: number;
  /** Average mastery (0–100) over started cards; undefined before the first rating. */
  readonly mastery?: number;
  /** The most recent rating of any card in the pack; undefined before the first. */
  readonly lastStudiedAt?: Date;
}

/**
 * Derived, never stored: a pack's progress is just the learner's review cards
 * restricted to the pack's questions. Cards for questions outside the pack
 * (or since archived) are ignored.
 */
export function packProgress(questionIds: readonly string[], cards: readonly CardState[], now: Date): PackProgress {
  const inPack = new Set(questionIds);
  const started = cards.filter((c) => inPack.has(c.questionId));

  const due = started.filter((c) => c.dueDate.getTime() <= now.getTime()).length;
  const mastery = started.length
    ? Math.round(started.reduce((sum, c) => sum + questionMastery(c), 0) / started.length)
    : undefined;
  const lastStudiedAt = started.length
    ? new Date(Math.max(...started.map((c) => c.updatedAt.getTime())))
    : undefined;

  return {
    total: inPack.size,
    started: started.length,
    due,
    notStarted: inPack.size - started.length,
    mastery,
    lastStudiedAt,
  };
}

/**
 * Where one question stands for a learner, for labelling it in a study list:
 * never rated, due for review now, being learned, or learned (scheduled at
 * least as far out as mastery's "mature" interval).
 */
export type StudyStatus = 'new' | 'due' | 'learning' | 'learned';

export function studyStatus(card: CardState | undefined, now: Date): StudyStatus {
  if (!card) return 'new';
  if (card.dueDate.getTime() <= now.getTime()) return 'due';
  return card.interval >= MATURE_INTERVAL_DAYS ? 'learned' : 'learning';
}
