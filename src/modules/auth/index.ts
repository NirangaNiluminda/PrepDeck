// The module's public API. Route handlers and server actions read identity
// through the composition root's Container.auth (chosen in
// composition/container.ts), not by importing an adapter here directly —
// auth is a container-level port like every other repository. The
// NextAuth-backed provider lives in composition/next-auth-provider.ts, not
// here: it needs '@/auth' at the app root, and this module importing that
// would create a cycle (this module -> '@/auth' -> composition -> this
// module). DevAuthProvider has no such dependency, so it's still built here.

export { DevAuthProvider } from './adapters/dev-auth-provider';
export type { AuthProvider, Role, Session } from './ports/auth-provider';

export { resolveUserId } from './use-cases/resolve-user-id';
export { isAllowlistedAdmin } from './domain/admin-allowlist';
export type { AuthIdentity } from './domain/auth-identity';
export type { AuthIdentityRepository } from './ports/auth-identity-repository';

// Adapters — exported for the composition root and tests only.
export { InMemoryAuthIdentityRepository } from './adapters/in-memory/in-memory-auth-identity-repository';
export { MongoAuthIdentityRepository } from './adapters/mongo/mongo-auth-identity-repository';
export { AUTH_IDENTITY_INDEXES } from './adapters/mongo/auth-identity-document';
export type { AuthIdentityDocument } from './adapters/mongo/auth-identity-document';
