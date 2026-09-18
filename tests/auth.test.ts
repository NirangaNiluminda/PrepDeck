import { describe, it, expect } from 'vitest';
import { sequentialIds } from '@/shared/system-adapters';
import {
  InMemoryAuthIdentityRepository,
  isAllowlistedAdmin,
  resolveUserId,
} from '@/modules/auth';

describe('resolveUserId', () => {
  it('mints a userId on first sign-in and returns the same one on every later sign-in', async () => {
    const deps = { identities: new InMemoryAuthIdentityRepository(), ids: sequentialIds('u') };
    const now = new Date('2026-01-15T10:00:00Z');

    const first = await resolveUserId({ provider: 'github', providerId: '123', now }, deps);
    const second = await resolveUserId({ provider: 'github', providerId: '123', now }, deps);

    expect(first).toBe('u-1');
    expect(second).toBe(first);
    expect(deps.identities.size).toBe(1);
  });

  it('keeps two different accounts, even on the same provider, as two different userIds', async () => {
    const deps = { identities: new InMemoryAuthIdentityRepository(), ids: sequentialIds('u') };
    const now = new Date('2026-01-15T10:00:00Z');

    const alice = await resolveUserId({ provider: 'github', providerId: 'alice-id', now }, deps);
    const bob = await resolveUserId({ provider: 'github', providerId: 'bob-id', now }, deps);

    expect(alice).not.toBe(bob);
  });

  it('keeps the same provider account distinct across providers', async () => {
    const deps = { identities: new InMemoryAuthIdentityRepository(), ids: sequentialIds('u') };
    const now = new Date('2026-01-15T10:00:00Z');

    const github = await resolveUserId({ provider: 'github', providerId: '1', now }, deps);
    const dev = await resolveUserId({ provider: 'dev', providerId: '1', now }, deps);

    expect(github).not.toBe(dev);
  });
});

describe('isAllowlistedAdmin', () => {
  it('matches a login on the allowlist, case-insensitively', () => {
    expect(isAllowlistedAdmin('NirangaNiluminda', ['niranganiluminda'])).toBe(true);
    expect(isAllowlistedAdmin('niranganiluminda', ['NirangaNiluminda'])).toBe(true);
  });

  it('rejects a login not on the allowlist, and an empty or missing login', () => {
    expect(isAllowlistedAdmin('someone-else', ['NirangaNiluminda'])).toBe(false);
    expect(isAllowlistedAdmin(undefined, ['NirangaNiluminda'])).toBe(false);
    expect(isAllowlistedAdmin('anyone', [])).toBe(false);
  });
});
