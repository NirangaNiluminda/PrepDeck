import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getContainer } from '@/composition/container';
import { getProgress, listStudyPacks } from '@/modules/practice';
import { getOrCreateProfile } from '@/modules/users';
import { PRIMARY_BUTTON, SignInPrompt } from '../_components/practice-states';
import { StudyPackCard } from '../_components/study-pack-card';
import { TARGET_ROLE_LABELS, TARGET_ROLE_STARTER_TOPIC } from '../_lib/onboarding-labels';
import { topicLabel } from '../_lib/labels';
import { getViewer } from '../_lib/viewer';

export const metadata: Metadata = { title: 'Practice' };

export default async function PracticeHubPage(props: PageProps<'/practice'>) {
  // Links from before the hub existed went straight into a topic session.
  const { topic } = await props.searchParams;
  if (typeof topic === 'string' && topic) redirect(`/practice/session?topic=${encodeURIComponent(topic)}`);

  const viewer = await getViewer();
  if (!viewer) return <SignInPrompt />;

  const container = await getContainer();
  const now = new Date();
  const [profile, progress, packs] = await Promise.all([
    getOrCreateProfile({ userId: viewer.userId }, container),
    getProgress({ userId: viewer.userId, now }, container),
    listStudyPacks({ userId: viewer.userId, now }, container),
  ]);
  // The most recently studied pack with something left in it is the one to resume.
  const resumeId = packs.find((p) => p.progress.started > 0 && (p.progress.due > 0 || p.progress.notStarted > 0))?.id;
  const starterTopic = profile.onboarding ? TARGET_ROLE_STARTER_TOPIC[profile.onboarding.targetRole] : undefined;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">🧠 Practice</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Short sessions, every day. Stop any time: every card you rate is saved.
      </p>

      {!profile.onboarding && (
        <p className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-inset ring-amber-200 dark:bg-amber-400/10 dark:text-amber-200 dark:ring-amber-400/20">
          <span aria-hidden className="text-xl">
            👋
          </span>
          <span className="flex-1">Answer two quick questions so Practice can suggest where to start.</span>
          <Link href="/onboarding" className="font-bold underline underline-offset-2">
            Get started
          </Link>
        </p>
      )}

      <section
        aria-label="Daily review"
        className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-violet-500 to-fuchsia-500 p-6 text-white shadow-lg shadow-brand-600/20"
      >
        <span aria-hidden className="pointer-events-none absolute -right-10 -top-16 size-48 rounded-full bg-white/10" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">Daily review · everything you&rsquo;ve started</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight">
              {progress.cardsDue > 0 ? `${progress.cardsDue} ${progress.cardsDue === 1 ? 'card' : 'cards'} due` : 'Nothing due right now ✅'}
            </h2>
            <p className="mt-1 text-sm text-white/85">
              {progress.streak > 0 ? `🔥 ${progress.streak}-day streak` : 'Start a streak today'} · plus up to{' '}
              {profile.settings.newCardCap} new cards a day
            </p>
          </div>
          <Link
            href="/practice/session"
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-white px-5 py-2.5 text-sm font-bold text-brand-700 shadow-md transition hover:-translate-y-0.5 sm:self-auto"
          >
            {progress.cardsDue > 0 ? 'Start daily review' : 'Learn something new'} →
          </Link>
        </div>
      </section>

      <div className="mt-10 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">📦 Your study packs</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Pick topics, work through them over several sessions.</p>
        </div>
        <Link href="/practice/packs/new" className={PRIMARY_BUTTON}>
          ＋ New study pack
        </Link>
      </div>

      {packs.length === 0 ? (
        <div className="mt-5 rounded-3xl border-2 border-dashed border-line bg-surface/60 px-6 py-12 text-center">
          <p aria-hidden className="text-5xl">
            📦
          </p>
          <p className="mt-3 font-bold text-zinc-900 dark:text-zinc-50">No study packs yet</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
            Choose the topics your next interview will cover, say databases and system design, and work through them a few
            cards at a time. Your progress is kept between sessions.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/practice/packs/new" className={PRIMARY_BUTTON}>
              Create your first pack
            </Link>
            {starterTopic && profile.onboarding && (
              <Link
                href={`/practice/session?topic=${encodeURIComponent(starterTopic)}`}
                className="inline-block rounded-full px-5 py-2.5 text-sm font-bold text-zinc-700 ring-1 ring-inset ring-line hover:bg-surface-muted dark:text-zinc-200"
              >
                🎯 Or try {topicLabel(starterTopic)} for {TARGET_ROLE_LABELS[profile.onboarding.targetRole] ?? 'your role'}
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {packs.map((pack) => (
            <StudyPackCard key={pack.id} pack={pack} now={now} highlight={pack.id === resumeId} />
          ))}
        </div>
      )}
    </div>
  );
}
