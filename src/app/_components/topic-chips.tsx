import Link from 'next/link';
import type { TopicNode } from '@/modules/questions';
import { type BrowseParams, browseHref } from '../_lib/browse-params';
import { topicLabel, topicStyle } from '../_lib/labels';

/**
 * A one-click way into a topic, above the results. The sidebar's tree still
 * does the fine-grained picking; this is the top level only.
 */
export function TopicChips({ params, topics }: { params: BrowseParams; topics: readonly TopicNode[] }) {
  if (topics.length === 0) return null;
  const selectedRoot = params.topic?.split('/')[0];

  return (
    <nav
      aria-label="Topics"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [mask-image:linear-gradient(to_right,black_calc(100%-3rem),transparent)] [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
    >
      <Chip href={browseHref(params, { topic: undefined, page: 1 })} active={!params.topic} emoji="🌈" label="All" />
      {topics.map((node) => {
        const style = topicStyle(node.path);
        const active = selectedRoot === node.path;
        return (
          <Chip
            key={node.path}
            // Clicking the active chip again clears it, like a toggle.
            href={browseHref(params, { topic: active ? undefined : node.path, page: 1 })}
            active={active}
            emoji={style.emoji}
            label={topicLabel(node.slug)}
            count={node.count}
            tone={style.chip}
          />
        );
      })}
    </nav>
  );
}

interface ChipProps {
  readonly href: string;
  readonly active: boolean;
  readonly emoji: string;
  readonly label: string;
  readonly count?: number;
  readonly tone?: string;
}

function Chip({ href, active, emoji, label, count, tone }: ChipProps) {
  return (
    <Link
      href={href}
      aria-current={active ? 'true' : undefined}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold ring-1 ring-inset transition hover:-translate-y-0.5 ${
        active
          ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25 ring-brand-600'
          : (tone ?? 'bg-surface text-zinc-700 ring-line dark:text-zinc-300')
      }`}
    >
      <span aria-hidden>{emoji}</span>
      {label}
      {count !== undefined && <span className={`text-xs tabular-nums ${active ? 'text-white/80' : 'opacity-70'}`}>{count}</span>}
    </Link>
  );
}
