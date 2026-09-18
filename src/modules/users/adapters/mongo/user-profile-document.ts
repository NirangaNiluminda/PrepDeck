import type { IndexDescription } from 'mongodb';

export interface UserProfileDocument {
  _id: string;
  onboarding?: {
    targetRole: string;
    experienceLevel: string;
  };
  settings: {
    newCardCap: number;
    preferredDifficulty?: string;
    timezone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// _id is already the userId; no secondary index needed.
export const USER_PROFILE_INDEXES: IndexDescription[] = [];
