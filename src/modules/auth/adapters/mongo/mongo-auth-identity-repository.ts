import type { Collection } from 'mongodb';
import type { AuthIdentity } from '../../domain/auth-identity';
import type { AuthIdentityRepository } from '../../ports/auth-identity-repository';
import { type AuthIdentityDocument, authIdentityIdOf } from './auth-identity-document';

export class MongoAuthIdentityRepository implements AuthIdentityRepository {
  constructor(private readonly collection: Collection<AuthIdentityDocument>) {}

  async findUserId(provider: string, providerId: string): Promise<string | null> {
    const doc = await this.collection.findOne({ _id: authIdentityIdOf(provider, providerId) });
    return doc?.userId ?? null;
  }

  /**
   * $setOnInsert against the natural (provider, providerId) key: if two
   * requests race to create the same identity, only the first insert
   * survives — the loser's update is a no-op against the doc that already
   * exists, so resolveUserId's re-read afterward returns the true winner.
   */
  async create(identity: AuthIdentity): Promise<void> {
    await this.collection.updateOne(
      { _id: authIdentityIdOf(identity.provider, identity.providerId) },
      {
        $setOnInsert: {
          provider: identity.provider,
          providerId: identity.providerId,
          userId: identity.userId,
          createdAt: identity.createdAt,
        },
      },
      { upsert: true },
    );
  }
}
