import { describe, it, expect } from 'vitest';
import { fixedClock } from '@/shared/system-adapters';
import {
  InMemoryUserProfileRepository,
  completeOnboarding,
  getOrCreateProfile,
  updateUserSettings,
  DEFAULT_SETTINGS,
} from '@/modules/users';

const deps = () => ({ profiles: new InMemoryUserProfileRepository(), clock: fixedClock('2026-01-15T10:00:00Z') });

describe('getOrCreateProfile', () => {
  it('creates a profile with default settings on first read, and reuses it after', async () => {
    const d = deps();

    const first = await getOrCreateProfile({ userId: 'u1' }, d);
    const second = await getOrCreateProfile({ userId: 'u1' }, d);

    expect(first.settings).toEqual(DEFAULT_SETTINGS);
    expect(first.onboarding).toBeUndefined();
    expect(second.createdAt).toEqual(first.createdAt); // same row, not recreated
    expect(d.profiles.size).toBe(1);
  });

  it('keeps two users\' profiles independent', async () => {
    const d = deps();
    await updateUserSettings({ userId: 'alice', newCardCap: 5 }, d);

    const bob = await getOrCreateProfile({ userId: 'bob' }, d);

    expect(bob.settings.newCardCap).toBe(DEFAULT_SETTINGS.newCardCap);
  });
});

describe('completeOnboarding', () => {
  it('records the answers', async () => {
    const d = deps();

    const result = await completeOnboarding({ userId: 'u1', targetRole: 'devops', experienceLevel: 'junior' }, d);

    expect(result.ok && result.value.onboarding).toEqual({ targetRole: 'devops', experienceLevel: 'junior' });
  });

  it('rejects an unknown target role or experience level', async () => {
    const d = deps();

    const badRole = await completeOnboarding({ userId: 'u1', targetRole: 'astronaut', experienceLevel: 'junior' }, d);
    const badLevel = await completeOnboarding({ userId: 'u1', targetRole: 'devops', experienceLevel: 'expert' }, d);

    expect(!badRole.ok && badRole.error.code).toBe('VALIDATION');
    expect(!badLevel.ok && badLevel.error.code).toBe('VALIDATION');
  });
});

describe('updateUserSettings', () => {
  it('updates only the fields given, leaving the rest', async () => {
    const d = deps();
    await updateUserSettings({ userId: 'u1', newCardCap: 30, timezone: 'Asia/Colombo' }, d);

    const result = await updateUserSettings({ userId: 'u1', preferredDifficulty: 'hard' }, d);

    expect(result.ok && result.value.settings).toEqual({ newCardCap: 30, timezone: 'Asia/Colombo', preferredDifficulty: 'hard' });
  });

  it('rejects a new-card cap outside 0–200', async () => {
    const result = await updateUserSettings({ userId: 'u1', newCardCap: 500 }, deps());

    expect(!result.ok && result.error.code).toBe('VALIDATION');
  });

  it('rejects an unknown IANA timezone', async () => {
    const result = await updateUserSettings({ userId: 'u1', timezone: 'Nowhere/Nothing' }, deps());

    expect(!result.ok && result.error.message).toMatch(/Unknown timezone/);
  });

  it('accepts a real IANA timezone', async () => {
    const result = await updateUserSettings({ userId: 'u1', timezone: 'Asia/Colombo' }, deps());

    expect(result.ok && result.value.settings.timezone).toBe('Asia/Colombo');
  });
});
