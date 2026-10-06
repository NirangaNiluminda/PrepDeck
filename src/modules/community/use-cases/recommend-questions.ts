import { searchQuestions, type QuestionRepository } from '@/modules/questions';
import type { VoteRepository } from '../ports/vote-repository';

export interface RecommendQuestionsInput {
  readonly topicPaths: readonly string[];
  readonly limit?: number;
}

export interface RecommendedQuestion {
  readonly id: string;
  readonly stem: string;
  readonly topicPath: string;
  readonly difficulty: string;
  readonly score: number;
}

const CANDIDATE_POOL = 100;
const DEFAULT_LIMIT = 10;

/**
 * "Highly-voted" is read literally: only questions with a positive net score
 * qualify, so a corpus nobody has voted on yet returns nothing rather than
 * an arbitrary ordering dressed up as a recommendation. The composition of
 * `getWeakAreas` (practice) with this use case happens at the app layer,
 * the same pattern exams+practice already established — community doesn't
 * depend on practice, and vice versa.
 */
export async function recommendQuestions(
  input: RecommendQuestionsInput,
  deps: { questions: QuestionRepository; votes: VoteRepository },
): Promise<RecommendedQuestion[]> {
  if (input.topicPaths.length === 0) return [];

  const candidates = await searchQuestions(
    { topicPaths: input.topicPaths, viewerIsAdmin: false, page: { limit: CANDIDATE_POOL, offset: 0 } },
    deps,
  );
  if (candidates.items.length === 0) return [];

  const tallies = await deps.votes.tallyByQuestion(candidates.items.map((q) => q.id));
  const scoreOf = new Map(tallies.map((t) => [t.questionId, t.score]));

  return candidates.items
    .map((q) => ({ id: q.id, stem: q.stem, topicPath: q.topicPath, difficulty: q.difficulty, score: scoreOf.get(q.id) ?? 0 }))
    .filter((q) => q.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, input.limit ?? DEFAULT_LIMIT);
}
