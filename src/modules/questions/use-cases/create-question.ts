import type { Clock, IdGenerator } from '@/shared/ports';
import { type Result, ok, err, conflict } from '@/shared/result';
import { Question, type QuestionContent } from '../domain/question';
import type { QuestionRepository } from '../ports/question-repository';
import { type QuestionDetail, toDetail } from '../ports/dto';

export interface CreateQuestionInput extends QuestionContent {
  readonly authorId: string;
}

export interface CreateQuestionDeps {
  readonly questions: QuestionRepository;
  readonly clock: Clock;
  readonly ids: IdGenerator;
}

/**
 * Clock and IdGenerator are injected rather than called inline so the test can
 * assert on exact values instead of `expect.any(Date)`.
 */
export async function createQuestion(
  input: CreateQuestionInput,
  deps: CreateQuestionDeps,
): Promise<Result<QuestionDetail>> {
  if (await deps.questions.existsWithStem(input.stem)) {
    return err(conflict('A question with this wording already exists'));
  }

  const created = Question.create({
    ...input,
    id: deps.ids.next(),
    now: deps.clock.now(),
  });
  if (!created.ok) return created;

  const { slug } = created.value;
  if (slug && (await deps.questions.findBySlug(slug))) {
    return err(conflict(`Slug '${slug}' is already taken`));
  }

  await deps.questions.save(created.value);
  return ok(toDetail(created.value, true));
}
