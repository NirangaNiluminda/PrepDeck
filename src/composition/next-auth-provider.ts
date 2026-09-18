import { auth } from '@/auth';
import type { AuthProvider, Session } from '@/modules/auth';

/**
 * Wraps NextAuth's own session reader behind the same AuthProvider port
 * DevAuthProvider implements. Lives here, not in modules/auth/, because
 * '@/auth' (the NextAuth config, at the app root) needs '@/modules/auth' —
 * putting this adapter inside that module would make the import cycle back
 * on itself. See '@/auth' and modules/auth/index.ts for the fuller story.
 */
export class NextAuthAuthProvider implements AuthProvider {
  async getSession(): Promise<Session | null> {
    const session = await auth();
    const userId = (session as { userId?: string } | null)?.userId;
    const role = (session as { role?: 'user' | 'admin' } | null)?.role;
    return userId && role ? { userId, role } : null;
  }
}
