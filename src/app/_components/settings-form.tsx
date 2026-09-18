'use client';

import { useActionState } from 'react';
import { updateSettingsAction, type SettingsFormValues } from '../actions/users';
import { DIFFICULTY_LABELS } from '../_lib/labels';
import { MAX_NEW_CARD_CAP, MIN_NEW_CARD_CAP } from '../_lib/practice-config';

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const COMMON_TIMEZONES = [
  'UTC',
  'Asia/Colombo',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
];

const INPUT =
  'block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-900';

export function SettingsForm({ initial }: { initial: SettingsFormValues }) {
  const [state, formAction, pending] = useActionState(updateSettingsAction, {});
  // Once a save succeeds, these become what was actually saved rather than
  // the page's original load-time props.
  const values = state.values ?? initial;
  // A custom (non-listed) timezone should still show correctly in the select.
  const timezoneOptions = COMMON_TIMEZONES.includes(values.timezone)
    ? COMMON_TIMEZONES
    : [values.timezone, ...COMMON_TIMEZONES];

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <p
          role="alert"
          className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200"
        >
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="newCardCap" className="mb-1 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Daily new-card cap
        </label>
        <input
          id="newCardCap"
          name="newCardCap"
          type="number"
          min={MIN_NEW_CARD_CAP}
          max={MAX_NEW_CARD_CAP}
          defaultValue={values.newCardCap}
          required
          className={`${INPUT} w-32`}
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          How many questions you&apos;ve never reviewed before Practice introduces in one day. Reviews already due
          aren&apos;t capped.
        </p>
      </div>

      <div>
        <label htmlFor="preferredDifficulty" className="mb-1 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Preferred difficulty for new material
        </label>
        {/* Keyed on its own value: an already-mounted <select>'s defaultValue
            is never re-applied by React, so without a key a save that
            actually succeeds would still visually snap this back to the
            page's original value — see question-form.tsx's fuller note. */}
        <select
          key={values.preferredDifficulty ?? ''}
          id="preferredDifficulty"
          name="preferredDifficulty"
          defaultValue={values.preferredDifficulty ?? ''}
          className={INPUT}
        >
          <option value="">No preference</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {DIFFICULTY_LABELS[d]}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Only affects which new questions are introduced — a review that&apos;s due still shows up regardless.
        </p>
      </div>

      <div>
        <label htmlFor="timezone" className="mb-1 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Timezone
        </label>
        <select key={values.timezone} id="timezone" name="timezone" defaultValue={values.timezone} className={INPUT}>
          {timezoneOptions.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Only used to draw the new-card cap&apos;s day boundary — so it resets at your own midnight, not UTC&apos;s.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {pending ? 'Saving…' : 'Save settings'}
        </button>
        {!state.error && !pending && state.saved && <span className="text-sm text-zinc-500 dark:text-zinc-400">Saved</span>}
      </div>
    </form>
  );
}
