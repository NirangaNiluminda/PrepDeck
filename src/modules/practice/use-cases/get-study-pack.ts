import { type Result, ok, err, notFound } from '@/shared/result';
import type { QuestionRepository } from '@/modules/questions';
import type { StudyPackView } from '../ports/dto';
import type { ReviewCardRepository } from '../ports/review-card-repository';
import type { StudyPackRepository } from '../ports/study-pack-repository';
import { viewWithProgress } from './_pack-questions';

export interface GetStudyPackInput {
  readonly userId: string;
  readonly packId: string;
  readonly now: Date;
}

/** Archived packs are still readable by their owner, so an old link explains itself instead of 404ing. */
export async function getStudyPack(
  input: GetStudyPackInput,
  deps: { readonly studyPacks: StudyPackRepository; readonly reviewCards: ReviewCardRepository; readonly questions: QuestionRepository },
): Promise<Result<StudyPackView & { readonly status: string }>> {
  const pack = await deps.studyPacks.findForUser(input.userId, input.packId);
  if (!pack) return err(notFound('Study pack', input.packId));

  const cards = await deps.reviewCards.listCardStates(input.userId);
  const view = await viewWithProgress(pack, cards, input.now, deps);
  return ok({ ...view, status: pack.status });
}
