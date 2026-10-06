import type { QuestionRevision } from '../domain/question-revision';
import type { QuestionRevisionRepository } from '../ports/question-revision-repository';

export interface ListQuestionRevisionsInput {
  readonly questionId: string;
}

/** Newest first, so "History" reads as a timeline back from the current version. */
export async function listQuestionRevisions(
  input: ListQuestionRevisionsInput,
  deps: { revisions: QuestionRevisionRepository },
): Promise<QuestionRevision[]> {
  return deps.revisions.listByQuestion(input.questionId);
}
