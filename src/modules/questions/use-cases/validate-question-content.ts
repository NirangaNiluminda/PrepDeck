import type { Result } from '@/shared/result';
import { Question, type QuestionContent } from '../domain/question';

/**
 * The same rules `createQuestion` enforces, exposed for a caller that only
 * wants to know whether content is good enough to save — a community
 * submission, before it has an id or an author to actually create a Question
 * with.
 */
export function validateQuestionContent(content: QuestionContent): Result<QuestionContent> {
  return Question.validateContent(content);
}
