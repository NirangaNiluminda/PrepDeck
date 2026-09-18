import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import {
  MongoAuthIdentityRepository,
  isAllowlistedAdmin,
  resolveUserId,
  type AuthIdentityDocument,
} from '@/modules/auth';
import { getDb } from '@/composition/mongo-client';
import { systemClock, uuidGenerator } from '@/shared/system-adapters';

// A tiny composition of its own, independent of composition/container.ts.
// That file wires NextAuthAuthProvider, which imports `auth` from this file
// — so this file importing back from there would be a circular import.
async function identityDeps() {
  const db = await getDb();
  return {
    identities: new MongoAuthIdentityRepository(db.collection<AuthIdentityDocument>('authIdentities')),
    ids: uuidGenerator,
  };
}

const ADMIN_GITHUB_LOGINS = (process.env.ADMIN_GITHUB_LOGINS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

/**
 * `handlers` backs app/api/auth/[...nextauth]/route.ts. `auth` is what
 * composition/next-auth-provider.ts calls — never call it from a module.
 *
 * Role never touches the database at session-read time: it's decided once,
 * at sign-in, from ADMIN_GITHUB_LOGINS, and baked into the JWT. Everyone
 * else is a plain 'user'; there is no path to becoming 'admin' without being
 * on that list, matching the founder-then-friends-then-open audience order.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  session: { strategy: 'jwt' },
  // Skips the Host-header trust check Auth.js does by default to stop OAuth
  // callback spoofing on a multi-tenant host. Vercel already sets its own
  // trusted host automatically; this only matters for `next dev`/`next start`
  // on a machine with no fixed hostname, and this app's threat model (a
  // founder-then-friends tool, not a public multi-tenant service) doesn't
  // need the check either way.
  trustHost: true,
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === 'github' && profile) {
        const login = typeof profile.login === 'string' ? profile.login : undefined;
        token.userId = await resolveUserId(
          { provider: 'github', providerId: String(profile.id), now: systemClock.now() },
          await identityDeps(),
        );
        token.role = isAllowlistedAdmin(login, ADMIN_GITHUB_LOGINS) ? 'admin' : 'user';
      }
      return token;
    },
    async session({ session, token }) {
      return Object.assign(session, { userId: token.userId, role: token.role });
    },
  },
});
