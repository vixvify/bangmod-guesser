import { createAccessControl } from "better-auth/plugins";
import { UserRole } from "@/core/domain/user";

export const adminAccessControl = createAccessControl({
  user: ["get", "update", "ban", "set-role"],
  session: [],
} as const);

export const authRoles = {
  [UserRole.USER]: adminAccessControl.newRole({ user: [], session: [] }),
  [UserRole.ADMIN]: adminAccessControl.newRole({
    user: ["get", "update", "ban", "set-role"],
    session: [],
  }),
};
