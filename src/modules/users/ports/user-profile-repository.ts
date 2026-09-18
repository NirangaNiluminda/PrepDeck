import type { UserProfile } from '../domain/user-profile';

export interface UserProfileRepository {
  findById(userId: string): Promise<UserProfile | null>;
  save(profile: UserProfile): Promise<void>;
}
