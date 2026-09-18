import type { UserProfile } from '../../domain/user-profile';
import type { UserProfileRepository } from '../../ports/user-profile-repository';

export class InMemoryUserProfileRepository implements UserProfileRepository {
  private readonly store = new Map<string, UserProfile>();

  async findById(userId: string): Promise<UserProfile | null> {
    return this.store.get(userId) ?? null;
  }

  async save(profile: UserProfile): Promise<void> {
    this.store.set(profile.id, profile);
  }

  get size(): number {
    return this.store.size;
  }
}
