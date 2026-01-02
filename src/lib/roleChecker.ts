import { Role, User } from "@/types";

export function roleChecker(user?: User | null, ...roles: Role[]): boolean {
  if (!user) return false;

  if (!roles.includes(user.role)) return false;
  return true;
}
