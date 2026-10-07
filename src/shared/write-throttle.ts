import type { RateLimiter } from './ports';
import { type Result, ok, err, rateLimited } from './result';

/**
 * A generic per-user abuse guard for writes that have no product-level limit
 * of their own. Limits that are product rules ("5 submissions a day") live in
 * their use cases instead — see community's submit-question.ts. These are set
 * well above anything a person clicking through the UI can reach: a practice
 * session rates a card every second or two at most.
 */
export const WRITE_LIMITS = {
  bookmark: { limit: 60, windowSeconds: 60 },
  note: { limit: 60, windowSeconds: 60 },
  attempt: { limit: 120, windowSeconds: 60 },
  'study-pack': { limit: 30, windowSeconds: 60 },
  'exam-start': { limit: 20, windowSeconds: 3600 },
  'exam-answer': { limit: 120, windowSeconds: 60 },
  'exam-submit': { limit: 20, windowSeconds: 3600 },
  profile: { limit: 20, windowSeconds: 60 },
  'question-edit': { limit: 60, windowSeconds: 60 },
  moderation: { limit: 60, windowSeconds: 60 },
} as const satisfies Record<string, { limit: number; windowSeconds: number }>;

export type WriteKind = keyof typeof WRITE_LIMITS;

export async function throttleWrite(limiter: RateLimiter, kind: WriteKind, userId: string): Promise<Result<void>> {
  const { limit, windowSeconds } = WRITE_LIMITS[kind];
  const allowed = await limiter.consume(`write:${kind}:${userId}`, limit, windowSeconds);
  return allowed ? ok(undefined) : err(rateLimited());
}
