import type { IndexDescription } from 'mongodb';

export interface AuthIdentityDocument {
  _id: string; // `${provider}:${providerId}` — naturally unique, no separate index needed
  provider: string;
  providerId: string;
  userId: string;
  createdAt: Date;
}

export const authIdentityIdOf = (provider: string, providerId: string): string => `${provider}:${providerId}`;

export const AUTH_IDENTITY_INDEXES: IndexDescription[] = [];
