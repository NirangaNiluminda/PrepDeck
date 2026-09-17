import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';
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
            <nav aria-label="Main" className="flex items-center gap-1 whitespace-nowrap text-sm">
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
                </>
              )}
              {viewer?.role === 'admin' && (
                <Link href="/admin/questions/new" className={NAV_LINK}>
                  New question
                </Link>
              )}
            </nav>
            <span
              className="ml-auto hidden truncate text-xs text-zinc-500 sm:inline dark:text-zinc-400"
              title="Development sign-in, from DEV_USER_ID and DEV_USER_ROLE in .env.local"
            >
              {viewer ? `${viewer.userId} · ${viewer.role}` : 'Signed out'}
            </span>
          </div>
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
