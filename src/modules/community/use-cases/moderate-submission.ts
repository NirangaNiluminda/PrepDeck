import type { Clock, IdGenerator } from '@/shared/ports';
import { type Result, ok, err, forbidden, notFound } from '@/shared/result';
import { createQuestion, publishQuestion, type QuestionRepository } from '@/modules/questions';
import type { ModerationDecision } from '../domain/submission';
import type { SubmissionRepository } from '../ports/submission-repository';
import { type SubmissionView, toSubmissionView } from '../ports/dto';

export interface ModerateSubmissionInput {
  readonly submissionId: string;
  readonly decision: ModerationDecision;
  readonly note?: string;
  readonly reviewerId: string;
  readonly reviewerIsAdmin: boolean;
}

export interface ModerateSubmissionDeps {
  readonly submissions: SubmissionRepository;
  readonly questions: QuestionRepository;
  readonly clock: Clock;
  readonly ids: IdGenerator;
}

/**
 * Approval composes straight into `questions`' own `createQuestion` +
 * `publishQuestion` — allowed because `community` depends on `questions` per
 * the module map, unlike the practice/exams pair, which has to compose in
 * the app layer instead (see CLAUDE.md rule 5).
 */
export async function moderateSubmission(
  input: ModerateSubmissionInput,
  deps: ModerateSubmissionDeps,
): Promise<Result<SubmissionView>> {
  if (!input.reviewerIsAdmin) {
    return err(forbidden('Only moderators may review submissions'));
  }

  const submission = await deps.submissions.findById(input.submissionId);
  if (!submission) return err(notFound('Submission', input.submissionId));

  if (input.decision === 'approved') {
    const created = await createQuestion({ ...submission.content, authorId: submission.authorId }, deps);
    if (!created.ok) return created;

    const published = await publishQuestion(
      { id: created.value.id, moderatorId: input.reviewerId, moderatorIsAdmin: true },
      deps,
    );
    if (!published.ok) return published;

    const approved = submission.approve(input.reviewerId, published.value.id, input.note, deps.clock.now());
    if (!approved.ok) return approved;
    await deps.submissions.save(approved.value);
    return ok(toSubmissionView(approved.value));
  }

  if (input.decision === 'rejected') {
    const rejected = submission.reject(input.reviewerId, input.note, deps.clock.now());
    if (!rejected.ok) return rejected;
    await deps.submissions.save(rejected.value);
    return ok(toSubmissionView(rejected.value));
  }

  const changesRequested = submission.requestChanges(input.reviewerId, input.note ?? '', deps.clock.now());
  if (!changesRequested.ok) return changesRequested;
  await deps.submissions.save(changesRequested.value);
  return ok(toSubmissionView(changesRequested.value));
}
