export const AUTH_COOKIE_NAME = "task_manager_session";

/** ערך קבוע ב-cookie אחרי התחברות מוצלחת (לא הסיסמה עצמה) */
export const AUTH_SESSION_VALUE = "authenticated";

export function getAppPassword(): string | undefined {
  const value = process.env.APP_PASSWORD?.trim();
  return value || undefined;
}

export function verifyAppPassword(input: string): boolean {
  const expected = getAppPassword();
  if (!expected) return false;
  return input === expected;
}

export function isAuthenticatedSession(value: string | undefined): boolean {
  return value === AUTH_SESSION_VALUE;
}
