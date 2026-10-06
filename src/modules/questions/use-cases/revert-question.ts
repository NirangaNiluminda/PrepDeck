import type { Clock, IdGenerator } from '@/shared/ports';
import { type Result, err, notFound } from '@/shared/result';
import type { QuestionRepository } from '../ports/question-repository';
import type { QuestionRevisionRepository } from '../ports/question-revision-repository';
import type { QuestionDetail } from '../ports/dto';
import { updateQuestion } from './update-question';

export interface RevertQuestionInput {
  readonly questionId: string;
  readonly revisionId: string;
  readonly editorId: string;
  readonly editorIsAdmin: boolean;
}

/**
 * A revert is just an edit whose content came from history instead of a form
 * — reusing `updateQuestion` means it gets the same invariant checks, the
 * same conflict-on-duplicate-wording guard, and snapshots the version it
 * replaced too, so reverting is itself undoable.
 */
export async function revertQuestion(
  input: RevertQuestionInput,
  deps: { questions: QuestionRepository; revisions: QuestionRevisionRepository; clock: Clock; ids: IdGenerator },
): Promise<Result<QuestionDetail>> {
  const revisions = await deps.revisions.listByQuestion(input.questionId);
  const target = revisions.find((r) => r.id === input.revisionId);
  if (!target) return err(notFound('Revision', input.revisionId));

  return updateQuestion(
    {
      ...target.content,
      id: input.questionId,
      editorId: input.editorId,
      editorIsAdmin: input.editorIsAdmin,
    },
    deps,
  );
}
