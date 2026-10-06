import type { Clock, IdGenerator, RateLimiter } from '@/shared/ports';
import { type Result, ok, err, rateLimited } from '@/shared/result';
import { findSimilarQuestions, validateQuestionContent, type QuestionContent, type QuestionRepository } from '@/modules/questions';
import { Submission } from '../domain/submission';
import type { SubmissionRepository } from '../ports/submission-repository';
import { type SubmissionView, toSubmissionView } from '../ports/dto';

export interface SubmitQuestionInput {
  /** From the session, never the request. */
  readonly authorId: string;
  readonly content: QuestionContent;
}

export interface SubmitQuestionDeps {
  readonly submissions: SubmissionRepository;
  readonly questions: QuestionRepository;
  readonly rateLimiter: RateLimiter;
  readonly clock: Clock;
  readonly ids: IdGenerator;
}

const SUBMIT_LIMIT = 10;
const SUBMIT_WINDOW_SECONDS = 24 * 60 * 60;

export async function submitQuestion(
  input: SubmitQuestionInput,
  deps: SubmitQuestionDeps,
): Promise<Result<SubmissionView>> {
  const allowed = await deps.rateLimiter.consume(`submit:${input.authorId}`, SUBMIT_LIMIT, SUBMIT_WINDOW_SECONDS);
  if (!allowed) {
    return err(rateLimited(`You can submit at most ${SUBMIT_LIMIT} questions a day`));
  }

  const content = validateQuestionContent(input.content);
  if (!content.ok) return content;

  const possibleDuplicates = await findSimilarQuestions({ stem: content.value.stem }, deps);

  const submission = Submission.create({
    id: deps.ids.next(),
    authorId: input.authorId,
    content: content.value,
    possibleDuplicates,
    now: deps.clock.now(),
  });

  await deps.submissions.save(submission);
  return ok(toSubmissionView(submission));
}
