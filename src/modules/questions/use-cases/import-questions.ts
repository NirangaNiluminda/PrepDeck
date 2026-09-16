import type { Clock, IdGenerator } from '@/shared/ports';
import { type AppError, type Result, ok, err, conflict } from '@/shared/result';
import { Question, type QuestionContent, type QuestionStatus } from '../domain/question';
import { type FieldChange, diffQuestions } from '../domain/question-diff';
import type { QuestionRepository } from '../ports/question-repository';

export interface ImportQuestionItem extends QuestionContent {
  /** Required on import: the slug is what turns a second run into an update. */
  readonly slug: string;
}

export interface ImportQuestionsInput {
  readonly items: readonly ImportQuestionItem[];
  readonly authorId: string;
  /** Publish new questions and pending drafts. Archived questions stay archived. */
  readonly publish: boolean;
  readonly dryRun: boolean;
}

export type ImportOutcome =
  | { readonly slug: string; readonly kind: 'created'; readonly status: QuestionStatus }
  | { readonly slug: string; readonly kind: 'updated'; readonly changes: readonly FieldChange[] }
  | { readonly slug: string; readonly kind: 'unchanged' }
  | { readonly slug: string; readonly kind: 'failed'; readonly error: AppError };

export interface ImportReport {
  readonly outcomes: readonly ImportOutcome[];
  /** False for a dry run, and when there was nothing to write. */
  readonly written: boolean;
}

export interface ImportQuestionsDeps {
  readonly questions: QuestionRepository;
  readonly clock: Clock;
  readonly ids: IdGenerator;
}

interface ImportContext {
  readonly authorId: string;
  readonly publish: boolean;
  readonly now: Date;
  readonly seenSlugs: Set<string>;
  readonly seenStems: Set<string>;
}

/**
 * Upserts by slug so the same files can be imported any number of times: a new
 * slug is created, an edited file updates its question in place, and an
 * untouched file is skipped without a write. One bad item fails on its own;
 * the rest still import. A dry run returns the identical report and saves nothing.
 */
export async function importQuestions(
  input: ImportQuestionsInput,
  deps: ImportQuestionsDeps,
): Promise<ImportReport> {
  const ctx: ImportContext = {
    authorId: input.authorId,
    publish: input.publish,
    now: deps.clock.now(),
    seenSlugs: new Set(),
    seenStems: new Set(),
  };
  const outcomes: ImportOutcome[] = [];
  const toSave: Question[] = [];

  for (const item of input.items) {
    const result = await importOne(item, ctx, deps);
    if (!result.ok) {
      outcomes.push({ slug: item.slug, kind: 'failed', error: result.error });
      continue;
    }
    outcomes.push(result.value.outcome);
    if (result.value.save) toSave.push(result.value.save);
  }

  const written = !input.dryRun && toSave.length > 0;
  if (written) await deps.questions.saveMany(toSave);
  return { outcomes, written };
}

async function importOne(
  item: ImportQuestionItem,
  ctx: ImportContext,
  deps: ImportQuestionsDeps,
): Promise<Result<{ outcome: ImportOutcome; save?: Question }>> {
  // Checked against the batch as well as storage: in a dry run nothing is
  // saved, so storage alone would never see a clash between two files.
  if (ctx.seenSlugs.has(item.slug)) {
    return err(conflict(`Slug '${item.slug}' appears more than once in this import`));
  }
  ctx.seenSlugs.add(item.slug);

  const stemKey = item.stem.trim().toLowerCase();
  if (ctx.seenStems.has(stemKey)) {
    return err(conflict('Another question in this import has the same wording'));
  }
  ctx.seenStems.add(stemKey);

  const existing = await deps.questions.findBySlug(item.slug);
  const candidate = existing
    ? existing.reviseContent(item, ctx.now)
    : Question.create({ ...item, id: deps.ids.next(), authorId: ctx.authorId, now: ctx.now });
  if (!candidate.ok) return candidate;

  if (await deps.questions.existsWithStem(item.stem, existing?.id)) {
    return err(conflict('A different question already has this wording'));
  }

  const question = ctx.publish ? publishIfPending(candidate.value, ctx.now) : candidate.value;

  if (!existing) {
    return ok({ outcome: { slug: item.slug, kind: 'created', status: question.status }, save: question });
  }

  const changes = diffQuestions(existing, question);
  return changes.length
    ? ok({ outcome: { slug: item.slug, kind: 'updated', changes }, save: question })
    : ok({ outcome: { slug: item.slug, kind: 'unchanged' } });
}

// An archived question was hidden on purpose; re-running an import must not
// quietly bring it back. Restoring it is a separate, deliberate act.
const publishIfPending = (question: Question, now: Date): Question => {
  if (question.status !== 'draft' && question.status !== 'in-review') return question;
  const published = question.publish(now);
  return published.ok ? published.value : question;
};
