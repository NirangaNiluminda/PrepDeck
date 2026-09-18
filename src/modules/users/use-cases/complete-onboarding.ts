import type { Clock } from '@/shared/ports';
import { type Result, ok } from '@/shared/result';
import type { UserProfile } from '../domain/user-profile';
import type { UserProfileRepository } from '../ports/user-profile-repository';
import { getOrCreateProfile } from './get-or-create-profile';

export interface CompleteOnboardingInput {
  readonly userId: string;
  readonly targetRole: string;
  readonly experienceLevel: string;
}

export async function completeOnboarding(
  input: CompleteOnboardingInput,
  deps: { readonly profiles: UserProfileRepository; readonly clock: Clock },
): Promise<Result<UserProfile>> {
  const profile = await getOrCreateProfile(input, deps);
  const updated = profile.completeOnboarding(input, deps.clock.now());
  if (!updated.ok) return updated;

  await deps.profiles.save(updated.value);
  return ok(updated.value);
}
