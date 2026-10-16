import { EASE_DEFAULT, EASE_MIN } from './scheduler';

/** Interval, in days, at which a card counts as durably learned rather than freshly graduated. */
export const MATURE_INTERVAL_DAYS = 21;

/**
 * A 0–100 heuristic from a card's own schedule state, not a separate score
 * kept in sync by hand. Zero for a card never reviewed. Rises as the interval
 * lengthens toward "mature" and as the ease factor climbs above default,
 * roughly proportional to how much a learner keeps saying "good" or "easy".
 *
 * Deliberately simple and replaceable: it reads two numbers already on the
 * card, nothing else. Tune the two components' weights, or swap it out
 * entirely, without touching the scheduler or any use case.
 */
export function questionMastery(card: { readonly interval: number; readonly easeFactor: number }): number {
  if (card.interval === 0) return 0;

  const easeComponent = clamp01((card.easeFactor - EASE_MIN) / (EASE_DEFAULT + 1 - EASE_MIN));
  const intervalComponent = clamp01(card.interval / MATURE_INTERVAL_DAYS);
  return Math.round(((easeComponent + intervalComponent) / 2) * 100);
}

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

export interface TopicMastery {
  readonly slug: string;
  readonly path: string;
  /** Average mastery over this topic and every descendant. Undefined if nothing here has been reviewed. */
  readonly mastery?: number;
  /** How many reviewed questions that average is over — the sample size, for "is this reliable". */
  readonly reviewedCount: number;
  readonly children: readonly TopicMastery[];
}

interface MutableNode {
  slug: string;
  path: string;
  sum: number;
  count: number;
  children: Map<string, MutableNode>;
}

/**
 * Rolls per-question mastery up to every ancestor topic, the way question
 * counts roll up in the questions module's own topic tree — kept as a
 * separate small function here rather than imported, since domain code in
 * one module may never reach into another's.
 */
export function buildTopicMastery(
  entries: readonly { readonly topicPath: string; readonly mastery: number }[],
): TopicMastery[] {
  const roots = new Map<string, MutableNode>();

  for (const { topicPath, mastery } of entries) {
    let level = roots;
    let path = '';
    for (const slug of topicPath.split('/')) {
      path = path ? `${path}/${slug}` : slug;
      let node = level.get(slug);
      if (!node) {
        node = { slug, path, sum: 0, count: 0, children: new Map() };
        level.set(slug, node);
      }
      node.sum += mastery;
      node.count += 1;
      level = node.children;
    }
  }

  const freeze = (level: Map<string, MutableNode>): TopicMastery[] =>
    [...level.values()]
      .sort((a, b) => a.slug.localeCompare(b.slug))
      .map((n) => ({
        slug: n.slug,
        path: n.path,
        mastery: n.count > 0 ? Math.round(n.sum / n.count) : undefined,
        reviewedCount: n.count,
        children: freeze(n.children),
      }));

  return freeze(roots);
}

/** Flattens the tree and keeps only topics with enough reviewed questions to trust the average. */
export function weakestTopics(
  tree: readonly TopicMastery[],
  options: { readonly minReviewed: number; readonly limit: number },
): TopicMastery[] {
  const flat: TopicMastery[] = [];
  const walk = (nodes: readonly TopicMastery[]) => {
    for (const node of nodes) {
      if (node.reviewedCount >= options.minReviewed) flat.push(node);
      walk(node.children);
    }
  };
  walk(tree);

  return flat
    .sort((a, b) => (a.mastery ?? 0) - (b.mastery ?? 0))
    .slice(0, options.limit);
}
