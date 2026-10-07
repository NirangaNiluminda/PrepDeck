import Link from 'next/link';

interface TodayHeroProps {
  readonly name: string;
  readonly streak: number;
  readonly cardsDue: number;
  readonly totalReviewed: number;
}

/** The browse page's opening: what's waiting today, one click from starting it. */
export function TodayHero({ name, streak, cardsDue, totalReviewed }: TodayHeroProps) {
  return (
    <section
      aria-label="Today"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-violet-500 to-fuchsia-500 p-6 text-white shadow-lg shadow-brand-600/20 sm:p-8"
    >
      {/* Decorative blobs; pointer-events-none so they never cover the button. */}
      <span aria-hidden className="pointer-events-none absolute -right-10 -top-16 size-56 rounded-full bg-white/10" />
      <span aria-hidden className="pointer-events-none absolute -bottom-20 right-24 size-40 rounded-full bg-white/10" />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">Welcome back, {name} 👋</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
            {cardsDue > 0
              ? `${cardsDue} ${cardsDue === 1 ? 'card is' : 'cards are'} ready for review`
              : "You're all caught up ✅"}
          </h2>
          <p className="mt-2 max-w-md text-sm text-white/85">
            {streak > 0
              ? `🔥 ${streak}-day streak — a few minutes today keeps it alive.`
              : 'A few minutes a day beats a cram the night before. Start a streak today.'}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
          <div className="flex gap-2">
            <Stat value={streak} label="day streak" emoji="🔥" />
            <Stat value={totalReviewed} label="reviewed" emoji="🧠" />
          </div>
          <Link
            href="/practice/session"
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-brand-700 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            {cardsDue > 0 ? 'Start practice' : 'Learn something new'} <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label, emoji }: { value: number; label: string; emoji: string }) {
  return (
    <div className="rounded-2xl bg-white/15 px-3 py-2 text-center backdrop-blur-sm">
      <p className="text-lg font-extrabold leading-none tabular-nums">
        <span aria-hidden className="mr-1 text-base">
          {emoji}
        </span>
        {value}
      </p>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-white/75">{label}</p>
    </div>
  );
}

/** For signed-out visitors: what this is, without a dashboard to show. */
export function WelcomeHero({ total }: { total: number }) {
  return (
    <section
      aria-label="Welcome"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-violet-500 to-fuchsia-500 p-6 text-white shadow-lg shadow-brand-600/20 sm:p-8"
    >
      <span aria-hidden className="pointer-events-none absolute -right-10 -top-16 size-56 rounded-full bg-white/10" />
      <div className="relative">
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Get interview-ready, one card at a time 🚀</h2>
        <p className="mt-2 max-w-lg text-sm text-white/85">
          {total} real interview questions with model answers, key points and explanations. Search them, star the ones
          that matter, and practise with spaced repetition.
        </p>
      </div>
    </section>
  );
}
