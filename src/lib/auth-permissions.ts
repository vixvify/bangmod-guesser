import { defaultAc, userAc } from "better-auth/plugins/admin/access";
import { UserRole } from "@/core/domain/user";

export const authRoles = {
  [UserRole.USER]: userAc,
  [UserRole.ADMIN]: defaultAc.newRole({
    user: ["get", "list", "set-role", "update", "ban", "delete"],
    session: [],
  }),
};
