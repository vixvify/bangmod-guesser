"use client";

import { Dropdown } from "@/shared/components/ui/dropdown";
import { UserRole, type UserStatus } from "@/features/users/user";

export type RoleFilter = "ALL" | UserRole;
export type StatusFilter = "ALL" | UserStatus;

type UsersFiltersProps = {
  role: RoleFilter;
  status: StatusFilter;
  onRoleChange: (role: RoleFilter) => void;
  onStatusChange: (status: StatusFilter) => void;
};

export function UsersFilters({ role, status, onRoleChange, onStatusChange }: UsersFiltersProps) {
  return (
    <div className="flex w-full flex-wrap justify-end gap-3 sm:w-auto">
      <Dropdown<RoleFilter>
        label="กรองตามบทบาท"
        theme="dark"
        value={role}
        options={[
          { value: "ALL", label: "ทั้งหมด" },
          { value: UserRole.USER, label: "ผู้เล่น" },
          { value: UserRole.ADMIN, label: "ผู้ดูแล" },
        ]}
        onChange={onRoleChange}
        className="w-full sm:w-40 sm:shrink-0"
      />
      <Dropdown<StatusFilter>
        label="กรองตามสถานะ"
        theme="dark"
        value={status}
        options={[
          { value: "ALL", label: "ทั้งหมด" },
          { value: "ACTIVE", label: "ปกติ" },
          { value: "SUSPENDED", label: "ระงับการใช้งาน" },
        ]}
        onChange={onStatusChange}
        className="w-full sm:w-40 sm:shrink-0"
      />
    </div>
  );
}
