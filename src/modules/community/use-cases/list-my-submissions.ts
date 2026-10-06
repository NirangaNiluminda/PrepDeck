import type { SubmissionRepository } from '../ports/submission-repository';
import { type SubmissionView, toSubmissionView } from '../ports/dto';

export interface ListMySubmissionsInput {
  readonly authorId: string;
}

export async function listMySubmissions(
  input: ListMySubmissionsInput,
  deps: { submissions: SubmissionRepository },
): Promise<SubmissionView[]> {
  const page = await deps.submissions.findByFilter({ authorId: input.authorId });
  return page.items.map(toSubmissionView);
}
