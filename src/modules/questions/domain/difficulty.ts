export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

const ORDER: Record<Difficulty, number> = { easy: 1, medium: 2, hard: 3 };

export const isDifficulty = (v: unknown): v is Difficulty =>
  typeof v === 'string' && (DIFFICULTIES as readonly string[]).includes(v);

export const compareDifficulty = (a: Difficulty, b: Difficulty): number =>
  ORDER[a] - ORDER[b];
