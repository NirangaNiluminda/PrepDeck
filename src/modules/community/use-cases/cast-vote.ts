import type { Clock, RateLimiter } from '@/shared/ports';
import { type Result, ok, err, notFound, validationError, rateLimited } from '@/shared/result';
import type { QuestionRepository } from '@/modules/questions';
import { isVoteDirection, type VoteDirection } from '../domain/vote';
import type { QuestionVoteTally, VoteRepository } from '../ports/vote-repository';

export interface CastVoteInput {
  /** From the session, never the request. */
  readonly userId: string;
  readonly questionId: string;
  /** 0 removes an existing vote — voting the same direction again is how the UI toggles it off. */
  readonly direction: VoteDirection | 0;
}

export interface CastVoteResult {
  readonly tally: QuestionVoteTally;
  readonly viewerDirection: VoteDirection | null;
}

const VOTE_LIMIT = 30;
const VOTE_WINDOW_SECONDS = 60;

export async function castVote(
  input: CastVoteInput,
  deps: { votes: VoteRepository; questions: QuestionRepository; rateLimiter: RateLimiter; clock: Clock },
): Promise<Result<CastVoteResult>> {
  if (input.direction !== 0 && !isVoteDirection(input.direction)) {
    return err(validationError('A vote must be up, down, or removed'));
  }

  const allowed = await deps.rateLimiter.consume(`vote:${input.userId}`, VOTE_LIMIT, VOTE_WINDOW_SECONDS);
  if (!allowed) return err(rateLimited('Too many votes — slow down'));

  const question = await deps.questions.findById(input.questionId);
  if (!question || question.status !== 'published') {
    return err(notFound('Question', input.questionId));
  }

  if (input.direction === 0) {
    await deps.votes.remove(input.userId, input.questionId);
  } else {
    await deps.votes.upsert({
      userId: input.userId,
      questionId: input.questionId,
      direction: input.direction,
      createdAt: deps.clock.now(),
    });
  }

  const [tally] = await deps.votes.tallyByQuestion([input.questionId]);
  return ok({
    tally: tally ?? { questionId: input.questionId, up: 0, down: 0, score: 0 },
    viewerDirection: input.direction === 0 ? null : input.direction,
  });
}
