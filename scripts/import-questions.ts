import { readdir, readFile, stat } from 'node:fs/promises';
import { basename, extname, join, relative } from 'node:path';
import { parseArgs } from 'node:util';
import { getContainer } from '@/composition/container';
import { closeDb } from '@/composition/mongo-client';
import { parseQuestionMarkdown } from '@/modules/importer';
import { importQuestions, type ImportOutcome, type ImportQuestionItem } from '@/modules/questions';

const USAGE = `Usage: npm run import-questions -- [--dry-run] [--publish] [--author <id>] [path ...]

Imports question markdown files (default: content/questions). Safe to re-run:
questions are matched by slug, so an edited file updates its question in place
and an untouched file is skipped.

  --dry-run   Show what would change without writing anything
  --publish   Publish new questions and existing drafts (archived ones stay archived)
  --author    Author id for new questions (default: DEV_USER_ID, else "founder")`;

async function main(): Promise<number> {
  let args;
  try {
    args = parseArgs({
      allowPositionals: true,
      options: {
        'dry-run': { type: 'boolean', default: false },
        publish: { type: 'boolean', default: false },
        author: { type: 'string' },
        help: { type: 'boolean', short: 'h', default: false },
      },
    });
  } catch (e) {
    console.error(`${(e as Error).message}\n\n${USAGE}`);
    return 2;
  }
  if (args.values.help) {
    console.log(USAGE);
    return 0;
  }

  const dryRun = args.values['dry-run'];
  const roots = args.positionals.length ? args.positionals : ['content/questions'];
  const files = (await Promise.all(roots.map(collectMarkdown))).flat();
  if (files.length === 0) {
    console.error(`No question files (.md) found in ${roots.join(', ')}`);
    return 1;
  }

  const items: ImportQuestionItem[] = [];
  const itemFiles: string[] = [];
  let parseFailures = 0;
  for (const file of files) {
    const parsed = parseQuestionMarkdown(await readFile(file, 'utf8'), {
      defaultSlug: basename(file, '.md'),
    });
    if (!parsed.ok) {
      parseFailures++;
      console.log(`✗ unreadable  ${relative(process.cwd(), file)}\n    ${parsed.error.message}`);
      continue;
    }
    items.push(parsed.value);
    itemFiles.push(relative(process.cwd(), file));
  }

  const report = await importQuestions(
    {
      items,
      authorId: args.values.author ?? process.env.DEV_USER_ID ?? 'founder',
      publish: args.values.publish,
      dryRun,
    },
    await getContainer(),
  );
  report.outcomes.forEach((outcome, i) => printOutcome(outcome, itemFiles[i]));

  const count = (kind: ImportOutcome['kind']) => report.outcomes.filter((o) => o.kind === kind).length;
  const failed = count('failed') + parseFailures;
  console.log(
    `\n${files.length} files: ${count('created')} created, ${count('updated')} updated, ` +
      `${count('unchanged')} unchanged, ${failed} failed`,
  );
  console.log(dryRun ? 'Dry run: nothing was written.' : report.written ? 'Saved.' : 'Nothing to save.');

  return failed > 0 ? 1 : 0;
}

async function collectMarkdown(path: string): Promise<string[]> {
  const info = await stat(path);
  if (info.isFile()) return extname(path) === '.md' ? [path] : [];

  const entries = await readdir(path, { withFileTypes: true, recursive: true });
  return entries
    // A leading underscore or a README marks notes and templates, not questions.
    .filter((e) => e.isFile() && extname(e.name) === '.md')
    .filter((e) => !e.name.startsWith('_') && e.name.toLowerCase() !== 'readme.md')
    .map((e) => join(e.parentPath, e.name))
    .sort();
}

function printOutcome(outcome: ImportOutcome, file: string): void {
  switch (outcome.kind) {
    case 'created':
      console.log(`+ created     ${file} (${outcome.status})`);
      break;
    case 'updated':
      console.log(`~ updated     ${file}`);
      for (const change of outcome.changes) {
        console.log(`    ${change.field}\n      - ${preview(change.before)}\n      + ${preview(change.after)}`);
      }
      break;
    case 'failed':
      console.log(`✗ failed      ${file}\n    ${outcome.error.message}`);
      break;
    case 'unchanged':
      break;
  }
}

const preview = (value: string): string => {
  const flat = value.replace(/\s+/g, ' ').trim();
  if (!flat) return '(empty)';
  return flat.length > 100 ? `${flat.slice(0, 97)}...` : flat;
};

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeDb);
