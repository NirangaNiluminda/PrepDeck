import Link from 'next/link';

export const PRIMARY_BUTTON =
  'inline-block rounded-full bg-gradient-to-r from-brand-600 to-fuchsia-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-600/25 transition hover:-translate-y-0.5';
export const SECONDARY_BUTTON =
  'inline-block rounded-full px-5 py-2.5 text-sm font-bold text-zinc-700 ring-1 ring-inset ring-line hover:bg-surface-muted dark:text-zinc-200';

/** The centred emoji-and-message card the practice pages use for every not-a-session state. */
export function StateCard({ emoji, title, children }: { emoji: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-line bg-surface px-6 py-12 text-center shadow-sm">
      <p aria-hidden className="animate-pop text-5xl">
        {emoji}
      </p>
      <h1 className="mt-4 text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h1>
      {children}
    </div>
  );
}

export function SignInPrompt() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <StateCard emoji="🔐" title="Sign in to practice">
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Review progress is tracked per person, so practice needs an account.
        </p>
        <Link href="/" className={`mt-6 ${SECONDARY_BUTTON}`}>
          Browse questions instead
        </Link>
      </StateCard>
    </div>
  );
}

export function OnboardingNudge() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <StateCard emoji="👋" title="A couple of quick questions first">
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          This points Practice at a sensible starting topic. Takes about ten seconds.
        </p>
        <Link href="/onboarding" className={`mt-6 ${PRIMARY_BUTTON}`}>
          Get started
        </Link>
      </StateCard>
    </div>
  );
}
