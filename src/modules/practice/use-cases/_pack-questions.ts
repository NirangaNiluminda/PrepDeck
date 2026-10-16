import { DIFFICULTIES, searchQuestions, type Difficulty, type QuestionRepository } from '@/modules/questions';
import { type CardState, type PackProgress, packProgress } from '../domain/pack-progress';
import type { StudyPack } from '../domain/study-pack';
import type { StudyPackView } from '../ports/dto';

// A pack is a filter, not a list: it covers whatever is published under its
// topics right now. Past this many questions progress would undercount, which
// is far beyond any corpus this app holds; a repository-level count is the
// fix if that ever stops being true.
export const MAX_PACK_QUESTIONS = 2000;

/** Narrowed from the pack's loose strings to the questions module's union — the one place that needs it. */
export const packDifficulties = (pack: StudyPack): Difficulty[] | undefined => {
  const known = pack.difficulties.filter((d): d is Difficulty => (DIFFICULTIES as readonly string[]).includes(d));
  return known.length ? known : undefined;
};

export async function packQuestionIds(pack: StudyPack, deps: { readonly questions: QuestionRepository }): Promise<string[]> {
  const page = await searchQuestions(
    {
      topicPaths: pack.topicPaths,
      difficulties: packDifficulties(pack),
      page: { limit: MAX_PACK_QUESTIONS, offset: 0 },
      viewerIsAdmin: false,
    },
    deps,
  );
  return page.items.map((q) => q.id);
}

export function toStudyPackView(pack: StudyPack, progress: PackProgress): StudyPackView {
  return {
    id: pack.id,
    name: pack.name,
    topicPaths: pack.topicPaths,
    difficulties: pack.difficulties,
    createdAt: pack.createdAt,
    progress,
  };
}

/** One pack's view, given the learner's cards already loaded — list and get both use it. */
export async function viewWithProgress(
  pack: StudyPack,
  cards: readonly CardState[],
  now: Date,
  deps: { readonly questions: QuestionRepository },
): Promise<StudyPackView> {
  return toStudyPackView(pack, packProgress(await packQuestionIds(pack, deps), cards, now));
}
