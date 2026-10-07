import Link from 'next/link';
import { getContainer } from '@/composition/container';
import { listBookmarkedQuestionIds } from '@/modules/bookmarks';
import { getProgress } from '@/modules/practice';
import { listQuestionFacets, searchQuestions } from '@/modules/questions';
import { Kbd } from './_components/badges';
import { FilterSidebar } from './_components/filter-sidebar';
import { Pagination } from './_components/pagination';
import { ResultKeyboard } from './_components/result-keyboard';
import { ResultList } from './_components/result-list';
import { SEARCH_INPUT_ID, SearchBar } from './_components/search-bar';
import { TodayHero, WelcomeHero } from './_components/today-hero';
import { TopicChips } from './_components/topic-chips';
import { PAGE_SIZE, browseHref, hasFilters, parseBrowseParams } from './_lib/browse-params';
import { browseSearchInput } from './_lib/browse-query';
import { getViewer } from './_lib/viewer';

export default async function BrowsePage(props: PageProps<'/'>) {
  const params = parseBrowseParams(await props.searchParams);
  const viewer = await getViewer();
  const isAdmin = viewer?.role === 'admin';
  const container = await getContainer();

  const bookmarkedIds = viewer
    ? await listBookmarkedQuestionIds({ userId: viewer.userId }, container)
    : [];
  const search = browseSearchInput(params, { isAdmin, bookmarkedIds: viewer ? bookmarkedIds : null });
  // The hero is the landing view only; once someone filters, results come first.
  const showHero = !hasFilters(params) && params.page === 1;

  const [page, facets, progress] = await Promise.all([
    searchQuestions({ ...search, page: { limit: PAGE_SIZE, offset: (params.page - 1) * PAGE_SIZE } }, container),
    listQuestionFacets({ viewerIsAdmin: isAdmin, statuses: search.statuses }, container),
    viewer && showHero ? getProgress({ userId: viewer.userId, now: new Date() }, container) : null,
  ]);

  // Keying the filter controls by the URL remounts them whenever it changes,
  // so a box ticked earlier can't stay ticked after "Clear filters".
  const href = browseHref(params);
  const filtered = hasFilters(params);

  return (
    // Results come first in the DOM so a phone shows questions before filters;
    // from md up the sidebar moves to the left.
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      {showHero && (
        <div className="mb-6">
          {viewer && progress ? (
            <TodayHero
              name={viewer.name ?? viewer.userId}
              streak={progress.streak}
              cardsDue={progress.cardsDue}
              totalReviewed={progress.totalReviewed}
            />
          ) : (
            <WelcomeHero total={page.total} />
          )}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[15rem_minmax(0,1fr)]">
        <section aria-labelledby="results-heading" className="min-w-0">
          <SearchBar key={href} params={params} />

          <div className="mt-4">
            <TopicChips params={params} topics={facets.topics} />
          </div>

          <div className="mt-5 flex flex-wrap items-baseline justify-between gap-2">
            <h1 id="results-heading" className="text-sm text-zinc-600 dark:text-zinc-400">
              <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">{page.total}</span>{' '}
              {page.total === 1 ? 'question' : 'questions'}
              {params.bookmarked && ' bookmarked'}
              {filtered && (
                <>
                  {' · '}
                  <Link href="/" className="text-brand-600 hover:underline dark:text-brand-400">
                    Clear filters
                  </Link>
                </>
              )}
            </h1>
            <p className="hidden items-center gap-1.5 text-xs text-zinc-500 md:flex dark:text-zinc-400">
              <Kbd>/</Kbd> search <Kbd>j</Kbd> <Kbd>k</Kbd> move <Kbd>Enter</Kbd> open
            </p>
            <a
              href="#filters"
              className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700 md:hidden dark:bg-brand-400/10 dark:text-brand-300"
            >
              🎛️ Filters ↓
            </a>
          </div>

          {page.items.length > 0 ? (
            <>
              <ResultList
                items={page.items}
                bookmarkedIds={new Set(bookmarkedIds)}
                canBookmark={viewer !== null}
                linkQuery={href === '/' ? '' : href.slice(1)}
              />
              <Pagination params={params} total={page.total} />
            </>
          ) : (
            <EmptyState filtered={filtered} bookmarked={params.bookmarked} isAdmin={isAdmin} />
          )}

          <ResultKeyboard searchInputId={SEARCH_INPUT_ID} />
        </section>

        <FilterSidebar key={href} params={params} facets={facets} isAdmin={isAdmin} signedIn={viewer !== null} />
      </div>
    </div>
  );
}

function EmptyState({ filtered, bookmarked, isAdmin }: { filtered: boolean; bookmarked: boolean; isAdmin: boolean }) {
  let message: React.ReactNode;
  let emoji = '📭';
  if (bookmarked) {
    emoji = '⭐';
    message = 'No bookmarks here yet. Star a question to keep it in this list.';
  } else if (filtered) {
    emoji = '🔍';
    message = 'No questions match these filters. Try removing one.';
  } else if (isAdmin) {
    message = (
      <>
        No questions yet. Import some with{' '}
        <code className="rounded bg-zinc-100 px-1 font-mono text-[0.9em] dark:bg-zinc-800">
          npm run import-questions -- --publish
        </code>{' '}
        or{' '}
        <Link href="/admin/questions/new" className="text-brand-600 hover:underline dark:text-brand-400">
          write one
        </Link>
        .
      </>
    );
  } else {
    message = 'No questions have been published yet.';
  }

  return (
    <div className="mt-6 rounded-3xl border-2 border-dashed border-line bg-surface/60 px-4 py-12 text-center">
      <p aria-hidden className="text-4xl">
        {emoji}
      </p>
      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
    </div>
  );
}
