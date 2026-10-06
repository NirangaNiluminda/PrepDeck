import { type Result, ok, err, forbidden, notFound } from '@/shared/result';
import type { SubmissionRepository } from '../ports/submission-repository';
import { type SubmissionView, toSubmissionView } from '../ports/dto';

export interface GetSubmissionInput {
  readonly id: string;
  readonly viewerId: string;
  readonly viewerIsAdmin: boolean;
}

/** Visible to its own author and to moderators — no one else's submission is anyone else's business. */
export async function getSubmission(
  input: GetSubmissionInput,
  deps: { submissions: SubmissionRepository },
): Promise<Result<SubmissionView>> {
  const submission = await deps.submissions.findById(input.id);
  if (!submission) return err(notFound('Submission', input.id));
  if (submission.authorId !== input.viewerId && !input.viewerIsAdmin) {
    return err(forbidden('Not allowed to view this submission'));
  }
  return ok(toSubmissionView(submission));
}
