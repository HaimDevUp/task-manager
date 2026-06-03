import { getEmployeeById } from "../../config/employees";
import { isAppLive } from "@/lib/appMode";
import type { SessionUser } from "@/types/session";

export const AUTH_COOKIE_NAME = "task_manager_session";

const SESSION_PREFIX = "emp:";

export function getAppPassword(): string | undefined {
  const value = process.env.APP_PASSWORD?.trim();
  return value || undefined;
}

export function createSessionToken(employeeId: string): string {
  return `${SESSION_PREFIX}${employeeId}`;
}

export function parseSessionEmployeeId(
  cookieValue: string | undefined
): string | null {
  if (!cookieValue?.startsWith(SESSION_PREFIX)) return null;
  const id = cookieValue.slice(SESSION_PREFIX.length);
  return getEmployeeById(id) ? id : null;
}

export function isAuthenticatedSession(cookieValue: string | undefined): boolean {
  return parseSessionEmployeeId(cookieValue) !== null;
}

export function getSessionUser(
  cookieValue: string | undefined
): SessionUser | null {
  const id = parseSessionEmployeeId(cookieValue);
  if (!id) return null;
  const emp = getEmployeeById(id);
  if (!emp) return null;
  return {
    id: emp.id,
    name: emp.name,
    image: emp.image,
    email: emp.email,
    role: emp.role,
  };
}

/** האם למשתמש יש גישת אדמין (כל העובדים) */
export function userHasAdminAccess(user: SessionUser): boolean {
  if (!isAppLive()) return true;
  return user.role === "admin";
}
