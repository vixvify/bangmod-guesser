import type { UserAdminPort } from "@/features/users/server/user-admin.port";
import type {
  AdminBanUserBodyInput,
  AdminSetRoleBodyInput,
  AdminUpdateUserBodyInput,
  AdminUserIdBodyInput,
} from "@/features/users/admin.schema";
import { auth } from "@/features/auth/server/auth";

export class UserAdapter implements UserAdminPort {
    async updateName(headers: Headers, input: AdminUpdateUserBodyInput): Promise<void> {
        await auth.api.adminUpdateUser({
            body: input,
            headers,
        });
    }

    async setRole(headers: Headers, input: AdminSetRoleBodyInput): Promise<void> {
        await auth.api.setRole({
            body: input,
            headers,
        });
    }

    async banUser(headers: Headers, input: AdminBanUserBodyInput): Promise<void> {
        await auth.api.banUser({
            body: input,
            headers,
        });
    }

    async unbanUser(headers: Headers, input: AdminUserIdBodyInput): Promise<void> {
        await auth.api.unbanUser({
            body: input,
            headers,
        });
    }

    async removeUser(headers: Headers, input: AdminUserIdBodyInput): Promise<void> {
        await auth.api.removeUser({
            body: input,
            headers,
        });
    }
}
