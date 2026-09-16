import type { Question } from './question';

export interface FieldChange {
  readonly field: string;
  readonly before: string;
  readonly after: string;
}

/**
 * What an edit changes, field by field. Drives the importer's dry run, and
 * lets a re-import of an untouched file skip the write instead of bumping the
 * version for nothing.
 */
export function diffQuestions(before: Question, after: Question): FieldChange[] {
  const a = before.snapshot();
  const b = after.snapshot();

  const fields: [string, unknown, unknown][] = [
    ['slug', a.slug, b.slug],
    ['stem', a.stem, b.stem],
    ['type', a.type, b.type],
    ['difficulty', a.difficulty, b.difficulty],
    ['topicPath', a.topicPath.value, b.topicPath.value],
    ['tags', a.tags, b.tags],
    ['status', a.status, b.status],
    ['answer.modelAnswer', a.answer.modelAnswer, b.answer.modelAnswer],
    ['answer.keyPoints', a.answer.keyPoints, b.answer.keyPoints],
    ['answer.explanation', a.answer.explanation, b.answer.explanation],
    ['answer.references', a.answer.references, b.answer.references],
    ['options', a.options, b.options],
    ['source', a.source, b.source],
  ];

  return fields
    .map(([field, x, y]) => ({ field, before: show(x), after: show(y) }))
    .filter((change) => change.before !== change.after);
}

// Missing, null and an empty list all mean "nothing here". Storage can turn
// one into another on a round trip, and that must not read as an edit.
const show = (value: unknown): string => {
  if (value === undefined || value === null) return '';
  if (Array.isArray(value)) return value.length ? JSON.stringify(value) : '';
  return typeof value === 'string' ? value : JSON.stringify(value);
};
