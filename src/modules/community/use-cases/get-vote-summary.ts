import type { VoteDirection } from '../domain/vote';
import type { QuestionVoteTally, VoteRepository } from '../ports/vote-repository';

export interface GetVoteSummaryInput {
  readonly questionId: string;
  readonly viewerId: string | null;
}

export interface VoteSummary {
  readonly tally: QuestionVoteTally;
  readonly viewerDirection: VoteDirection | null;
}

/** Read-only — the question page calls this to render the current score, no vote cast. */
export async function getVoteSummary(
  input: GetVoteSummaryInput,
  deps: { votes: VoteRepository },
): Promise<VoteSummary> {
  const [tally, vote] = await Promise.all([
    deps.votes.tallyByQuestion([input.questionId]).then((rows) => rows[0]),
    input.viewerId ? deps.votes.findByUser(input.viewerId, input.questionId) : null,
  ]);

  return {
    tally: tally ?? { questionId: input.questionId, up: 0, down: 0, score: 0 },
    viewerDirection: vote?.direction ?? null,
  };
}
