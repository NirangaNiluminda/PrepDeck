import type { Metadata } from 'next';
import Link from 'next/link';
import { OnboardingForm } from '../_components/onboarding-form';
import { getViewer } from '../_lib/viewer';

export const metadata: Metadata = { title: 'Welcome' };

export default async function OnboardingPage() {
  const viewer = await getViewer();
  if (!viewer) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-16 text-center">
        <h1 className="text-lg font-semibold">Sign in to continue</h1>
        <Link href="/" className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
          Browse questions instead
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <h1 className="text-xl font-semibold tracking-tight">A couple of questions</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        This just points Practice at a sensible starting topic — nothing here is shared, and you can change it later
        in Settings.
      </p>
      <div className="mt-8">
        <OnboardingForm />
      </div>
    </div>
  );
}
