// Session-size safety cap — not a per-user setting, just a ceiling on how
// many cards one /practice load ever fetches at once.
export const SESSION_LIMIT = 100;

// Mirrors the range in '@/modules/users/domain/user-profile.ts'. Duplicated,
// not imported, for the same reason exam-config.ts's copy is: this file is
// read by a Client Component (settings-form.tsx), which never imports
// '@/modules/*'. Real enforcement is server-side in UserProfile.updateSettings
// regardless — this only bounds the input's min/max, a UX nicety.
export const MIN_NEW_CARD_CAP = 0;
export const MAX_NEW_CARD_CAP = 200;
