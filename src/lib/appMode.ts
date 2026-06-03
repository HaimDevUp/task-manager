/** מצב production: הרשאות admin/employee. ברירת מחדל: live */
export function isAppLive(): boolean {
  const raw = process.env.APP_LIVE?.trim().toLowerCase();
  if (raw === "false" || raw === "0" || raw === "no") return false;
  return true;
}
