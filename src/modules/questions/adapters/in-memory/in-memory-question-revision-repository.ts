import type { QuestionRevision } from '../../domain/question-revision';
import type { QuestionRevisionRepository } from '../../ports/question-revision-repository';

export class InMemoryQuestionRevisionRepository implements QuestionRevisionRepository {
  private readonly store: QuestionRevision[] = [];

  async save(revision: QuestionRevision): Promise<void> {
    this.store.push(revision);
  }

  async listByQuestion(questionId: string): Promise<QuestionRevision[]> {
    return this.store
      .filter((r) => r.questionId === questionId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
