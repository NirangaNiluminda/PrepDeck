import type { QuestionDetail } from '@/modules/questions';
import type { TopicMastery } from '../domain/mastery';
import type { Rating } from '../domain/rating';

export interface DueCard {
  readonly question: QuestionDetail;
  /** True if this card has never been reviewed before — counts against the daily new-card cap. */
  readonly isNew: boolean;
  /** Days until the next review under each rating, for "Good → 6d"-style buttons. */
  readonly previewIntervals: Record<Rating, number>;
}

export interface ProgressSummary {
  readonly streak: number;
  readonly cardsDue: number;
  readonly totalReviewed: number;
  readonly topics: readonly TopicMastery[];
}
