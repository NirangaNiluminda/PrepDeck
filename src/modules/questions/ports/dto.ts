import type { Question } from '../domain/question';

/**
 * What crosses the module boundary. The domain entity stays inside: it carries
 * the model answer, and a list endpoint must never leak answers to a learner
 * mid-exam. Mapping here is a security boundary, not ceremony.
 */
export interface QuestionSummary {
  readonly id: string;
  readonly stem: string;
  readonly type: string;
  readonly difficulty: string;
  readonly topicPath: string;
  readonly tags: readonly string[];
  readonly status: string;
  readonly updatedAt: string;
}

export interface QuestionDetail extends QuestionSummary {
  readonly slug?: string;
  readonly source?: string;
  readonly options?: readonly { id: string; text: string }[];
  readonly answer?: {
    readonly modelAnswer: string;
    readonly keyPoints: readonly string[];
    readonly explanation?: string;
    readonly references?: readonly string[];
    /**
     * Lives with the answer, not on the options, so withholding the answer
     * (reveal=false during an exam) withholds this too.
     */
    readonly correctOptionId?: string;
  };
}

export const toSummary = (q: Question): QuestionSummary => ({
  id: q.id,
  stem: q.stem,
  type: q.type,
  difficulty: q.difficulty,
  topicPath: q.topicPath.value,
  tags: q.tags,
  status: q.status,
  updatedAt: q.updatedAt.toISOString(),
});

/** `includeAnswer` is a decision the caller must make explicitly. */
export const toDetail = (q: Question, includeAnswer: boolean): QuestionDetail => ({
  ...toSummary(q),
  slug: q.slug,
  source: q.source,
  options: q.options?.map((o) => ({ id: o.id, text: o.text })),
  answer: includeAnswer
    ? {
        modelAnswer: q.answer.modelAnswer,
        keyPoints: q.answer.keyPoints,
        explanation: q.answer.explanation,
        references: q.answer.references,
        correctOptionId: q.options?.find((o) => o.correct)?.id,
      }
    : undefined,
});
