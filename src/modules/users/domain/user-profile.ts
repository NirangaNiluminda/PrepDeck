import { type Result, ok, err, validationError } from '@/shared/result';

export const TARGET_ROLES = ['swe', 'devops', 'fullstack', 'security'] as const;
export type TargetRole = (typeof TARGET_ROLES)[number];

export const EXPERIENCE_LEVELS = ['student', 'junior', 'mid', 'senior'] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export interface OnboardingAnswers {
  readonly targetRole: TargetRole;
  readonly experienceLevel: ExperienceLevel;
}

export interface UserSettings {
  readonly newCardCap: number;
  /**
   * Loose `string`, not questions' `Difficulty` type — domain code never
   * imports another module's types, the same reasoning exams' own config
   * type gives for why it stays loose too. Narrowed where it's actually used.
   */
  readonly preferredDifficulty?: string;
  /** IANA zone, e.g. "Asia/Colombo". Governs the practice daily new-card cap's day boundary only — see get-due-queue.ts. */
  readonly timezone: string;
}

export const DEFAULT_SETTINGS: UserSettings = { newCardCap: 20, timezone: 'UTC' };
const MIN_NEW_CARD_CAP = 0;
const MAX_NEW_CARD_CAP = 200;

const isValidTimezone = (tz: string): boolean => {
  try {
    // Callable without `new`; only called to let it throw on an invalid zone.
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

export interface UserProfileProps {
  /** Equal to whatever the signed-in AuthProvider's Session.userId is — dev or real. */
  readonly id: string;
  readonly onboarding?: OnboardingAnswers;
  readonly settings: UserSettings;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class UserProfile {
  private constructor(private readonly props: UserProfileProps) {}

  /** Every session has a profile, created lazily on first read — there is no separate signup step. */
  static createDefault(id: string, now: Date): UserProfile {
    return new UserProfile({ id, settings: DEFAULT_SETTINGS, createdAt: now, updatedAt: now });
  }

  static fromPersistence(props: UserProfileProps): UserProfile {
    return new UserProfile(props);
  }

  completeOnboarding(answers: { targetRole: string; experienceLevel: string }, now: Date): Result<UserProfile> {
    if (!(TARGET_ROLES as readonly string[]).includes(answers.targetRole)) {
      return err(validationError(`Unknown target role '${answers.targetRole}'`));
    }
    if (!(EXPERIENCE_LEVELS as readonly string[]).includes(answers.experienceLevel)) {
      return err(validationError(`Unknown experience level '${answers.experienceLevel}'`));
    }
    return ok(
      this.with(
        { onboarding: { targetRole: answers.targetRole as TargetRole, experienceLevel: answers.experienceLevel as ExperienceLevel } },
        now,
      ),
    );
  }

  updateSettings(patch: Partial<UserSettings>, now: Date): Result<UserProfile> {
    const settings: UserSettings = { ...this.props.settings, ...patch };
    if (settings.newCardCap < MIN_NEW_CARD_CAP || settings.newCardCap > MAX_NEW_CARD_CAP) {
      return err(validationError(`Daily new-card cap must be between ${MIN_NEW_CARD_CAP} and ${MAX_NEW_CARD_CAP}`));
    }
    if (!isValidTimezone(settings.timezone)) {
      return err(validationError(`Unknown timezone '${settings.timezone}'`));
    }
    return ok(this.with({ settings }, now));
  }

  private with(patch: Partial<UserProfileProps>, now: Date): UserProfile {
    return new UserProfile({ ...this.props, ...patch, updatedAt: now });
  }

  get id() { return this.props.id; }
  get onboarding() { return this.props.onboarding; }
  get settings() { return this.props.settings; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  snapshot(): UserProfileProps {
    return this.props;
  }
}
