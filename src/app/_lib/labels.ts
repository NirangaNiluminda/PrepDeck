// Display text only. No imports, so client components can use it without
// pulling a module's server code (and its database driver) into the bundle.

const TOPIC_WORDS: Record<string, string> = {
  api: 'API',
  aws: 'AWS',
  'ci-cd': 'CI/CD',
  devops: 'DevOps',
  dns: 'DNS',
  dsa: 'DSA',
  http: 'HTTP',
  iac: 'IaC',
  k8s: 'Kubernetes',
  sql: 'SQL',
  tls: 'TLS',
};

/** "system-design" → "System design", with overrides for acronyms. */
export const topicLabel = (segment: string): string =>
  TOPIC_WORDS[segment] ??
  segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

export const TYPE_LABELS: Record<string, string> = {
  'short-answer': 'Short answer',
  flashcard: 'Flashcard',
  mcq: 'Multiple choice',
  code: 'Code',
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  'in-review': 'In review',
  published: 'Published',
  archived: 'Archived',
};

export const SORT_LABELS: Record<string, string> = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  easiest: 'Easiest first',
  hardest: 'Hardest first',
};
