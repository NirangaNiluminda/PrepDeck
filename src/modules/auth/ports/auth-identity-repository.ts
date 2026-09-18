import type { AuthIdentity } from '../domain/auth-identity';

export interface AuthIdentityRepository {
  findUserId(provider: string, providerId: string): Promise<string | null>;
  /** First write for a given (provider, providerId) wins — see the Mongo adapter's own note on why that matters. */
  create(identity: AuthIdentity): Promise<void>;
}
