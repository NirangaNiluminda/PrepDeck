/**
 * The UTC instant that is midnight in `timeZone`, for whatever moment `date`
 * represents. The only thing this drives is where the practice daily
 * new-card cap's boundary falls — see get-due-queue.ts.
 *
 * No timezone library: `Intl` already knows the wall-clock time in any IANA
 * zone at a given instant, so subtracting "how far into today it already is
 * there" from `date` gives zone-midnight as a UTC Date. Correct across DST
 * transitions, since it never computes or stores a fixed UTC offset.
 */
export function startOfDayInTimezone(date: Date, timeZone: string): Date {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const get = (type: string): number => Number(parts.find((p) => p.type === type)?.value ?? 0);
  // hour12: false can render midnight as "24" rather than "00" in some engines.
  const msSinceMidnight = ((get('hour') % 24) * 3600 + get('minute') * 60 + get('second')) * 1000;
  return new Date(date.getTime() - msSinceMidnight);
}
