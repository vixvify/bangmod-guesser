"use client";

import { useState } from "react";
import { Dropdown } from "@/components/ui/dropdown";
import type { AdminUserStatus } from "@/core/domain/admin-user";
import { UserRole } from "@/core/domain/user";

type RoleFilter = "ALL" | UserRole;
type StatusFilter = "ALL" | AdminUserStatus;

export function UsersFilters() {
  const [role, setRole] = useState<RoleFilter>("ALL");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  return (
    <div className="mb-4 flex flex-wrap justify-end gap-3">
      <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
        กรองตามบทบาท
        <Dropdown<RoleFilter>
          value={role}
          options={[
            { value: "ALL", label: "ทั้งหมด" },
            { value: UserRole.USER, label: "ผู้เล่น" },
            { value: UserRole.ADMIN, label: "ผู้ดูแล" },
          ]}
          onChange={setRole}
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
            { value: "TEMPORARY", label: "ระงับชั่วคราว" },
            { value: "SUSPENDED", label: "ระงับถาวร" },
            { value: "DEACTIVATED", label: "ปิดใช้งาน" },
          ]}
          onChange={setStatus}
          aria-label="กรองตามสถานะ"
          className="min-w-36"
        />
      </label>
    </div>
  );
}
