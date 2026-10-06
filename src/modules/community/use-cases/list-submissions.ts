import type { Page } from '@/shared/ports';
import { type Result, ok, err, forbidden } from '@/shared/result';
import type { SubmissionStatus } from '../domain/submission';
import type { SubmissionRepository } from '../ports/submission-repository';
import { type SubmissionView, toSubmissionView } from '../ports/dto';

export interface ListSubmissionsInput {
  readonly viewerIsAdmin: boolean;
  readonly statuses?: readonly SubmissionStatus[];
}

/** The moderation queue — every author's submissions, so it's admin-only. */
export async function listSubmissions(
  input: ListSubmissionsInput,
  deps: { submissions: SubmissionRepository },
): Promise<Result<Page<SubmissionView>>> {
  if (!input.viewerIsAdmin) {
    return err(forbidden('Only moderators may view the submission queue'));
  }
  const page = await deps.submissions.findByFilter({ statuses: input.statuses ?? ['pending'] });
  return ok({ ...page, items: page.items.map(toSubmissionView) });
}
