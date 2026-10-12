"use client";

import { Dropdown } from "@/components/ui/dropdown";
import { UserRole, type UserStatus } from "@/core/domain/user";

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
      <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
        กรองตามบทบาท
        <Dropdown<RoleFilter>
          value={role}
          options={[
            { value: "ALL", label: "ทั้งหมด" },
            { value: UserRole.USER, label: "ผู้เล่น" },
            { value: UserRole.ADMIN, label: "ผู้ดูแล" },
          ]}
          onChange={onRoleChange}
          aria-label="กรองตามบทบาท"
          className="min-w-36"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
        กรองตามสถานะ
        <Dropdown<StatusFilter>
          value={status}
          options={[
            { value: "ALL", label: "ทั้งหมด" },
            { value: "ACTIVE", label: "ปกติ" },
            { value: "SUSPENDED", label: "ระงับการใช้งาน" },
            { value: "INACTIVE", label: "ปิดใช้งาน" },
          ]}
          onChange={onStatusChange}
          aria-label="กรองตามสถานะ"
          className="min-w-36"
        />
      </label>
    </div>
  );
}
