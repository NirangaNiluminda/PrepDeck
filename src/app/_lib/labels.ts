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

export const SUBMISSION_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending review',
  approved: 'Approved',
  rejected: 'Rejected',
  'changes-requested': 'Changes requested',
};

export const REPORT_REASON_LABELS: Record<string, string> = {
  incorrect: 'Incorrect or misleading',
  duplicate: 'Duplicate of another question',
  offensive: 'Offensive or inappropriate',
  other: 'Other',
};

export const SORT_LABELS: Record<string, string> = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  easiest: 'Easiest first',
  hardest: 'Hardest first',
};

export const RATING_LABELS: Record<string, string> = {
  again: 'Again',
  hard: 'Hard',
  good: 'Good',
  easy: 'Easy',
};

/** Days as a compact unit: 1d, 6d, 3w, 4mo, 1y — matches how spaced-repetition tools show it on rating buttons. */
export const formatInterval = (days: number): string => {
  if (days < 1) return '<1d';
  if (days < 21) return `${days}d`;
  if (days < 60) return `${Math.round(days / 7)}w`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${Math.round(days / 365)}y`;
};

export const EXAM_STATUS_LABELS: Record<string, string> = {
  'in-progress': 'In progress',
  'awaiting-review': 'Awaiting your review',
  graded: 'Graded',
};

/** Milliseconds as m:ss for exam time-per-question and elapsed time. */
export const formatDuration = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
};
