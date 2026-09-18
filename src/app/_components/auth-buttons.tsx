import { signInAction, signOutAction } from '../actions/auth';

const BUTTON =
  'rounded-md px-2.5 py-1 text-xs font-medium text-zinc-700 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-100 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-800';

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
