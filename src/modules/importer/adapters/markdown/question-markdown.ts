import { parse as parseYaml } from 'yaml';
import { z } from 'zod';
import {
  DIFFICULTIES,
  QUESTION_TYPES,
  type ImportQuestionItem,
  type McqOption,
} from '@/modules/questions';
import { type Result, ok, err, validationError } from '@/shared/result';

/**
 * One question per file:
 *
 *   ---
 *   topic: devops/iac
 *   difficulty: medium
 *   type: short-answer
 *   tags: [terraform, ansible]
 *   source: mock-interview-2026-01
 *   ---
 *
 *   ## Question        required
 *   ## Answer          required
 *   ## Key points      bullet list
 *   ## Explanation     free text
 *   ## References      bullet list of URLs
 *   ## Options         MCQ only: "- [x] correct" / "- [ ] wrong"
 *
 * This file checks structure only. Content rules (stem length, exactly one
 * correct option, topic depth) belong to the Question entity, so they hold
 * for the importer, the API and the admin UI alike.
 */

const asText = z.union([z.string(), z.number()]).transform(String);

const FrontMatter = z
  .object({
    slug: asText.optional(),
    topic: z.string().min(1),
    difficulty: z.enum(DIFFICULTIES),
    type: z.enum(QUESTION_TYPES),
    // Accept "tags: a, b" as well as "tags: [a, b]"; both are natural to type.
    tags: z
      .union([z.array(asText), z.string().transform((s) => s.split(',').map((t) => t.trim()))])
      .optional(),
    source: asText.optional(),
  })
  // Rejecting unknown keys turns a typo like "dificulty" into an error
  // instead of a silently missing field.
  .strict();

const SECTIONS = {
  question: 'question',
  answer: 'answer',
  'key points': 'keyPoints',
  explanation: 'explanation',
  references: 'references',
  options: 'options',
} as const;
type SectionKey = (typeof SECTIONS)[keyof typeof SECTIONS];

const REFERENCE = z.url();
const OPTION = /^\[([ xX])\]\s+(.+)$/;
const BULLET = /^[-*+]\s+/;

export interface ParseOptions {
  /** Used when the front-matter has no slug; the importer passes the file name. */
  readonly defaultSlug: string;
}

export function parseQuestionMarkdown(
  source: string,
  options: ParseOptions,
): Result<ImportQuestionItem> {
  const parts = splitFrontMatter(source);
  if (!parts.ok) return parts;

  let raw: unknown;
  try {
    raw = parseYaml(parts.value.frontMatter);
  } catch (e) {
    return err(validationError(`Front-matter is not valid YAML: ${(e as Error).message}`));
  }
  const meta = FrontMatter.safeParse(raw ?? {});
  if (!meta.success) {
    return err(validationError(`Front-matter: ${describeIssues(meta.error)}`));
  }

  const sections = splitSections(parts.value.body, parts.value.bodyStartLine);
  if (!sections.ok) return sections;
  const section = (key: SectionKey) => sections.value.get(key) ?? '';

  if (!section('question')) return err(validationError('Missing a "## Question" section'));
  if (!section('answer')) return err(validationError('Missing a "## Answer" section'));

  const keyPoints = parseList(section('keyPoints'), 'Key points');
  if (!keyPoints.ok) return keyPoints;

  const references = parseList(section('references'), 'References');
  if (!references.ok) return references;
  const badReference = references.value.find((r) => !REFERENCE.safeParse(r).success);
  if (badReference) {
    return err(validationError(`References must be URLs; found "${badReference}"`));
  }

  const mcqOptions = sections.value.has('options') ? parseOptionList(section('options')) : undefined;
  if (mcqOptions && !mcqOptions.ok) return mcqOptions;

  return ok({
    slug: meta.data.slug ?? options.defaultSlug,
    stem: section('question'),
    type: meta.data.type,
    difficulty: meta.data.difficulty,
    topicPath: meta.data.topic,
    tags: meta.data.tags,
    answer: {
      modelAnswer: section('answer'),
      keyPoints: keyPoints.value,
      explanation: section('explanation') || undefined,
      references: references.value.length ? references.value : undefined,
    },
    options: mcqOptions?.value,
    source: meta.data.source,
  });
}

/**
 * Lines of "[x] text" or "[ ] text", with or without a leading bullet. Shared
 * with the admin form so both entry points use one syntax. Ids are assigned
 * by position: a, b, c…
 */
export function parseOptionList(text: string): Result<McqOption[]> {
  const optionsList: McqOption[] = [];
  for (const line of text.split('\n')) {
    const trimmed = line.trim().replace(BULLET, '');
    if (!trimmed) continue;

    const match = OPTION.exec(trimmed);
    if (!match) {
      return err(validationError(`Options must look like "[x] correct" or "[ ] wrong"; found "${trimmed}"`));
    }
    const index = optionsList.length;
    optionsList.push({
      id: index < 26 ? String.fromCharCode(97 + index) : `o${index + 1}`,
      text: match[2].trim(),
      correct: match[1] !== ' ',
    });
  }
  return ok(optionsList);
}

// ── Structure ─────────────────────────────────────────────────────────────

function splitFrontMatter(
  source: string,
): Result<{ frontMatter: string; body: string; bodyStartLine: number }> {
  const text = source.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  const match = /^---\n([\s\S]*?)\n---[ \t]*(?:\n|$)/.exec(text);
  if (!match) {
    return err(validationError('File must start with front-matter between two "---" lines'));
  }
  return ok({
    frontMatter: match[1],
    body: text.slice(match[0].length),
    bodyStartLine: match[0].split('\n').length,
  });
}

function splitSections(body: string, firstLine: number): Result<Map<SectionKey, string>> {
  const sections = new Map<SectionKey, string[]>();
  let current: SectionKey | null = null;
  let fence: string | null = null;

  for (const [index, line] of body.split('\n').entries()) {
    const lineNumber = firstLine + index;

    // A "## " line inside a code block is code, not a new section.
    const fenceMarker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1][0];
    if (fenceMarker) {
      if (!fence) fence = fenceMarker;
      else if (fence === fenceMarker) fence = null;
    }

    const heading = !fence && !fenceMarker ? /^##\s+(.+?)\s*$/.exec(line) : null;
    if (heading) {
      const name = heading[1].toLowerCase() as keyof typeof SECTIONS;
      const key = SECTIONS[name];
      if (!key) {
        const expected = Object.keys(SECTIONS).map((s) => `"## ${capitalise(s)}"`).join(', ');
        return err(validationError(`Line ${lineNumber}: unknown section "## ${heading[1]}". Expected one of ${expected}`));
      }
      if (sections.has(key)) {
        return err(validationError(`Line ${lineNumber}: section "## ${heading[1]}" appears twice`));
      }
      sections.set(key, []);
      current = key;
      continue;
    }

    if (current) sections.get(current)!.push(line);
    else if (line.trim()) {
      return err(validationError(`Line ${lineNumber}: text before the first "## " section`));
    }
  }

  return ok(new Map([...sections].map(([key, lines]) => [key, lines.join('\n').trim()])));
}

function parseList(text: string, sectionName: string): Result<string[]> {
  const items: string[] = [];
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    if (BULLET.test(line)) {
      items.push(line.replace(BULLET, '').trim());
    } else if (/^\s+\S/.test(line) && items.length) {
      // An indented line continues the previous bullet.
      items[items.length - 1] += ` ${line.trim()}`;
    } else {
      return err(validationError(`${sectionName} must be a bullet list; found "${line.trim()}"`));
    }
  }
  return ok(items);
}

const describeIssues = (error: z.ZodError): string =>
  error.issues
    .map((issue) => (issue.path.length ? `${issue.path.join('.')}: ${issue.message}` : issue.message))
    .join('; ');

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
