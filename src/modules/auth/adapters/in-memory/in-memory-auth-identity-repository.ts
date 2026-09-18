import type { AuthIdentity } from '../../domain/auth-identity';
import type { AuthIdentityRepository } from '../../ports/auth-identity-repository';

const keyOf = (provider: string, providerId: string) => `${provider}:${providerId}`;

export class InMemoryAuthIdentityRepository implements AuthIdentityRepository {
  private readonly store = new Map<string, AuthIdentity>();

  async findUserId(provider: string, providerId: string): Promise<string | null> {
    return this.store.get(keyOf(provider, providerId))?.userId ?? null;
  }

  async create(identity: AuthIdentity): Promise<void> {
    const key = keyOf(identity.provider, identity.providerId);
    if (!this.store.has(key)) this.store.set(key, identity); // first writer wins
  }

  get size(): number {
    return this.store.size;
  }
}
