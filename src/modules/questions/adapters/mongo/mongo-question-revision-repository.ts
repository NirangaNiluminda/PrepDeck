import type { Collection } from 'mongodb';
import type { QuestionRevision } from '../../domain/question-revision';
import type { QuestionRevisionRepository } from '../../ports/question-revision-repository';
import type { QuestionRevisionDocument } from './question-revision-document';

export class MongoQuestionRevisionRepository implements QuestionRevisionRepository {
  constructor(private readonly collection: Collection<QuestionRevisionDocument>) {}

  async save(revision: QuestionRevision): Promise<void> {
    await this.collection.insertOne({
      _id: revision.id,
      questionId: revision.questionId,
      version: revision.version,
      content: revision.content,
      editedBy: revision.editedBy,
      createdAt: revision.createdAt,
    });
  }

  async listByQuestion(questionId: string): Promise<QuestionRevision[]> {
    const docs = await this.collection.find({ questionId }).sort({ createdAt: -1 }).toArray();
    return docs.map((d) => ({
      id: d._id,
      questionId: d.questionId,
      version: d.version,
      content: d.content,
      editedBy: d.editedBy,
      createdAt: d.createdAt,
    }));
  }
}
