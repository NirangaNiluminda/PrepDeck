import { type Result, ok, err, notFound } from '@/shared/result';
import { listQuestionDetails, type QuestionDetail, type QuestionRepository } from '@/modules/questions';
import { questionMastery } from '../domain/mastery';
import { type StudyStatus, packProgress, studyStatus } from '../domain/pack-progress';
import type { StudyPackView } from '../ports/dto';
import type { ReviewCardRepository } from '../ports/review-card-repository';
import type { StudyPackRepository } from '../ports/study-pack-repository';
import { MAX_PACK_QUESTIONS, packDifficulties, toStudyPackView } from './_pack-questions';

export interface GetStudyPackQuestionsInput {
  readonly userId: string;
  readonly packId: string;
  readonly now: Date;
}

export interface StudyPackItem {
  readonly question: QuestionDetail;
  readonly status: StudyStatus;
  /** 0–100; undefined until the learner has rated the question once. */
  readonly mastery?: number;
}

export interface StudyPackContents {
  readonly pack: StudyPackView & { readonly status: string };
  /** Grouped by topic, oldest first within a topic — the order a pack reads in. */
  readonly items: readonly StudyPackItem[];
}

/**
 * Everything a pack's study list shows, answers included, in two reads: the
 * questions in one query and the learner's cards in another, rather than one
 * query per question.
 */
export async function getStudyPackQuestions(
  input: GetStudyPackQuestionsInput,
  deps: { readonly studyPacks: StudyPackRepository; readonly reviewCards: ReviewCardRepository; readonly questions: QuestionRepository },
): Promise<Result<StudyPackContents>> {
  const pack = await deps.studyPacks.findForUser(input.userId, input.packId);
  if (!pack) return err(notFound('Study pack', input.packId));

  const [questions, cards] = await Promise.all([
    listQuestionDetails(
      {
        topicPaths: pack.topicPaths,
        difficulties: packDifficulties(pack),
        page: { limit: MAX_PACK_QUESTIONS, offset: 0 },
        sort: 'oldest',
      },
      deps,
    ),
    deps.reviewCards.listCardStates(input.userId),
  ]);

  const cardOf = new Map(cards.map((c) => [c.questionId, c]));
  // Array.sort is stable, so 'oldest' order survives within each topic.
  const items = [...questions]
    .sort((a, b) => a.topicPath.localeCompare(b.topicPath))
    .map((question) => {
      const card = cardOf.get(question.id);
      return { question, status: studyStatus(card, input.now), mastery: card ? questionMastery(card) : undefined };
    });

  const progress = packProgress(questions.map((q) => q.id), cards, input.now);
  return ok({ pack: { ...toStudyPackView(pack, progress), status: pack.status }, items });
}
