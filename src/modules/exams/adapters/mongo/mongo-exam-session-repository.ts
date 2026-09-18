import type { Collection } from 'mongodb';
import { ExamSession } from '../../domain/exam-session';
import type { ExamAnswer } from '../../domain/exam-answer';
import type { ExamSessionRepository } from '../../ports/exam-session-repository';
import type { ExamAnswerDocument, ExamSessionDocument } from './exam-session-document';

// Mongo stores an `undefined` property as null; dropping those keys keeps an
// optional field genuinely absent, matching what the domain layer expects
// back (`undefined`, not `null`) on the way out.
const withoutUndefined = <T extends object>(value: T): T =>
  Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as T;

const toDomain = (doc: ExamSessionDocument): ExamSession =>
  ExamSession.fromPersistence({
    id: doc._id,
    userId: doc.userId,
    config: doc.config,
    snapshots: doc.snapshots,
    answers: new Map(doc.answers.map((a) => [a.questionId, a])),
    status: doc.status as ExamSession['status'],
    startedAt: doc.startedAt,
    finishedAt: doc.finishedAt ?? undefined,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });

const toAnswerDoc = (answer: ExamAnswer): ExamAnswerDocument => withoutUndefined({ ...answer });

export class MongoExamSessionRepository implements ExamSessionRepository {
  constructor(private readonly collection: Collection<ExamSessionDocument>) {}

  async findById(id: string): Promise<ExamSession | null> {
    const doc = await this.collection.findOne({ _id: id });
    return doc ? toDomain(doc) : null;
  }

  async listByUser(userId: string): Promise<ExamSession[]> {
    const docs = await this.collection.find({ userId }).sort({ startedAt: -1 }).toArray();
    return docs.map(toDomain);
  }

  async save(session: ExamSession): Promise<void> {
    const p = session.snapshot();
    const doc: ExamSessionDocument = withoutUndefined({
      _id: p.id,
      userId: p.userId,
      config: p.config,
      snapshots: [...p.snapshots],
      answers: [...p.answers.values()].map(toAnswerDoc),
      status: p.status,
      startedAt: p.startedAt,
      finishedAt: p.finishedAt,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    });
    await this.collection.replaceOne({ _id: doc._id }, doc, { upsert: true });
  }
}
