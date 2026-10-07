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
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-brand-500"
        >
          <circle cx="9" cy="9" r="5.5" />
          <path strokeLinecap="round" d="M13.5 13.5L17 17" />
        </svg>
        <input
          id={SEARCH_INPUT_ID}
          type="search"
          name="q"
          form={FILTER_FORM_ID}
          defaultValue={params.q}
          maxLength={200}
          placeholder="Search questions…"
          autoComplete="off"
          className="w-full rounded-2xl border border-line bg-surface py-3 pl-10 pr-10 text-sm shadow-sm placeholder:text-zinc-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15 focus:outline-none"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
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
        className="rounded-2xl border border-line bg-surface py-3 pl-3 pr-8 text-sm font-medium shadow-sm"
      >
        <option value="">{SORT_LABELS.newest}</option>
        <option value="oldest">{SORT_LABELS.oldest}</option>
        <option value="easiest">{SORT_LABELS.easiest}</option>
        <option value="hardest">{SORT_LABELS.hardest}</option>
      </select>
    </div>
  );
}
