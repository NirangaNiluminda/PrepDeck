import { readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { describe, it, expect } from 'vitest';
import { fixedClock, sequentialIds } from '@/shared/system-adapters';
import { parseQuestionMarkdown } from '@/modules/importer';
import { InMemoryQuestionRepository, importQuestions } from '@/modules/questions';

/**
 * Guards the corpus itself. A typo in a question file fails here, in
 * milliseconds, instead of halfway through an import against the database.
 */

const ROOT = join(process.cwd(), 'content/questions');

const files = readdirSync(ROOT, { recursive: true, encoding: 'utf8' })
  .filter((f) => f.endsWith('.md'))
  .filter((f) => !basename(f).startsWith('_') && basename(f).toLowerCase() !== 'readme.md')
  .sort();

const parsed = files.map((file) => ({
  file,
  result: parseQuestionMarkdown(readFileSync(join(ROOT, file), 'utf8'), {
    defaultSlug: basename(file, '.md'),
  }),
}));

describe('content/questions', () => {
  it('contains question files', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(parsed)('$file parses', ({ result }) => {
    expect(result.ok ? null : result.error.message).toBeNull();
  });

  it.each(parsed)('$file lives in the folder matching its topic', ({ file, result }) => {
    if (!result.ok) return;
    expect(relative('.', dirname(file))).toBe(result.value.topicPath);
  });

  it('imports every file without a validation error or duplicate', async () => {
    const items = parsed.flatMap(({ result }) => (result.ok ? [result.value] : []));

    const report = await importQuestions(
      { items, authorId: 'founder', publish: true, dryRun: true },
      {
        questions: new InMemoryQuestionRepository(),
        clock: fixedClock('2026-01-15T10:00:00Z'),
        ids: sequentialIds('q'),
      },
    );

    const failures = report.outcomes.flatMap((o) =>
      o.kind === 'failed' ? [`${o.slug}: ${o.error.message}`] : [],
    );
    expect(failures).toEqual([]);
  });
});
