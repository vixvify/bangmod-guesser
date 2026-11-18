import type { UserStatus } from "@/shared/lib/user-status";
export type { UserStatus } from "@/shared/lib/user-status";

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: UserRole;
}

export type UserAccount = User & {
  image: string | null;
  status: UserStatus;
  gameCount: number;
  suspension: { startDate: string | null; endDate: string | null };
  reason: string;
};

export type PaginatedUsers = {
  users: UserAccount[];
  total: number;
  page: number;
  limit: number;
};
