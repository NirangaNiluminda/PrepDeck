import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { getContainer, getSession } from '@/composition/container';
import {
  searchQuestions,
  createQuestion,
  DIFFICULTIES,
  QUESTION_TYPES,
  QUESTION_STATUSES,
} from '@/modules/questions';
import { validationError } from '@/shared/result';
import { throttleWrite } from '@/shared/write-throttle';
import { fail, respond } from './http';

/**
 * Route handlers stay thin and do exactly four things:
 *   1. parse + validate input (Zod, at the boundary)
 *   2. read identity from the session — never from the request
 *   3. call one use case
 *   4. map the Result to an HTTP status
 *
 * No business rules, no database access. If a rule starts creeping in here,
 * it belongs in the use case or on the entity.
 */

const csv = <T extends z.ZodType<string, string>>(schema: T) =>
  z
    .string()
    .optional()
    .transform((v) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : undefined))
    .pipe(z.array(schema).optional());

const SearchQuery = z.object({
  topic: z.string().optional(),
  difficulty: csv(z.enum(DIFFICULTIES)),
  type: csv(z.enum(QUESTION_TYPES)),
  status: csv(z.enum(QUESTION_STATUSES)),
  tags: csv(z.string()),
  q: z.string().max(200).optional(),
  sort: z.enum(['newest', 'oldest', 'easiest', 'hardest']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function GET(request: NextRequest) {
  const parsed = SearchQuery.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!parsed.success) {
    return fail(validationError('Invalid query', parsed.error.flatten().fieldErrors));
  }

  const { topic, difficulty, type, status, tags, q, sort, limit, offset } = parsed.data;
  const session = await getSession();
  const container = await getContainer();

  const page = await searchQuestions(
    {
      topicPath: topic,
      difficulties: difficulty,
      types: type,
      statuses: status,
      tags,
      text: q,
      sort,
      page: { limit, offset },
      viewerIsAdmin: session?.role === 'admin',
    },
    container,
  );

  return NextResponse.json(page);
}

const McqOption = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  correct: z.boolean(),
});

const CreateBody = z.object({
  stem: z.string().min(10).max(2000),
  type: z.enum(QUESTION_TYPES),
  difficulty: z.enum(DIFFICULTIES),
  topicPath: z.string().min(1),
  tags: z.array(z.string()).max(10).optional(),
  answer: z.object({
    modelAnswer: z.string().min(1),
    keyPoints: z.array(z.string()).default([]),
    explanation: z.string().optional(),
    references: z.array(z.string().url()).optional(),
  }),
  options: z.array(McqOption).optional(),
  source: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return fail({ code: 'UNAUTHENTICATED', message: 'Sign in to contribute' });
  }

  const limited = await throttleWrite((await getContainer()).rateLimiter, 'question-edit', session.userId);
  if (!limited.ok) return fail(limited.error);

  // A body that isn't JSON is a client mistake, not a server fault: let Zod
  // reject it as a 400 instead of letting the parse error escape as a 500.
  const parsed = CreateBody.safeParse(await request.json().catch(() => undefined));
  if (!parsed.success) {
    return fail(validationError('Invalid question', parsed.error.flatten().fieldErrors));
  }

  const container = await getContainer();
  const result = await createQuestion(
    { ...parsed.data, authorId: session.userId },
    container,
  );

  return respond(result, 201);
}
