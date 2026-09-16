export interface TopicNode {
  /** The last segment of the path: "networking" for "devops/docker/networking". */
  readonly slug: string;
  readonly path: string;
  /** Questions at this topic plus everything beneath it. */
  readonly count: number;
  readonly children: readonly TopicNode[];
}

interface MutableNode {
  slug: string;
  path: string;
  count: number;
  children: Map<string, MutableNode>;
}

/**
 * Storage counts questions per exact topic path. Browsing needs a tree where
 * "devops" shows every DevOps question, so counts roll up to each ancestor.
 */
export function buildTopicTree(
  counts: readonly { readonly topicPath: string; readonly count: number }[],
): TopicNode[] {
  const roots = new Map<string, MutableNode>();

  for (const { topicPath, count } of counts) {
    let level = roots;
    let path = '';
    for (const slug of topicPath.split('/')) {
      path = path ? `${path}/${slug}` : slug;
      let node = level.get(slug);
      if (!node) {
        node = { slug, path, count: 0, children: new Map() };
        level.set(slug, node);
      }
      node.count += count;
      level = node.children;
    }
  }

  const freeze = (level: Map<string, MutableNode>): TopicNode[] =>
    [...level.values()]
      .sort((a, b) => a.slug.localeCompare(b.slug))
      .map((n) => ({ slug: n.slug, path: n.path, count: n.count, children: freeze(n.children) }));

  return freeze(roots);
}
