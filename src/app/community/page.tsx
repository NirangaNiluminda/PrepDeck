import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getViewer } from '../_lib/viewer';

export const metadata: Metadata = { title: 'Community' };

export default async function CommunityHubPage() {
  const viewer = await getViewer();
  if (!viewer) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <h1 className="text-xl font-semibold tracking-tight">Community</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Add questions to the bank and vote on the ones that matter most.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <HubLink href="/community/submit" title="Submit a question" description="Write one up, with a live preview and duplicate check." />
        <HubLink href="/community/submissions" title="My submissions" description="Track review status and revise anything sent back." />
        {viewer.role === 'admin' && (
          <HubLink href="/community/moderate" title="Moderate" description="Review pending submissions and open reports." />
        )}
        <HubLink href="/recommended" title="Recommended for you" description="Highly-voted questions in your weak topics." />
      </div>
    </div>
  );
}

function HubLink({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-zinc-200 p-4 hover:border-indigo-400 dark:border-zinc-800 dark:hover:border-indigo-500"
    >
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{title}</p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
    </Link>
  );
}
