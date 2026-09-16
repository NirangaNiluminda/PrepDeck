import type { AuthProvider, Role, Session } from '../ports/auth-provider';

/**
 * Stage 0 stand-in: the founder is the only user and is always an admin.
 * Reads DEV_USER_ID / DEV_USER_ROLE so a signed-out state can still be
 * exercised locally by unsetting them. Replaced by the NextAuth adapter in
 * Stage 4, when real accounts arrive.
 */
export class DevAuthProvider implements AuthProvider {
  async getSession(): Promise<Session | null> {
    const userId = process.env.DEV_USER_ID;
    if (!userId) return null;

    const role: Role = process.env.DEV_USER_ROLE === 'user' ? 'user' : 'admin';
    return { userId, role };
  }
}
