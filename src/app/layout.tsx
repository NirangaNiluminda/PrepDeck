import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';
import { hasGitHubAuth } from '@/composition/container';
import { SignInButton, SignOutButton } from './_components/auth-buttons';
import { getViewer } from './_lib/viewer';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
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

const NAV_LINK =
  'rounded-md px-2 py-1 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100';

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const viewer = await getViewer();

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
          <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4">
            <Link href="/" className="font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              PrepDeck
            </Link>
            {/* min-w-0 lets this flex item shrink below its content width, so a
                narrow viewport scrolls the nav itself instead of the whole page. */}
            <nav
              aria-label="Main"
              className="flex min-w-0 items-center gap-1 overflow-x-auto whitespace-nowrap text-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <Link href="/" className={NAV_LINK}>
                Browse
              </Link>
              {viewer && (
                <>
                  <Link href="/?bookmarked=1" className={NAV_LINK}>
                    Bookmarks
                  </Link>
                  <Link href="/practice" className={NAV_LINK}>
                    Practice
                  </Link>
                  <Link href="/progress" className={NAV_LINK}>
                    Progress
                  </Link>
                  <Link href="/exams" className={NAV_LINK}>
                    Exams
                  </Link>
                  <Link href="/community" className={NAV_LINK}>
                    Community
                  </Link>
                  <Link href="/recommended" className={NAV_LINK}>
                    Recommended
                  </Link>
                  <Link href="/settings" className={NAV_LINK}>
                    Settings
                  </Link>
                </>
              )}
              {viewer?.role === 'admin' && (
                <Link href="/admin/questions/new" className={NAV_LINK}>
                  New question
                </Link>
              )}
            </nav>
            <div className="ml-auto flex items-center gap-3">
              <span
                className="hidden truncate text-xs text-zinc-500 sm:inline dark:text-zinc-400"
                title={
                  viewer && !hasGitHubAuth
                    ? 'Development sign-in, from DEV_USER_ID and DEV_USER_ROLE in .env.local'
                    : undefined
                }
              >
                {viewer ? `${viewer.name ?? viewer.userId} · ${viewer.role}` : 'Signed out'}
              </span>
              {hasGitHubAuth && (viewer ? <SignOutButton /> : <SignInButton />)}
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
