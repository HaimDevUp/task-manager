export type EmployeeRole = "admin" | "employee";

export interface Employee {
  id: string;
  name: string;
  image: string;
  email: string;
  role: EmployeeRole;
}

/**
 * סיסמת כניסה (שרת בלבד): {חלק באנגלית מהאימייל לפני @}26
 * למשל haim@upnext.co.il → haim26 — ראה src/lib/employeeAuth.ts
 */
export const employees: Employee[] = [
  {
    id: "2",
    name: "שלומי",
    image:
      "https://media.licdn.com/dms/image/v2/C4D03AQEeXCeVBEqzPg/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1516534493721?e=1781136000&v=beta&t=Cn_Cfkn9CbXK87u0WzeeNbgHg9HQw3VCPbFYqvUlLjA",
    email: "shlomi@upnext.co.il",
    role: "admin",
  },
  {
    id: "1",
    name: "חיים",
    image:
      "https://media.licdn.com/dms/image/v2/C4D03AQFSpNb62lZesA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1660472911563?e=1781136000&v=beta&t=8dpanCoCeIHCXDXVUFRdQUDeN9RFuD1zzEP9X9ictMo",
    email: "haim@upnext.co.il",
    role: "admin",
  },
  {
    id: "3",
    name: "תומר",
    image:
      "https://media.licdn.com/dms/image/v2/D4D03AQFvmlLxuq6HnQ/profile-displayphoto-shrink_800_800/B4DZTW.5c8G8Ac-/0/1738773600654?e=1781136000&v=beta&t=lOpnZRqpRK4GYBTGwI1zYYX-lkUZPUAvz6eocYN_tlY",
    email: "tomer@upnext.co.il",
    role: "employee",
  },
  {
    id: "4",
    name: "אילן",
    image: "https://i.pravatar.cc/150?u=michal",
    email: "ilan@upnext.co.il",
    role: "employee",
  },
];

export const UNASSIGNED_TAB_ID = "unassigned";

export const UNASSIGNED_TAB_NAME = "לא משויך";

export function getEmployeeById(id: string): Employee | undefined {
  return employees.find((e) => e.id === id);
}

export function isAdminRole(role: EmployeeRole): boolean {
  return role === "admin";
}

/** טאבים שעובד רגיל רשאי לבחור: המשימות שלו + לא משויך */
export function isAllowedEmployeeTabForUser(
  tabId: string,
  userId: string,
  isAdmin: boolean
): boolean {
  if (isAdmin) {
    return tabId === UNASSIGNED_TAB_ID || employees.some((e) => e.id === tabId);
  }
  return tabId === userId || tabId === UNASSIGNED_TAB_ID;
}

export function resolveEmployeeTabFromUrl(
  employeeFromUrl: string | null,
  userId: string,
  isAdmin: boolean
): string {
  if (
    employeeFromUrl &&
    isAllowedEmployeeTabForUser(employeeFromUrl, userId, isAdmin)
  ) {
    return employeeFromUrl;
  }
  return isAdmin ? getDefaultEmployeeId() : userId;
}

function getDefaultEmployeeId(): string {
  return employees[0]?.id ?? UNASSIGNED_TAB_ID;
}
