import { employees, type Employee } from "../../config/employees";
import { getAppPassword } from "@/lib/auth";

/** החלק באנגלית לפני @ באימייל העובד (למשל haim@... → haim) */
export function getEmailLocalPart(email: string): string {
  const local = email.split("@")[0]?.trim().toLowerCase();
  return local || "";
}

/** סיסמה: {אימייל לפני @} + 26 — למשל haim@upnext.co.il → haim26 */
export function buildEmployeePassword(email: string): string {
  return `${getEmailLocalPart(email)}26`;
}

export function verifyEmployeePassword(
  employee: Employee,
  password: string
): boolean {
  return password === buildEmployeePassword(employee.email);
}

export function findEmployeeByPassword(password: string): Employee | undefined {
  return employees.find((emp) => verifyEmployeePassword(emp, password));
}

/** כניסה עם APP_PASSWORD (מצב פיתוח) — מחזיר אדמין ראשון */
export function getDevBootstrapAdmin(): Employee | undefined {
  return employees.find((e) => e.role === "admin");
}

export function canUseLegacyAppPassword(): boolean {
  return Boolean(getAppPassword());
}

export function verifyLegacyAppPassword(password: string): boolean {
  const expected = getAppPassword();
  if (!expected) return false;
  return password === expected;
}
