import Link from 'next/link';
import type { QuestionSummary } from '@/modules/questions';
import { TYPE_LABELS } from '../_lib/labels';
import { DifficultyBadge, StatusBadge, TagLink, TopicTrail } from './badges';
import { BookmarkButton } from './bookmark-button';
import { InlineMarkdown } from './markdown';

interface ResultListProps {
  readonly items: readonly QuestionSummary[];
  readonly bookmarkedIds: ReadonlySet<string>;
  readonly canBookmark: boolean;
  /** The current browse query, carried to the detail page so "back" returns here. */
  readonly linkQuery: string;
}

const MAX_TAGS_SHOWN = 4;

export function ResultList({ items, bookmarkedIds, canBookmark, linkQuery }: ResultListProps) {
  return (
    <ol className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {items.map((q) => (
        <li key={q.id} className="flex items-start gap-2 py-3">
          <div className="min-w-0 flex-1">
            <Link
              href={`/questions/${q.id}${linkQuery}`}
              data-result-link
              className="block rounded-sm font-medium leading-6 text-zinc-900 hover:text-indigo-600 dark:text-zinc-100 dark:hover:text-indigo-400"
            >
              <span className="line-clamp-2">
                <InlineMarkdown>{q.stem}</InlineMarkdown>
              </span>
            </Link>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
              <TopicTrail path={q.topicPath} />
              <span aria-hidden>·</span>
              <DifficultyBadge difficulty={q.difficulty} />
              <span>{TYPE_LABELS[q.type] ?? q.type}</span>
              <StatusBadge status={q.status} />
              {q.tags.slice(0, MAX_TAGS_SHOWN).map((tag) => (
                <TagLink key={tag} tag={tag} />
              ))}
            </div>
          </div>
          {canBookmark && <BookmarkButton questionId={q.id} bookmarked={bookmarkedIds.has(q.id)} />}
        </li>
      ))}
    </ol>
  );
}
