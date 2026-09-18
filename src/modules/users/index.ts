// The module's public API. UserProfile holds onboarding answers and
// preferences only — role/admin-status is an AuthProvider concern, not a
// profile concern, and deliberately lives there instead. See CLAUDE.md.

export { getOrCreateProfile } from './use-cases/get-or-create-profile';
export { completeOnboarding } from './use-cases/complete-onboarding';
export type { CompleteOnboardingInput } from './use-cases/complete-onboarding';
export { updateUserSettings } from './use-cases/update-user-settings';
export type { UpdateUserSettingsInput } from './use-cases/update-user-settings';

export type { UserProfileRepository } from './ports/user-profile-repository';
export { TARGET_ROLES, EXPERIENCE_LEVELS, DEFAULT_SETTINGS } from './domain/user-profile';
export type {
  UserProfile,
  TargetRole,
  ExperienceLevel,
  OnboardingAnswers,
  UserSettings,
} from './domain/user-profile';

// Adapters — exported for the composition root and tests only.
export { InMemoryUserProfileRepository } from './adapters/in-memory/in-memory-user-profile-repository';
export { MongoUserProfileRepository } from './adapters/mongo/mongo-user-profile-repository';
export { USER_PROFILE_INDEXES } from './adapters/mongo/user-profile-document';
export type { UserProfileDocument } from './adapters/mongo/user-profile-document';
