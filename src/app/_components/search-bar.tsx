import type { BrowseParams } from '../_lib/browse-params';
import { SORT_LABELS } from '../_lib/labels';
import { Kbd } from './badges';
import { FILTER_FORM_ID } from './filter-sidebar';

export const SEARCH_INPUT_ID = 'question-search';

/** Joins the sidebar's filter form through the form attribute, so one submit carries everything. */
export function SearchBar({ params }: { params: BrowseParams }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-48 flex-1">
        <label htmlFor={SEARCH_INPUT_ID} className="sr-only">
          Search questions
        </label>
        <input
          id={SEARCH_INPUT_ID}
          type="search"
          name="q"
          form={FILTER_FORM_ID}
          defaultValue={params.q}
          maxLength={200}
          placeholder="Search questions"
          autoComplete="off"
          className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-3 pr-9 text-sm shadow-xs placeholder:text-zinc-400 focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
          <Kbd>/</Kbd>
        </span>
      </div>
      <label htmlFor="question-sort" className="sr-only">
        Sort
      </label>
      <select
        id="question-sort"
        name="sort"
        form={FILTER_FORM_ID}
        // "newest" is the default, so it submits as empty and stays out of the URL.
        defaultValue={params.sort === 'newest' ? '' : params.sort}
        className="rounded-lg border border-zinc-300 bg-white py-2 pl-2 pr-8 text-sm shadow-xs dark:border-zinc-700 dark:bg-zinc-900"
      >
        <option value="">{SORT_LABELS.newest}</option>
        <option value="oldest">{SORT_LABELS.oldest}</option>
        <option value="easiest">{SORT_LABELS.easiest}</option>
        <option value="hardest">{SORT_LABELS.hardest}</option>
      </select>
    </div>
  );
}
