// Display text and the "starter pack" mapping. No imports, same discipline as
// labels.ts — client-safe, never pulls a module (and its database driver) in.

export const TARGET_ROLE_LABELS: Record<string, string> = {
  swe: 'Software engineer',
  devops: 'DevOps',
  fullstack: 'Full-stack',
  security: 'Security',
};

export const EXPERIENCE_LEVEL_LABELS: Record<string, string> = {
  student: 'Student',
  junior: 'Junior',
  mid: 'Mid-level',
  senior: 'Senior',
};

/**
 * The "personalised starter pack": one topic root to suggest first, based on
 * what the corpus actually covers (see content/questions/). Deliberately a
 * single best-guess link, not a curated multi-topic pack — the corpus is
 * still small enough that "everything under devops" already is the pack.
 */
export const TARGET_ROLE_STARTER_TOPIC: Record<string, string> = {
  swe: 'dsa',
  devops: 'devops',
  fullstack: 'web',
  security: 'security',
};
