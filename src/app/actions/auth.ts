'use server';

import { signIn, signOut } from '@/auth';

// Plain server actions wrapping NextAuth's own signIn/signOut, rather than
// next-auth/react's client hooks — consistent with how the rest of this app
// prefers a <form action={...}> over client-side session state, and it means
// no SessionProvider needs to wrap the app just for two buttons.

export async function signInAction(): Promise<void> {
  await signIn('github', { redirectTo: '/' });
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: '/' });
}
