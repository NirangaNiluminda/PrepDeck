import type { QuestionRevision } from '../domain/question-revision';

export interface QuestionRevisionRepository {
  save(revision: QuestionRevision): Promise<void>;
  /** Newest first. */
  listByQuestion(questionId: string): Promise<QuestionRevision[]>;
}
