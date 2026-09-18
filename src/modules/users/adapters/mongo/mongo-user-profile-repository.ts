import type { Collection } from 'mongodb';
import { UserProfile, type OnboardingAnswers } from '../../domain/user-profile';
import type { UserProfileRepository } from '../../ports/user-profile-repository';
import type { UserProfileDocument } from './user-profile-document';

const withoutUndefined = <T extends object>(value: T): T =>
  Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as T;

// fromPersistence skips validation by design (see Question.fromPersistence's
// own comment) — the row was valid when it was written, so the stored
// strings are trusted back into the strict unions here.
const toDomain = (doc: UserProfileDocument): UserProfile =>
  UserProfile.fromPersistence({
    id: doc._id,
    onboarding: doc.onboarding as OnboardingAnswers | undefined,
    settings: doc.settings,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });

export class MongoUserProfileRepository implements UserProfileRepository {
  constructor(private readonly collection: Collection<UserProfileDocument>) {}

  async findById(userId: string): Promise<UserProfile | null> {
    const doc = await this.collection.findOne({ _id: userId });
    return doc ? toDomain(doc) : null;
  }

  async save(profile: UserProfile): Promise<void> {
    const p = profile.snapshot();
    const doc: UserProfileDocument = withoutUndefined({
      _id: p.id,
      onboarding: p.onboarding,
      settings: withoutUndefined({ ...p.settings }),
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    });
    await this.collection.replaceOne({ _id: doc._id }, doc, { upsert: true });
  }
}
