import type { ExamAnswer } from './exam-answer';
import type { ExamQuestionSnapshot } from './exam-question-snapshot';

export interface TopicScore {
  readonly topicPath: string;
  readonly correct: number;
  readonly total: number;
}

export interface ExamScore {
  readonly correct: number;
  /** Graded so far — an unanswered MCQ counts as wrong and is included; an ungraded non-MCQ is not. */
  readonly total: number;
  /** Non-MCQ questions still awaiting the learner's own judgment. */
  readonly pending: number;
  /** 0–100 over `total`. 0 when nothing is graded yet, not NaN. */
  readonly percent: number;
  readonly byTopic: readonly TopicScore[];
}

/**
 * true/false once graded, undefined while a non-MCQ question is still
 * awaiting self-grading. An MCQ is always immediately gradable — skipping it
 * is a wrong answer, the same as getting it wrong, not a pending one.
 */
function isCorrect(snapshot: ExamQuestionSnapshot, answer: ExamAnswer | undefined): boolean | undefined {
  if (snapshot.type === 'mcq') {
    return snapshot.options?.some((o) => o.id === answer?.selectedOptionId && o.correct) ?? false;
  }
  return answer?.selfGradedCorrect;
}

/** Pure: the same snapshots and answers always score the same way. */
export function computeScore(
  snapshots: readonly ExamQuestionSnapshot[],
  answers: ReadonlyMap<string, ExamAnswer>,
): ExamScore {
  let correct = 0;
  let total = 0;
  let pending = 0;
  const byTopic = new Map<string, { correct: number; total: number }>();

  for (const snapshot of snapshots) {
    const result = isCorrect(snapshot, answers.get(snapshot.questionId));
    if (result === undefined) {
      pending++;
      continue;
    }
    total++;
    if (result) correct++;

    const topic = byTopic.get(snapshot.topicPath) ?? { correct: 0, total: 0 };
    topic.total++;
    if (result) topic.correct++;
    byTopic.set(snapshot.topicPath, topic);
  }

  return {
    correct,
    total,
    pending,
    percent: total > 0 ? Math.round((correct / total) * 100) : 0,
    byTopic: [...byTopic.entries()]
      .map(([topicPath, t]) => ({ topicPath, ...t }))
      .sort((a, b) => a.topicPath.localeCompare(b.topicPath)),
  };
}
