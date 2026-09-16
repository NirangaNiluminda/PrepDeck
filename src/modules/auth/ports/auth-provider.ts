export type Role = 'user' | 'admin';

export interface Session {
  readonly userId: string;
  readonly role: Role;
}

/**
 * Identity is read through this port so the routes never learn which provider
 * backs it. Swapping the dev adapter for NextAuth + GitHub is a one-line change
 * in the composition root, not a change to every route handler.
 */
export interface AuthProvider {
  getSession(): Promise<Session | null>;
}
