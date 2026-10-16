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

export interface TopicStyle {
  readonly emoji: string;
  /** Soft tinted chip: background, text and ring. */
  readonly chip: string;
  /** Solid accent for bars and dots. */
  readonly accent: string;
}

// Full class strings, not built from a colour name, so Tailwind's scanner
// can see every one of them.
const TOPIC_STYLES: Record<string, TopicStyle> = {
  behavioural: {
    emoji: '💬',
    chip: 'bg-pink-50 text-pink-700 ring-pink-200 dark:bg-pink-400/10 dark:text-pink-300 dark:ring-pink-400/25',
    accent: 'bg-pink-400',
  },
  databases: {
    emoji: '🗄️',
    chip: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/25',
    accent: 'bg-sky-400',
  },
  devops: {
    emoji: '⚙️',
    chip: 'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-400/10 dark:text-orange-300 dark:ring-orange-400/25',
    accent: 'bg-orange-400',
  },
  dsa: {
    emoji: '🧮',
    chip: 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-400/10 dark:text-violet-300 dark:ring-violet-400/25',
    accent: 'bg-violet-400',
  },
  programming: {
    emoji: '💻',
    chip: 'bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-400/10 dark:text-indigo-300 dark:ring-indigo-400/25',
    accent: 'bg-indigo-400',
  },
  react: {
    emoji: '⚛️',
    chip: 'bg-cyan-50 text-cyan-700 ring-cyan-200 dark:bg-cyan-400/10 dark:text-cyan-300 dark:ring-cyan-400/25',
    accent: 'bg-cyan-400',
  },
  security: {
    emoji: '🔐',
    chip: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/25',
    accent: 'bg-rose-400',
  },
  'system-design': {
    emoji: '🏗️',
    chip: 'bg-teal-50 text-teal-700 ring-teal-200 dark:bg-teal-400/10 dark:text-teal-300 dark:ring-teal-400/25',
    accent: 'bg-teal-400',
  },
  web: {
    emoji: '🌐',
    chip: 'bg-lime-50 text-lime-800 ring-lime-200 dark:bg-lime-400/10 dark:text-lime-300 dark:ring-lime-400/25',
    accent: 'bg-lime-400',
  },
};

const DEFAULT_TOPIC_STYLE: TopicStyle = {
  emoji: '📚',
  chip: 'bg-zinc-100 text-zinc-700 ring-zinc-200 dark:bg-zinc-400/10 dark:text-zinc-300 dark:ring-zinc-400/25',
  accent: 'bg-zinc-400',
};

/** Styled by the top-level segment, so "databases/indexing" looks like "databases". */
export const topicStyle = (topicPath: string): TopicStyle =>
  TOPIC_STYLES[topicPath.split('/')[0]] ?? DEFAULT_TOPIC_STYLE;

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

/** "today", "yesterday", "3 days ago", "2 weeks ago" — for when a pack was last studied. */
export const formatDaysAgo = (date: Date, now: Date): string => {
  const days = Math.floor((now.getTime() - date.getTime()) / (24 * 60 * 60 * 1000));
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.round(days / 7)} weeks ago`;
  return `${Math.round(days / 30)} months ago`;
};
