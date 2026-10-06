import type { Clock, RateLimiter } from '@/shared/ports';
import { type Result, ok, err, forbidden, notFound, rateLimited } from '@/shared/result';
import { findSimilarQuestions, validateQuestionContent, type QuestionContent, type QuestionRepository } from '@/modules/questions';
import type { SubmissionRepository } from '../ports/submission-repository';
import { type SubmissionView, toSubmissionView } from '../ports/dto';

export interface ResubmitQuestionInput {
  readonly submissionId: string;
  readonly authorId: string;
  readonly content: QuestionContent;
}

export interface ResubmitQuestionDeps {
  readonly submissions: SubmissionRepository;
  readonly questions: QuestionRepository;
  readonly rateLimiter: RateLimiter;
  readonly clock: Clock;
}

const RESUBMIT_LIMIT = 10;
const RESUBMIT_WINDOW_SECONDS = 24 * 60 * 60;

/** After a moderator asks for changes, the author revises the same submission rather than starting a new one — its history stays attached. */
export async function resubmitQuestion(
  input: ResubmitQuestionInput,
  deps: ResubmitQuestionDeps,
): Promise<Result<SubmissionView>> {
  const submission = await deps.submissions.findById(input.submissionId);
  if (!submission) return err(notFound('Submission', input.submissionId));
  if (submission.authorId !== input.authorId) {
    return err(forbidden('Only the original author can revise a submission'));
  }

  const allowed = await deps.rateLimiter.consume(`submit:${input.authorId}`, RESUBMIT_LIMIT, RESUBMIT_WINDOW_SECONDS);
  if (!allowed) {
    return err(rateLimited(`You can submit at most ${RESUBMIT_LIMIT} questions a day`));
  }

  const content = validateQuestionContent(input.content);
  if (!content.ok) return content;

  const possibleDuplicates = await findSimilarQuestions({ stem: content.value.stem }, deps);
  const revised = submission.revise(content.value, possibleDuplicates, deps.clock.now());
  if (!revised.ok) return revised;

  await deps.submissions.save(revised.value);
  return ok(toSubmissionView(revised.value));
}
