export interface ExamAnswer {
  readonly questionId: string;
  /** MCQ only; scored automatically against the snapshot's correct option. */
  readonly selectedOptionId?: string;
  /** Everything else; the learner's own judgment against the model answer, given after submitting. */
  readonly selfGradedCorrect?: boolean;
  readonly flagged: boolean;
  /** When this became "done" — an MCQ pick, or a self-grade. Drives time-per-question on the results page. */
  readonly answeredAt?: Date;
}
