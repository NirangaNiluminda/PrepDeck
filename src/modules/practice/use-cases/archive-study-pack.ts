import type { Clock } from '@/shared/ports';
import { type Result, ok, err, notFound } from '@/shared/result';
import type { StudyPackRepository } from '../ports/study-pack-repository';

export interface ArchiveStudyPackInput {
  readonly userId: string;
  readonly packId: string;
}

/** Soft delete. The review cards stay: archiving a pack never forgets what was learned. */
export async function archiveStudyPack(
  input: ArchiveStudyPackInput,
  deps: { readonly studyPacks: StudyPackRepository; readonly clock: Clock },
): Promise<Result<void>> {
  const pack = await deps.studyPacks.findForUser(input.userId, input.packId);
  if (!pack) return err(notFound('Study pack', input.packId));

  await deps.studyPacks.save(pack.archive(deps.clock.now()));
  return ok(undefined);
}
