import Link from 'next/link';
import { getContainer } from '@/composition/container';
import { listBookmarkedQuestionIds } from '@/modules/bookmarks';
import { listQuestionFacets, searchQuestions, type QuestionStatus } from '@/modules/questions';
import { Kbd } from './_components/badges';
import { FilterSidebar } from './_components/filter-sidebar';
import { Pagination } from './_components/pagination';
import { ResultKeyboard } from './_components/result-keyboard';
import { ResultList } from './_components/result-list';
import { SEARCH_INPUT_ID, SearchBar } from './_components/search-bar';
import { PAGE_SIZE, browseHref, hasFilters, parseBrowseParams } from './_lib/browse-params';
import { getViewer } from './_lib/viewer';

// Admins see drafts too, but archived questions were hidden on purpose and
// only come back when the Status filter asks for them.
const WORKING_SET: readonly QuestionStatus[] = ['draft', 'in-review', 'published'];

export default async function BrowsePage(props: PageProps<'/'>) {
  const params = parseBrowseParams(await props.searchParams);
  const viewer = await getViewer();
  const isAdmin = viewer?.role === 'admin';
  const container = await getContainer();

  const bookmarkedIds = viewer
    ? await listBookmarkedQuestionIds({ userId: viewer.userId }, container)
    : [];
  const statuses = isAdmin && params.statuses.length === 0 ? WORKING_SET : params.statuses;

  const [page, facets] = await Promise.all([
    searchQuestions(
      {
        topicPath: params.topic,
        difficulties: params.difficulties,
        types: params.types,
        tags: params.tags,
        statuses,
        text: params.q,
        ids: viewer && params.bookmarked ? bookmarkedIds : undefined,
        sort: params.sort,
        page: { limit: PAGE_SIZE, offset: (params.page - 1) * PAGE_SIZE },
        viewerIsAdmin: isAdmin,
      },
      container,
    ),
    listQuestionFacets({ viewerIsAdmin: isAdmin, statuses }, container),
  ]);

  // Keying the filter controls by the URL remounts them whenever it changes,
  // so a box ticked earlier can't stay ticked after "Clear filters".
  const href = browseHref(params);
  const filtered = hasFilters(params);

  return (
    // Results come first in the DOM so a phone shows questions before filters;
    // from md up the sidebar moves to the left.
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-6 md:grid-cols-[15rem_minmax(0,1fr)]">
      <section aria-labelledby="results-heading" className="min-w-0">
        <SearchBar key={href} params={params} />

        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
          <h1 id="results-heading" className="text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{page.total}</span>{' '}
            {page.total === 1 ? 'question' : 'questions'}
            {params.bookmarked && ' bookmarked'}
            {filtered && (
              <>
                {' · '}
                <Link href="/" className="text-indigo-600 hover:underline dark:text-indigo-400">
                  Clear filters
                </Link>
              </>
            )}
          </h1>
          <p className="hidden items-center gap-1.5 text-xs text-zinc-500 md:flex dark:text-zinc-400">
            <Kbd>/</Kbd> search <Kbd>j</Kbd> <Kbd>k</Kbd> move <Kbd>Enter</Kbd> open
          </p>
          <a href="#filters" className="text-sm font-medium text-indigo-600 md:hidden dark:text-indigo-400">
            Filters ↓
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
  );
}

function EmptyState({ filtered, bookmarked, isAdmin }: { filtered: boolean; bookmarked: boolean; isAdmin: boolean }) {
  let message: React.ReactNode;
  if (bookmarked) {
    message = 'No bookmarks here yet. Star a question to keep it in this list.';
  } else if (filtered) {
    message = 'No questions match these filters.';
  } else if (isAdmin) {
    message = (
      <>
        No questions yet. Import some with{' '}
        <code className="rounded bg-zinc-100 px-1 font-mono text-[0.9em] dark:bg-zinc-800">
          npm run import-questions -- --publish
        </code>{' '}
        or{' '}
        <Link href="/admin/questions/new" className="text-indigo-600 hover:underline dark:text-indigo-400">
          write one
        </Link>
        .
      </>
    );
  } else {
    message = 'No questions have been published yet.';
  }

  return (
    <p className="mt-6 rounded-lg border border-dashed border-zinc-300 px-4 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
      {message}
    </p>
  );
}
