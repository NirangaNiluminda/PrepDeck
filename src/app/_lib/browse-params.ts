import {
  DIFFICULTIES,
  QUESTION_STATUSES,
  QUESTION_TYPES,
  type Difficulty,
  type QuestionSort,
  type QuestionStatus,
  type QuestionType,
} from '@/modules/questions';

export const PAGE_SIZE = 20;

const SORTS = ['newest', 'oldest', 'easiest', 'hardest'] as const satisfies readonly QuestionSort[];

/** Everything the browse page's URL can say. The URL is the filter state. */
export interface BrowseParams {
  readonly q?: string;
  readonly topic?: string;
  readonly difficulties: readonly Difficulty[];
  readonly types: readonly QuestionType[];
  readonly statuses: readonly QuestionStatus[];
  readonly tags: readonly string[];
  readonly bookmarked: boolean;
  readonly sort: QuestionSort;
  readonly page: number;
}

type RawParams = Record<string, string | string[] | undefined>;

// A GET form repeats keys (difficulty=easy&difficulty=hard) while a hand-typed
// URL might use commas (difficulty=easy,hard). Accept both.
const listOf = (value: string | string[] | undefined): string[] =>
  (value === undefined ? [] : [value].flat())
    .flatMap((v) => v.split(','))
    .map((v) => v.trim())
    .filter(Boolean);

const firstOf = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

const isOneOf =
  <T extends string>(allowed: readonly T[]) =>
  (value: string): value is T =>
    (allowed as readonly string[]).includes(value);

/**
 * Lenient on purpose: a shared or hand-edited link with an unknown value
 * should still show a page, just without that filter.
 */
export function parseBrowseParams(raw: RawParams): BrowseParams {
  const sort = firstOf(raw.sort);
  const page = Number.parseInt(firstOf(raw.page) ?? '', 10);

  return {
    q: firstOf(raw.q)?.trim().slice(0, 200) || undefined,
    topic: firstOf(raw.topic)?.trim().toLowerCase() || undefined,
    difficulties: listOf(raw.difficulty).filter(isOneOf(DIFFICULTIES)),
    types: listOf(raw.type).filter(isOneOf(QUESTION_TYPES)),
    statuses: listOf(raw.status).filter(isOneOf(QUESTION_STATUSES)),
    tags: listOf(raw.tag).map((t) => t.toLowerCase()),
    bookmarked: firstOf(raw.bookmarked) === '1',
    sort: sort && isOneOf(SORTS)(sort) ? sort : 'newest',
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
}

export const NO_FILTERS: BrowseParams = parseBrowseParams({});

/** Builds a browse URL, leaving defaults out so links stay short and shareable. */
export function browseHref(params: BrowseParams, overrides: Partial<BrowseParams> = {}): string {
  const p = { ...params, ...overrides };
  const query = new URLSearchParams();

  if (p.q) query.set('q', p.q);
  if (p.topic) query.set('topic', p.topic);
  p.difficulties.forEach((d) => query.append('difficulty', d));
  p.types.forEach((t) => query.append('type', t));
  p.statuses.forEach((s) => query.append('status', s));
  p.tags.forEach((t) => query.append('tag', t));
  if (p.bookmarked) query.set('bookmarked', '1');
  if (p.sort !== 'newest') query.set('sort', p.sort);
  if (p.page > 1) query.set('page', String(p.page));

  const qs = query.toString();
  return qs ? `/?${qs}` : '/';
}

export const hasFilters = (p: BrowseParams): boolean =>
  browseHref({ ...p, sort: 'newest', page: 1 }) !== '/';
