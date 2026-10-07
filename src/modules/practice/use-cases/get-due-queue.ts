import { getQuestion, searchQuestions, type Difficulty, type QuestionRepository } from '@/modules/questions';
import { startOfDayInTimezone } from '../domain/day-boundary';
import { RATINGS, type Rating } from '../domain/rating';
import { NEW_REVIEW_STATE } from '../domain/scheduler';
import type { DueCard } from '../ports/dto';
import type { ReviewCardRepository } from '../ports/review-card-repository';
import type { ReviewScheduler, ReviewState } from '../ports/review-scheduler';

export interface GetDueQueueInput {
  readonly userId: string;
  readonly now: Date;
  /** Cards never reviewed before, introduced today, are capped at this many. */
  readonly newCardCap: number;
  readonly limit: number;
  /** Restricts to a topic and its descendants — how a weak-area suggestion becomes a session. */
  readonly topicPath?: string;
  /** Restricts to any of these topics (OR) — a study pack's selection. Combined with `topicPath` if both are set. */
  readonly topicPaths?: readonly string[];
  /**
   * Restricts both due and new cards to these difficulties — a study pack's
   * choice. Unlike `preferredDifficulty`, which only biases new material,
   * and which this replaces when set: the learner picked the pack's content.
   */
  readonly difficulties?: readonly Difficulty[];
  /** IANA zone the new-card cap's "today" is drawn in. Defaults to UTC. Due cards are unaffected — what's due is due regardless of preference. */
  readonly timezone?: string;
  /** Biases new material toward one difficulty. Due cards are unaffected — reviewing what's due isn't optional. */
  readonly preferredDifficulty?: Difficulty;
}

export interface GetDueQueueDeps {
  readonly reviewCards: ReviewCardRepository;
  readonly questions: QuestionRepository;
  readonly scheduler: ReviewScheduler;
}

const isUnderTopic = (topicPath: string, filter: string | undefined): boolean =>
  !filter || topicPath === filter || topicPath.startsWith(`${filter}/`);

const isUnderAny = (topicPath: string, filters: readonly string[] | undefined): boolean =>
  !filters?.length || filters.some((f) => isUnderTopic(topicPath, f));

/** What each of the four ratings would do to this card right now — the "1d / 3d / 6d / 8d" a learner sees on the buttons. */
const previewIntervals = (state: ReviewState, scheduler: ReviewScheduler, now: Date): Record<Rating, number> =>
  Object.fromEntries(RATINGS.map((rating) => [rating, scheduler.next(state, rating, now).interval])) as Record<Rating, number>;

/**
 * Due cards first (oldest due date first, so the most overdue material comes
 * first), then new material up to the remaining daily cap.
 *
 * ReviewCard carries no topic, so a topic filter on the due side is applied
 * after fetching question details rather than in the repository query — an
 * accepted rough edge at the corpus sizes this app runs at, the same trade
 * the free-text regex search elsewhere in the codebase already makes.
 */
export async function getDueQueue(input: GetDueQueueInput, deps: GetDueQueueDeps): Promise<DueCard[]> {
  const dayStart = startOfDayInTimezone(input.now, input.timezone ?? 'UTC');
  const seen = await deps.reviewCards.listMasteryInputs(input.userId);
  const seenIds = new Set(seen.map((s) => s.questionId));

  // Overfetch due cards when a topic filter is active, since some will be
  // filtered out after their question details come back.
  const filtered = Boolean(input.topicPath || input.topicPaths?.length || input.difficulties?.length);
  const dueLimit = filtered ? Math.max(input.limit * 4, 100) : input.limit;
  const due = await deps.reviewCards.listDue(input.userId, input.now, dueLimit);
  const dueStateByQuestion = new Map(
    due.map((card) => [card.questionId, { interval: card.interval, easeFactor: card.easeFactor, lapses: card.lapses }]),
  );

  const newIntroducedToday = await deps.reviewCards.countCreatedSince(input.userId, dayStart);
  const newBudget = Math.max(0, input.newCardCap - newIntroducedToday);

  const dueDetails = await Promise.all(
    due.map((card) => getQuestion({ id: card.questionId, viewerId: input.userId, viewerIsAdmin: false, revealAnswer: true }, deps)),
  );
  const dueCards: DueCard[] = dueDetails
    .flatMap((r) => (r.ok ? [r.value] : [])) // a question archived after review quietly drops off rather than erroring the session
    .filter((q) => isUnderTopic(q.topicPath, input.topicPath) && isUnderAny(q.topicPath, input.topicPaths))
    .filter((q) => !input.difficulties?.length || (input.difficulties as readonly string[]).includes(q.difficulty))
    .slice(0, input.limit)
    .map((question) => ({
      question,
      isNew: false,
      previewIntervals: previewIntervals(dueStateByQuestion.get(question.id)!, deps.scheduler, input.now),
    }));

  const remaining = input.limit - dueCards.length;
  let newCards: DueCard[] = [];
  if (remaining > 0 && newBudget > 0) {
    const page = await searchQuestions(
      {
        topicPath: input.topicPath,
        topicPaths: input.topicPaths?.length ? input.topicPaths : undefined,
        difficulties: input.difficulties?.length
          ? input.difficulties
          : input.preferredDifficulty
            ? [input.preferredDifficulty]
            : undefined,
        excludeIds: [...seenIds],
        sort: 'oldest',
        page: { limit: Math.min(remaining, newBudget), offset: 0 },
        viewerIsAdmin: false,
      },
      deps,
    );
    const details = await Promise.all(
      page.items.map((q) => getQuestion({ id: q.id, viewerId: input.userId, viewerIsAdmin: false, revealAnswer: true }, deps)),
    );
    newCards = details.flatMap((r) =>
      r.ok
        ? [{ question: r.value, isNew: true, previewIntervals: previewIntervals(NEW_REVIEW_STATE, deps.scheduler, input.now) }]
        : [],
    );
  }

  return [...dueCards, ...newCards];
}
