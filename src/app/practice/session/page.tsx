import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getContainer } from '@/composition/container';
import { getDueQueue, getStudyPack, type StudyPackView } from '@/modules/practice';
import { DIFFICULTIES, type Difficulty } from '@/modules/questions';
import { getOrCreateProfile } from '@/modules/users';
import { PracticeSession } from '../../_components/practice-session';
import { OnboardingNudge, PRIMARY_BUTTON, SECONDARY_BUTTON, SignInPrompt, StateCard } from '../../_components/practice-states';
import { topicLabel } from '../../_lib/labels';
import { SESSION_LIMIT } from '../../_lib/practice-config';
import { getViewer } from '../../_lib/viewer';

export const metadata: Metadata = { title: 'Practice session' };

// UserSettings and StudyPack both keep difficulties loose (domain code never
// imports another module's types); narrowed back to the real union here.
const asDifficulties = (values: readonly string[]): Difficulty[] =>
  values.filter((v): v is Difficulty => (DIFFICULTIES as readonly string[]).includes(v));

const one = (value: string | string[] | undefined) => (typeof value === 'string' && value ? value : undefined);

export default async function PracticeSessionPage(props: PageProps<'/practice/session'>) {
  const search = await props.searchParams;
  const packId = one(search.pack);
  const topicPath = packId ? undefined : one(search.topic);

  const viewer = await getViewer();
  if (!viewer) return <SignInPrompt />;

  const container = await getContainer();
  const now = new Date();
  const profile = await getOrCreateProfile({ userId: viewer.userId }, container);
  if (!profile.onboarding) return <OnboardingNudge />;

  let pack: (StudyPackView & { status: string }) | null = null;
  if (packId) {
    const result = await getStudyPack({ userId: viewer.userId, packId, now }, container);
    // Someone else's pack and a missing one look the same, on purpose.
    if (!result.ok) notFound();
    pack = result.value;
  }

  if (pack?.status === 'archived') {
    return (
      <Shell title={pack.name}>
        <StateCard emoji="🗃️" title="This pack is archived">
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Everything you learned from it is still scheduled in your daily review.
          </p>
          <Link href="/practice" className={`mt-6 ${PRIMARY_BUTTON}`}>
            Back to practice
          </Link>
        </StateCard>
      </Shell>
    );
  }

  const preferred = asDifficulties(profile.settings.preferredDifficulty ? [profile.settings.preferredDifficulty] : [])[0];
  const cards = await getDueQueue(
    {
      userId: viewer.userId,
      now,
      newCardCap: profile.settings.newCardCap,
      limit: SESSION_LIMIT,
      topicPath,
      topicPaths: pack?.topicPaths,
      difficulties: pack ? asDifficulties(pack.difficulties) : undefined,
      timezone: profile.settings.timezone,
      preferredDifficulty: preferred,
    },
    container,
  );

  const title = pack ? pack.name : topicPath ? topicLabel(topicPath.split('/').pop() ?? topicPath) : 'Daily review';
  const againHref = pack ? `/practice/session?pack=${pack.id}` : topicPath ? `/practice/session?topic=${encodeURIComponent(topicPath)}` : '/practice/session';

  return (
    <Shell title={title} subtitle={pack ? packSubtitle(pack) : undefined}>
      {cards.length === 0 ? (
        <EmptyQueue pack={pack} topicPath={topicPath} newCardCap={profile.settings.newCardCap} />
      ) : (
        // PracticeSession is a Client Component and deliberately does not import
        // '@/modules/practice' (its index.ts also exports the Mongo adapter); its
        // SessionCard prop type is a local, structurally compatible echo of DueCard.
        <PracticeSession cards={cards} exitHref="/practice" againHref={againHref} />
      )}
    </Shell>
  );
}

const packSubtitle = (pack: StudyPackView) => {
  const { started, total, due } = pack.progress;
  return `${started} of ${total} started${due > 0 ? ` · ${due} due` : ''}`;
};

function Shell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <Link
          href="/practice"
          className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-sm font-semibold text-zinc-600 shadow-sm ring-1 ring-inset ring-line hover:text-brand-700 dark:text-zinc-300 dark:hover:text-brand-300"
        >
          ← All practice
        </Link>
        <div className="min-w-0 text-right">
          <p className="truncate text-sm font-extrabold text-zinc-900 dark:text-zinc-50">{title}</p>
          {subtitle && <p className="text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function EmptyQueue({ pack, topicPath, newCardCap }: { pack: StudyPackView | null; topicPath?: string; newCardCap: number }) {
  // A pack knows whether anything is left in it, so it can say *why* the queue is empty.
  if (pack && pack.progress.notStarted === 0) {
    return (
      <StateCard emoji="🏆" title="You've been through the whole pack">
        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
          Every card in “{pack.name}” is started and none is due right now. Each one comes back when it&rsquo;s time to review it.
        </p>
        <Actions />
      </StateCard>
    );
  }

  return (
    <StateCard emoji="🏖️" title="Nothing due right now">
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
        {pack
          ? `You've used today's ${newCardCap} new cards. The ${pack.progress.notStarted} still waiting in this pack will be here tomorrow, right where you left off.`
          : topicPath
            ? "You're caught up in this topic, and today's new-card cap is used up or there's nothing new here to learn."
            : "You're caught up, and today's new-card cap is used up. Check back tomorrow, or browse for something specific."}
      </p>
      {pack && (
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Want more per day?{' '}
          <Link href="/settings" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
            Raise your daily new-card limit
          </Link>
          .
        </p>
      )}
      <Actions />
    </StateCard>
  );
}

function Actions() {
  return (
    <div className="mt-6 flex flex-wrap justify-center gap-3">
      <Link href="/practice" className={PRIMARY_BUTTON}>
        🧠 All practice
      </Link>
      <Link href="/progress" className={SECONDARY_BUTTON}>
        📈 View progress
      </Link>
    </div>
  );
}
