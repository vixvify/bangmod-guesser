import type { UserRole } from "@/core/domain/user";

export type AdminUserStatus = "ACTIVE" | "TEMPORARY" | "SUSPENDED" | "DEACTIVATED";

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: UserRole;
  status: AdminUserStatus;
  gameCount: number;
  suspension: { startDate: string | null; endDate: string | null };
  reason: string;
};
