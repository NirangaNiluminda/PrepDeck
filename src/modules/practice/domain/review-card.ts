import type { Rating } from './rating';
import { NEW_REVIEW_STATE } from './scheduler';
import type { ReviewScheduler } from '../ports/review-scheduler';

export interface ReviewCardProps {
  readonly userId: string;
  readonly questionId: string;
  readonly interval: number;
  readonly easeFactor: number;
  readonly dueDate: Date;
  readonly lapses: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

export class ReviewCard {
  private constructor(private readonly props: ReviewCardProps) {}

  /** One per (user, question), created lazily on first attempt. */
  static createNew(userId: string, questionId: string, now: Date): ReviewCard {
    return new ReviewCard({
      userId,
      questionId,
      ...NEW_REVIEW_STATE,
      dueDate: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPersistence(props: ReviewCardProps): ReviewCard {
    return new ReviewCard(props);
  }

  /** The only way a card's schedule changes — never set interval/dueDate directly. */
  review(rating: Rating, now: Date, scheduler: ReviewScheduler): ReviewCard {
    const next = scheduler.next(
      { interval: this.props.interval, easeFactor: this.props.easeFactor, lapses: this.props.lapses },
      rating,
      now,
    );
    return new ReviewCard({
      ...this.props,
      ...next,
      dueDate: addDays(now, next.interval),
      updatedAt: now,
    });
  }

  isDue(now: Date): boolean {
    return this.props.dueDate.getTime() <= now.getTime();
  }

  get userId() { return this.props.userId; }
  get questionId() { return this.props.questionId; }
  get interval() { return this.props.interval; }
  get easeFactor() { return this.props.easeFactor; }
  get dueDate() { return this.props.dueDate; }
  get lapses() { return this.props.lapses; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  snapshot(): ReviewCardProps {
    return this.props;
  }
}
