import type { Vote } from '../../domain/vote';
import type { QuestionVoteTally, VoteRepository } from '../../ports/vote-repository';

const keyOf = (userId: string, questionId: string) => JSON.stringify([userId, questionId]);

export class InMemoryVoteRepository implements VoteRepository {
  private readonly store = new Map<string, Vote>();

  async upsert(vote: Vote): Promise<void> {
    this.store.set(keyOf(vote.userId, vote.questionId), vote);
  }

  async remove(userId: string, questionId: string): Promise<void> {
    this.store.delete(keyOf(userId, questionId));
  }

  async findByUser(userId: string, questionId: string): Promise<Vote | null> {
    return this.store.get(keyOf(userId, questionId)) ?? null;
  }

  async tallyByQuestion(questionIds: readonly string[]): Promise<QuestionVoteTally[]> {
    const wanted = new Set(questionIds);
    const tallies = new Map<string, { up: number; down: number }>();
    for (const vote of this.store.values()) {
      if (!wanted.has(vote.questionId)) continue;
      const t = tallies.get(vote.questionId) ?? { up: 0, down: 0 };
      if (vote.direction === 1) t.up += 1;
      else t.down += 1;
      tallies.set(vote.questionId, t);
    }
    return [...tallies.entries()].map(([questionId, t]) => ({
      questionId,
      up: t.up,
      down: t.down,
      score: t.up - t.down,
    }));
  }
}
