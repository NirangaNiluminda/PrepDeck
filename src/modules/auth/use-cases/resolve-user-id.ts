import type { IdGenerator } from '@/shared/ports';
import type { AuthIdentity } from '../domain/auth-identity';
import type { AuthIdentityRepository } from '../ports/auth-identity-repository';

/**
 * Mints our own UUID the first time a given provider account signs in, and
 * returns the same one on every later sign-in — the "never leak an external
 * id as our own identity" rule this codebase already applies to Mongo's
 * ObjectId, extended to GitHub's account id.
 *
 * Idempotent under a race: two concurrent first sign-ins from the same
 * account would each mint a different candidate id, but only one `create`
 * actually wins (enforced by the identity's own natural key — see the Mongo
 * adapter). Re-reading after the attempt returns whichever one really did.
 */
export async function resolveUserId(
  input: { readonly provider: string; readonly providerId: string; readonly now: Date },
  deps: { readonly identities: AuthIdentityRepository; readonly ids: IdGenerator },
): Promise<string> {
  const existing = await deps.identities.findUserId(input.provider, input.providerId);
  if (existing) return existing;

  const candidate: AuthIdentity = {
    provider: input.provider,
    providerId: input.providerId,
    userId: deps.ids.next(),
    createdAt: input.now,
  };
  await deps.identities.create(candidate);
  return (await deps.identities.findUserId(input.provider, input.providerId)) ?? candidate.userId;
}
