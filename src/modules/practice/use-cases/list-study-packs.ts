import type { QuestionRepository } from '@/modules/questions';
import type { StudyPackView } from '../ports/dto';
import type { ReviewCardRepository } from '../ports/review-card-repository';
import type { StudyPackRepository } from '../ports/study-pack-repository';
import { viewWithProgress } from './_pack-questions';

export interface ListStudyPacksInput {
  readonly userId: string;
  readonly now: Date;
}

/** Active packs with progress, most recently studied first — the one to resume is at the top. */
export async function listStudyPacks(
  input: ListStudyPacksInput,
  deps: { readonly studyPacks: StudyPackRepository; readonly reviewCards: ReviewCardRepository; readonly questions: QuestionRepository },
): Promise<StudyPackView[]> {
  const [packs, cards] = await Promise.all([
    deps.studyPacks.listActiveByUser(input.userId),
    deps.reviewCards.listCardStates(input.userId),
  ]);
  const views = await Promise.all(packs.map((pack) => viewWithProgress(pack, cards, input.now, deps)));

  const recency = (v: StudyPackView) => (v.progress.lastStudiedAt ?? v.createdAt).getTime();
  return views.sort((a, b) => recency(b) - recency(a));
}
