import type { Metadata } from 'next';
import Link from 'next/link';
import { getContainer } from '@/composition/container';
import { getOrCreateProfile } from '@/modules/users';
import { SettingsForm } from '../_components/settings-form';
import { getViewer } from '../_lib/viewer';

export const metadata: Metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const viewer = await getViewer();
  if (!viewer) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-16 text-center">
        <h1 className="text-lg font-semibold">Sign in to change settings</h1>
        <Link href="/" className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
          Browse questions instead
        </Link>
      </div>
    );
  }

  const profile = await getOrCreateProfile({ userId: viewer.userId }, await getContainer());

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
      <div className="mt-8">
        <SettingsForm initial={profile.settings} />
      </div>
    </div>
  );
}
