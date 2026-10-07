import type { Clock, IdGenerator } from '@/shared/ports';
import { type Result, ok, err, validationError } from '@/shared/result';
import type { QuestionRepository } from '@/modules/questions';
import { StudyPack } from '../domain/study-pack';
import type { StudyPackRepository } from '../ports/study-pack-repository';
import { packQuestionIds } from './_pack-questions';

export interface CreateStudyPackInput {
  /** From the session, never the request. */
  readonly userId: string;
  readonly name: string;
  readonly topicPaths: readonly string[];
  readonly difficulties?: readonly string[];
}

export const MAX_ACTIVE_PACKS = 30;

export async function createStudyPack(
  input: CreateStudyPackInput,
  deps: {
    readonly studyPacks: StudyPackRepository;
    readonly questions: QuestionRepository;
    readonly clock: Clock;
    readonly ids: IdGenerator;
  },
): Promise<Result<StudyPack>> {
  const created = StudyPack.create(
    { id: deps.ids.next(), userId: input.userId, name: input.name, topicPaths: input.topicPaths, difficulties: input.difficulties ?? [] },
    deps.clock.now(),
  );
  if (!created.ok) return created;

  if ((await deps.studyPacks.countActiveByUser(input.userId)) >= MAX_ACTIVE_PACKS) {
    return err(validationError(`You can have at most ${MAX_ACTIVE_PACKS} packs. Archive one you've finished first.`));
  }
  // An empty pack would open straight onto "nothing to study", so say so now.
  if ((await packQuestionIds(created.value, deps)).length === 0) {
    return err(validationError('No published questions match those topics and difficulties yet'));
  }

  await deps.studyPacks.save(created.value);
  return ok(created.value);
}
