const dayKey = (date: Date): string => date.toISOString().slice(0, 10);

/**
 * Consecutive practised days counting back from today. If today has no
 * practice yet, counting starts from yesterday instead — otherwise a streak
 * would flash to zero every morning before the learner has had a chance to
 * open the app, which is a worse (and misleading) experience than a one-day lag.
 */
export function computeStreak(practiceDates: readonly string[], today: Date): number {
  const practised = new Set(practiceDates);
  const cursor = new Date(today);
  if (!practised.has(dayKey(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1);

  let streak = 0;
  while (practised.has(dayKey(cursor))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}
