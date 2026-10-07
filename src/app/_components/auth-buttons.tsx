import { signInAction, signOutAction } from '../actions/auth';

const BUTTON =
  'rounded-full px-3 py-1.5 text-xs font-semibold text-zinc-700 ring-1 ring-inset ring-line bg-surface hover:bg-brand-50 hover:text-brand-700 dark:text-zinc-300 dark:hover:bg-brand-400/10 dark:hover:text-brand-300';

/**
 * Only rendered when GitHub OAuth is actually configured (see layout.tsx) —
 * under the dev provider there is no real session for these to act on.
 */
export function SignInButton() {
  return (
    <form action={signInAction}>
      <button type="submit" className={BUTTON}>
        Sign in with GitHub
      </button>
    </form>
  );
}

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button type="submit" className={BUTTON}>
        Sign out
      </button>
    </form>
  );
}
