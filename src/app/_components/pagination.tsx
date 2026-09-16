import Link from 'next/link';
import { type BrowseParams, PAGE_SIZE, browseHref } from '../_lib/browse-params';

const LINK = 'rounded-md px-2 py-1 font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-400/10';

export function Pagination({ params, total }: { params: BrowseParams; total: number }) {
  const pages = Math.ceil(total / PAGE_SIZE);
  if (pages <= 1) return null;

  const first = (params.page - 1) * PAGE_SIZE + 1;
  const last = Math.min(params.page * PAGE_SIZE, total);

  return (
    <nav aria-label="Pagination" className="mt-2 flex items-center justify-between border-t border-zinc-200 pt-3 text-sm dark:border-zinc-800">
      {params.page > 1 ? (
        <Link href={browseHref(params, { page: params.page - 1 })} rel="prev" className={LINK}>
          ← Previous
        </Link>
      ) : (
        <span />
      )}
      <span className="text-zinc-500 dark:text-zinc-400">
        {first}–{last} of {total}
      </span>
      {params.page < pages ? (
        <Link href={browseHref(params, { page: params.page + 1 })} rel="next" className={LINK}>
          Next →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
