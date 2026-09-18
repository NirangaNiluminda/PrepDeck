import { connection } from 'next/server';
import { getSession } from '@/composition/container';
import type { Session } from '@/modules/auth';

/**
 * The dev auth adapter reads environment variables, not cookies, so nothing
 * tells Next.js that a page depends on the request. Without connection() a
 * page could be prerendered once and keep serving that copy after an edit.
 */
export async function getViewer(): Promise<Session | null> {
  await connection();
  return getSession();
}
