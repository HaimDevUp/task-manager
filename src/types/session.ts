import type { EmployeeRole } from "../../config/employees";

export interface SessionUser {
  id: string;
  name: string;
  image: string;
  email: string;
  role: EmployeeRole;
}
