"use client";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Link from "next/link";
import { useState } from "react";
import { mockUsers, mockUserTotal } from "@/_mock/_users";
import { EditUserModal } from "@/components/admin/edit-user-modal";
import { UsersFilters } from "@/components/admin/users-filters";
import { UsersTable } from "@/components/admin/users-table";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ListPagination } from "@/components/ui/list-pagination";
import { USER_MESSAGES } from "@/core/constants/user";
import type { UserAccount } from "@/core/domain/user";
import type { UserFormInput } from "@/core/schema/user.schema";
import { AppRoutes } from "@/routes/app/routes";

export default function UsersPage() {
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserAccount | null>(null);

  function saveUser(values: UserFormInput) {
    console.log("Mock user update:", { id: editingUser?.id, ...values });
    setEditingUser(null);
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <Link
        href={AppRoutes.admin}
        className="inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-primary-main"
      >
        <ArrowBackRoundedIcon fontSize="small" />
        กลับไปภาพรวมระบบ
      </Link>
      <div className="mt-3 mb-7 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            จัดการผู้ใช้
          </h1>
          <p className="mt-1 text-sm text-slate-500 sm:text-base">
            จัดการบัญชีผู้เล่นและสิทธิ์การใช้งานระบบ
          </p>
        </div>
        <UsersFilters />
      </div>
      <UsersTable
        users={mockUsers}
        onEdit={setEditingUser}
        onDelete={setDeletingUser}
      />
      <ListPagination
        totalItems={mockUserTotal}
        pageSize={mockUsers.length}
        page={1}
        itemLabel="ผู้ใช้"
      />

      {editingUser && (
        <EditUserModal
          key={editingUser.id}
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={saveUser}
        />
      )}
      <ConfirmModal
        open={Boolean(deletingUser)}
        title={USER_MESSAGES.delete.title}
        description={USER_MESSAGES.delete.description(
          deletingUser?.name ?? "ผู้ใช้",
        )}
        cancelLabel={USER_MESSAGES.delete.cancel}
        confirmLabel={USER_MESSAGES.delete.confirm}
        onCancel={() => setDeletingUser(null)}
        onConfirm={() => {
          console.log("Mock user delete:", deletingUser?.id);
          setDeletingUser(null);
        }}
      />
    </div>
  );
}
