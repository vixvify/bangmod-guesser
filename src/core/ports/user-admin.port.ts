import type {
  AdminBanUserBodyInput,
  AdminSetRoleBodyInput,
  AdminUpdateUserBodyInput,
  AdminUserIdBodyInput,
} from "@/core/schema/admin.schema";

export interface UserAdminPort {
  updateName(headers: Headers, input: AdminUpdateUserBodyInput): Promise<void>;
  setRole(headers: Headers, input: AdminSetRoleBodyInput): Promise<void>;
  banUser(headers: Headers, input: AdminBanUserBodyInput): Promise<void>;
  unbanUser(headers: Headers, input: AdminUserIdBodyInput): Promise<void>;
  removeUser(headers: Headers, input: AdminUserIdBodyInput): Promise<void>;
}
