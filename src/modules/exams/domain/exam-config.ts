/**
 * What the learner picked in the exam builder. Kept as loose `string`s for
 * topic/difficulty/type rather than importing questions' own types — this is
 * a record of what was asked for, and remains meaningful even if the
 * questions module's taxonomy changes later. Content rules live where the
 * values come from (the questions module); this only checks shape.
 */
export interface ExamConfig {
  readonly topicPaths?: readonly string[];
  readonly difficulties?: readonly string[];
  readonly types?: readonly string[];
  readonly count: number;
  readonly durationMinutes: number;
}

export const MIN_QUESTIONS = 1;
export const MAX_QUESTIONS = 100;
export const MIN_DURATION_MINUTES = 1;
export const MAX_DURATION_MINUTES = 240;
