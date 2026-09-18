import type { Clock } from '@/shared/ports';
import { type Result, ok } from '@/shared/result';
import type { UserProfile, UserSettings } from '../domain/user-profile';
import type { UserProfileRepository } from '../ports/user-profile-repository';
import { getOrCreateProfile } from './get-or-create-profile';

export interface UpdateUserSettingsInput extends Partial<UserSettings> {
  readonly userId: string;
}

export async function updateUserSettings(
  input: UpdateUserSettingsInput,
  deps: { readonly profiles: UserProfileRepository; readonly clock: Clock },
): Promise<Result<UserProfile>> {
  const { userId, ...patch } = input;
  const profile = await getOrCreateProfile({ userId }, deps);
  const updated = profile.updateSettings(patch, deps.clock.now());
  if (!updated.ok) return updated;

  await deps.profiles.save(updated.value);
  return ok(updated.value);
}
