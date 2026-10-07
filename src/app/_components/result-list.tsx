import Link from 'next/link';
import type { QuestionSummary } from '@/modules/questions';
import { TYPE_LABELS, topicLabel, topicStyle } from '../_lib/labels';
import { DifficultyBadge, StatusBadge, TagLink, TopicChip } from './badges';
import { BookmarkButton } from './bookmark-button';
import { InlineMarkdown } from './markdown';

interface ResultListProps {
  readonly items: readonly QuestionSummary[];
  readonly bookmarkedIds: ReadonlySet<string>;
  readonly canBookmark: boolean;
  /** The current browse query, carried to the detail page so "back" returns here. */
  readonly linkQuery: string;
}

const MAX_TAGS_SHOWN = 3;

export function ResultList({ items, bookmarkedIds, canBookmark, linkQuery }: ResultListProps) {
  return (
    <ol className="mt-4 grid gap-3 lg:grid-cols-2">
      {items.map((q, index) => {
        const subtopic = q.topicPath.split('/').slice(1).map(topicLabel).join(' › ');
        return (
          <li
            key={q.id}
            style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
            className="group relative flex animate-rise flex-col overflow-hidden rounded-2xl border border-line bg-surface p-4 pl-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md hover:shadow-brand-500/10 dark:hover:border-brand-500/50"
          >
            <span aria-hidden className={`absolute inset-y-0 left-0 w-1.5 ${topicStyle(q.topicPath).accent}`} />
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                <TopicChip path={q.topicPath} />
                {subtopic && <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">{subtopic}</span>}
              </div>
              {canBookmark && (
                // Above the stretched link below, so the star stays clickable.
                <div className="relative z-10 -mr-1.5 -mt-1.5">
                  <BookmarkButton questionId={q.id} bookmarked={bookmarkedIds.has(q.id)} />
                </div>
              )}
            </div>

            {/* The ::after overlay stretches this link over the whole card, so
                anywhere on it opens the question, while j/k still focus one
                real link per result. */}
            <Link
              href={`/questions/${q.id}${linkQuery}`}
              data-result-link
              className="mt-2 rounded-sm text-[0.95rem] font-semibold leading-snug text-zinc-900 after:absolute after:inset-0 after:content-[''] group-hover:text-brand-700 dark:text-zinc-50 dark:group-hover:text-brand-300"
            >
              <span className="line-clamp-3">
                <InlineMarkdown>{q.stem}</InlineMarkdown>
              </span>
            </Link>

            <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-3 text-xs text-zinc-500 dark:text-zinc-400">
              <DifficultyBadge difficulty={q.difficulty} />
              <span className="rounded-full bg-surface-muted px-2 py-0.5 font-medium">{TYPE_LABELS[q.type] ?? q.type}</span>
              <StatusBadge status={q.status} />
              {q.tags.slice(0, MAX_TAGS_SHOWN).map((tag) => (
                <span key={tag} className="relative z-10">
                  <TagLink tag={tag} />
                </span>
              ))}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
