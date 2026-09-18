'use client';

import { useActionState } from 'react';
import { completeOnboardingAction } from '../actions/users';
import { EXPERIENCE_LEVEL_LABELS, TARGET_ROLE_LABELS } from '../_lib/onboarding-labels';

const TARGET_ROLES = ['swe', 'devops', 'fullstack', 'security'];
const EXPERIENCE_LEVELS = ['student', 'junior', 'mid', 'senior'];

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState(completeOnboardingAction, {});

  return (
    <form action={formAction} className="space-y-8">
      {state.error && (
        <p
          role="alert"
          className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200"
        >
          {state.error}
        </p>
      )}

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
          What role are you preparing for?
        </legend>
        <div className="space-y-1">
          {TARGET_ROLES.map((role) => (
            <label
              key={role}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
            >
              <input type="radio" name="targetRole" value={role} required className="accent-indigo-600" />
              <span className="text-zinc-700 dark:text-zinc-300">{TARGET_ROLE_LABELS[role]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">Where are you at?</legend>
        <div className="space-y-1">
          {EXPERIENCE_LEVELS.map((level) => (
            <label
              key={level}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
            >
              <input type="radio" name="experienceLevel" value={level} required className="accent-indigo-600" />
              <span className="text-zinc-700 dark:text-zinc-300">{EXPERIENCE_LEVEL_LABELS[level]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Start practising'}
      </button>
    </form>
  );
}
