/** Case-insensitive — GitHub logins already are. */
export function isAllowlistedAdmin(login: string | undefined, allowlist: readonly string[]): boolean {
  if (!login) return false;
  const normalized = login.toLowerCase();
  return allowlist.some((entry) => entry.toLowerCase() === normalized);
}
