import { getContainer } from '@/composition/container';
import { throttleWrite, type WriteKind } from '@/shared/write-throttle';

/** The message to show when `userId` has hit `kind`'s limit, or null to go ahead. */
export async function writeLimitError(kind: WriteKind, userId: string): Promise<string | null> {
  const result = await throttleWrite((await getContainer()).rateLimiter, kind, userId);
  return result.ok ? null : result.error.message;
}
