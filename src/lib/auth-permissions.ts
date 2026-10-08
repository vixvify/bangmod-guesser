import { createAccessControl } from "better-auth/plugins";
import { UserRole } from "@/core/domain/user";

export const adminAccessControl = createAccessControl({
  user: ["get", "list", "update", "ban", "set-role", "delete"],
  session: [],
} as const);

export const authRoles = {
  [UserRole.USER]: adminAccessControl.newRole({ user: [], session: [] }),
  [UserRole.ADMIN]: adminAccessControl.newRole({
    user: ["get", "list", "update", "ban", "set-role", "delete"],
    session: [],
  }),
};
