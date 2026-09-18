import type { Metadata } from 'next';
import Link from 'next/link';
import { getContainer } from '@/composition/container';
import { getDueQueue } from '@/modules/practice';
import { DIFFICULTIES, type Difficulty } from '@/modules/questions';
import { getOrCreateProfile } from '@/modules/users';
import { PracticeSession } from '../_components/practice-session';
import { TARGET_ROLE_LABELS, TARGET_ROLE_STARTER_TOPIC } from '../_lib/onboarding-labels';
import { SESSION_LIMIT } from '../_lib/practice-config';
import { getViewer } from '../_lib/viewer';

export const metadata: Metadata = { title: 'Practice' };

// UserSettings keeps this loose (see that module's own note on why); narrowed
// back to the real union here, the one place that actually needs it.
const asDifficulty = (value: string | undefined): Difficulty | undefined =>
  (DIFFICULTIES as readonly string[]).includes(value ?? '') ? (value as Difficulty) : undefined;

export default async function PracticePage(props: PageProps<'/practice'>) {
  const { topic } = await props.searchParams;
  const topicPath = typeof topic === 'string' ? topic : undefined;

  const viewer = await getViewer();
  if (!viewer) return <SignInPrompt />;

  const container = await getContainer();
  const profile = await getOrCreateProfile({ userId: viewer.userId }, container);

  if (!profile.onboarding) return <OnboardingNudge />;

  const cards = await getDueQueue(
    {
      userId: viewer.userId,
      now: new Date(),
      newCardCap: profile.settings.newCardCap,
      limit: SESSION_LIMIT,
      topicPath,
      timezone: profile.settings.timezone,
      preferredDifficulty: asDifficulty(profile.settings.preferredDifficulty),
    },
    container,
  );

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      {!topicPath && <StarterPackSuggestion targetRole={profile.onboarding.targetRole} />}
      {cards.length === 0 ? (
        <EmptyQueue topicPath={topicPath} />
      ) : (
        // PracticeSession is a Client Component and deliberately does not import
        // '@/modules/practice' (its index.ts also exports the Mongo adapter); its
        // SessionCard prop type is a local, structurally compatible echo of DueCard.
        <PracticeSession cards={cards} />
      )}
    </div>
  );
}

function StarterPackSuggestion({ targetRole }: { targetRole: string }) {
  const topicPath = TARGET_ROLE_STARTER_TOPIC[targetRole];
  if (!topicPath) return null;
  return (
    <p className="mb-6 rounded-md bg-indigo-50 px-3 py-2 text-sm text-indigo-800 dark:bg-indigo-400/10 dark:text-indigo-300">
      Preparing for {TARGET_ROLE_LABELS[targetRole] ?? targetRole}?{' '}
      <Link href={`/practice?topic=${encodeURIComponent(topicPath)}`} className="font-medium underline underline-offset-2">
        Start with {topicPath}
      </Link>
      .
    </p>
  );
}

function SignInPrompt() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-16 text-center">
      <h1 className="text-lg font-semibold">Sign in to practice</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Review progress is tracked per person, so practice needs an account.
      </p>
      <Link href="/" className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
        Browse questions instead
      </Link>
    </div>
  );
}

function OnboardingNudge() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-16 text-center">
      <h1 className="text-lg font-semibold">A couple of quick questions first</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        This points Practice at a sensible starting topic. Takes about ten seconds.
      </p>
      <Link
        href="/onboarding"
        className="mt-6 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
      >
        Get started
      </Link>
    </div>
  );
}

function EmptyQueue({ topicPath }: { topicPath?: string }) {
  return (
    <div className="py-16 text-center">
      <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Nothing due right now</p>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {topicPath
          ? "You're caught up in this topic, and today's new-card cap is used up or there's nothing new here to learn."
          : "You're caught up, and today's new-card cap is used up. Check back tomorrow, or browse for something specific."}
      </p>
      <div className="mt-6 flex justify-center gap-4 text-sm">
        <Link href="/" className="text-indigo-600 hover:underline dark:text-indigo-400">
          Browse questions
        </Link>
        <Link href="/progress" className="text-indigo-600 hover:underline dark:text-indigo-400">
          View progress
        </Link>
      </div>
    </div>
  );
}
