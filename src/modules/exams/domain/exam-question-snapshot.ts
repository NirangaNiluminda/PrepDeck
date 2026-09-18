/**
 * A frozen copy of a question's content at the moment an exam was built —
 * not a reference. Editing the live question afterward must never change
 * what a past exam asked or how it was scored, so nothing here is ever
 * re-fetched from the questions module once an exam exists.
 */
export interface ExamOptionSnapshot {
  readonly id: string;
  readonly text: string;
  /** Known server-side only; stripped before an in-progress exam's questions are sent to the client. */
  readonly correct: boolean;
}

export interface ExamQuestionSnapshot {
  /** The live question's id, kept only so a results page can link back to it — never used to re-fetch content. */
  readonly questionId: string;
  readonly stem: string;
  readonly type: string;
  readonly difficulty: string;
  readonly topicPath: string;
  readonly options?: readonly ExamOptionSnapshot[];
  readonly answer: {
    readonly modelAnswer: string;
    readonly keyPoints: readonly string[];
    readonly explanation?: string;
    readonly references?: readonly string[];
  };
}
