import type { QuestionContent } from './question';

/**
 * An immutable snapshot of a question's content, taken right before an edit
 * overwrites it. No entity behaviour of its own — it is a historical record,
 * never mutated once written, so a plain interface is enough.
 */
export interface QuestionRevision {
  readonly id: string;
  readonly questionId: string;
  /** The version this revision was current as of, i.e. the state the edit replaced. */
  readonly version: number;
  readonly content: QuestionContent;
  readonly editedBy: string;
  readonly createdAt: Date;
}
