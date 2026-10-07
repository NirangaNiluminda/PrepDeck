'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly emoji: string;
}

/** Client-only for the active highlight: the current path isn't known to the root layout. */
export function NavLinks({ items }: { items: readonly NavItem[] }) {
  const pathname = usePathname();

  // Path only: reading the query string here would force a Suspense boundary
  // around the header on every page, just to tell Browse from Bookmarks.
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' || pathname.startsWith('/questions/') : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition-colors ${
              active
                ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                : 'text-zinc-600 hover:bg-brand-50 hover:text-brand-700 dark:text-zinc-400 dark:hover:bg-brand-400/10 dark:hover:text-brand-300'
            }`}
          >
            <span aria-hidden className="text-[0.95em]">
              {item.emoji}
            </span>
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
