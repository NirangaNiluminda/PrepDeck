import type { Clock } from '@/shared/ports';
import { UserProfile } from '../domain/user-profile';
import type { UserProfileRepository } from '../ports/user-profile-repository';

/**
 * There is no separate signup step — the first time any page asks for this
 * user's profile, one is created with default settings and saved. Can't fail:
 * defaults are always valid.
 */
export async function getOrCreateProfile(
  input: { readonly userId: string },
  deps: { readonly profiles: UserProfileRepository; readonly clock: Clock },
): Promise<UserProfile> {
  const existing = await deps.profiles.findById(input.userId);
  if (existing) return existing;

  const created = UserProfile.createDefault(input.userId, deps.clock.now());
  await deps.profiles.save(created);
  return created;
}
