import type { QuestionDetail } from '@/modules/questions';
import type { TopicMastery } from '../domain/mastery';

export interface DueCard {
  readonly question: QuestionDetail;
  /** True if this card has never been reviewed before — counts against the daily new-card cap. */
  readonly isNew: boolean;
}

export interface ProgressSummary {
  readonly streak: number;
  readonly cardsDue: number;
  readonly totalReviewed: number;
  readonly topics: readonly TopicMastery[];
}
