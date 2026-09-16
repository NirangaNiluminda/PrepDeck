import type { Clock, IdGenerator } from './ports';
import { randomUUID } from 'node:crypto';

export const systemClock: Clock = { now: () => new Date() };
export const uuidGenerator: IdGenerator = { next: () => randomUUID() };

/** Deterministic doubles for tests. */
export const fixedClock = (iso: string): Clock => ({ now: () => new Date(iso) });

export const sequentialIds = (prefix = 'id'): IdGenerator => {
  let n = 0;
  return { next: () => `${prefix}-${++n}` };
};
