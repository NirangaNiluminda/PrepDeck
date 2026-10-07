'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getContainer, getSession } from '@/composition/container';
import { completeOnboarding, updateUserSettings } from '@/modules/users';
import { writeLimitError } from '../_lib/write-guard';

export interface OnboardingState {
  readonly error?: string;
}

export async function completeOnboardingAction(
  _previous: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const session = await getSession();
  if (!session) return { error: 'Sign in to continue.' };

  const limited = await writeLimitError('profile', session.userId);
  if (limited) return { error: limited };

  const targetRole = formData.get('targetRole');
  const experienceLevel = formData.get('experienceLevel');
  if (typeof targetRole !== 'string' || typeof experienceLevel !== 'string') {
    return { error: 'Choose an answer for each question.' };
  }

  const result = await completeOnboarding(
    { userId: session.userId, targetRole, experienceLevel },
    await getContainer(),
  );
  if (!result.ok) return { error: result.error.message };

  revalidatePath('/practice');
  redirect('/practice');
}

export interface SettingsFormValues {
  readonly newCardCap: number;
  readonly preferredDifficulty?: string;
  readonly timezone: string;
}

export interface SettingsState {
  readonly error?: string;
  readonly saved?: boolean;
  /**
   * What was actually saved, echoed back so the form can key itself on it
   * and remount with the right defaultValue once the save succeeds — see
   * SettingsForm's own comment for why a remount, not just a prop change,
   * is what it takes.
   */
  readonly values?: SettingsFormValues;
}

export async function updateSettingsAction(_previous: SettingsState, formData: FormData): Promise<SettingsState> {
  const session = await getSession();
  if (!session) return { error: 'Sign in to continue.' };

  const limited = await writeLimitError('profile', session.userId);
  if (limited) return { error: limited };

  const newCardCap = Number(formData.get('newCardCap'));
  const timezone = formData.get('timezone');
  const preferredDifficultyRaw = formData.get('preferredDifficulty');
  if (!Number.isFinite(newCardCap) || typeof timezone !== 'string') {
    return { error: 'Invalid settings.' };
  }
  const preferredDifficulty =
    typeof preferredDifficultyRaw === 'string' && preferredDifficultyRaw !== '' ? preferredDifficultyRaw : undefined;
  const values: SettingsFormValues = { newCardCap, preferredDifficulty, timezone };

  const result = await updateUserSettings({ userId: session.userId, ...values }, await getContainer());
  if (!result.ok) return { error: result.error.message, values };

  revalidatePath('/practice');
  return { saved: true, values: result.value.settings };
}
