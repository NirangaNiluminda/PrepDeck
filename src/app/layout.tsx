import type { Metadata } from 'next';
import { Geist_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import Link from 'next/link';
import { hasGitHubAuth } from '@/composition/container';
import { SignInButton, SignOutButton } from './_components/auth-buttons';
import { NavLinks, type NavItem } from './_components/nav-links';
import { getViewer } from './_lib/viewer';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: { default: 'PrepDeck', template: '%s · PrepDeck' },
  description: 'A filterable, practisable knowledge base of interview questions.',
};

const SIGNED_OUT_NAV: readonly NavItem[] = [{ href: '/', label: 'Browse', emoji: '🔎' }];

const SIGNED_IN_NAV: readonly NavItem[] = [
  { href: '/', label: 'Browse', emoji: '🔎' },
  { href: '/practice', label: 'Practice', emoji: '🧠' },
  { href: '/exams', label: 'Exams', emoji: '⏱️' },
  { href: '/progress', label: 'Progress', emoji: '📈' },
  { href: '/?bookmarked=1', label: 'Bookmarks', emoji: '⭐' },
  { href: '/recommended', label: 'For you', emoji: '✨' },
  { href: '/community', label: 'Community', emoji: '🤝' },
];

const ADMIN_NAV: readonly NavItem[] = [{ href: '/admin/questions/new', label: 'New question', emoji: '➕' }];

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const viewer = await getViewer();
  const nav = viewer ? [...SIGNED_IN_NAV, ...(viewer.role === 'admin' ? ADMIN_NAV : [])] : SIGNED_OUT_NAV;
  const displayName = viewer ? (viewer.name ?? viewer.userId) : null;

  return (
    <html lang="en" className={`${jakarta.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <header className="sticky top-0 z-20 border-b border-line bg-background/85 backdrop-blur-md">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4">
            <Link href="/" className="flex shrink-0 items-center gap-2 font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              <span
                aria-hidden
                className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-fuchsia-500 text-base text-white shadow-md shadow-brand-500/30"
              >
                P
              </span>
              <span className="hidden sm:inline">PrepDeck</span>
            </Link>
            {/* min-w-0 lets this flex item shrink below its content width, so a
                narrow viewport scrolls the nav itself instead of the whole page. */}
            <nav
              aria-label="Main"
              className="flex min-w-0 items-center gap-1 overflow-x-auto whitespace-nowrap text-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <NavLinks items={nav} />
            </nav>
            <div className="ml-auto flex shrink-0 items-center gap-2">
              {viewer && (
                <Link
                  href="/settings"
                  title={
                    hasGitHubAuth
                      ? `Settings · ${displayName} (${viewer.role})`
                      : `Settings · development sign-in, from DEV_USER_ID and DEV_USER_ROLE in .env.local`
                  }
                  className="flex items-center gap-2 rounded-full py-1 pl-1 pr-1 text-xs font-medium text-zinc-600 hover:bg-brand-50 sm:pr-3 dark:text-zinc-400 dark:hover:bg-brand-400/10"
                >
                  <span
                    aria-hidden
                    className="flex size-7 items-center justify-center rounded-full bg-brand-100 font-bold uppercase text-brand-700 dark:bg-brand-400/20 dark:text-brand-200"
                  >
                    {displayName?.charAt(0)}
                  </span>
                  <span className="hidden max-w-28 truncate lg:inline">{displayName}</span>
                  <span className="sr-only">Settings</span>
                </Link>
              )}
              {!viewer && <span className="text-xs text-zinc-500 dark:text-zinc-400">Signed out</span>}
              {hasGitHubAuth && (viewer ? <SignOutButton /> : <SignInButton />)}
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
