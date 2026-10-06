import type { QuestionRepository, SimilarQuestion } from '../ports/question-repository';

export interface FindSimilarQuestionsInput {
  readonly stem: string;
  readonly limit?: number;
}

const DEFAULT_LIMIT = 5;

/**
 * Read-only, so the community submit form can call this live as someone
 * types (before there's a Submission to attach anything to), and moderation
 * can call it again at review time against the final wording.
 */
export async function findSimilarQuestions(
  input: FindSimilarQuestionsInput,
  deps: { questions: QuestionRepository },
): Promise<SimilarQuestion[]> {
  const stem = input.stem.trim();
  if (stem.length < 10) return [];
  return deps.questions.findSimilarByStem(stem, input.limit ?? DEFAULT_LIMIT);
}
