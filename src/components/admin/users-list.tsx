"use client";

import PeopleOutlineRoundedIcon from "@mui/icons-material/PeopleOutlineRounded";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { EditUserModal } from "@/components/admin/edit-user-modal";
import {
  UsersFilters,
  type RoleFilter,
  type StatusFilter,
} from "@/components/admin/users-filters";
import { UsersTable } from "@/components/admin/users-table";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { ListPagination } from "@/components/ui/list-pagination";
import { USER_MESSAGES } from "@/core/constants/user";
import type { PaginatedUsers, UserAccount } from "@/core/domain/user";
import type { UserFormInput } from "@/core/schema/user.schema";
import httpClient from "@/lib/http";
import { UserRoutes } from "@/routes/api/user.routes";
import { AppRoutes } from "@/routes/app/routes";

type UsersListProps = {
  initialUsers: PaginatedUsers;
  initialRole: RoleFilter;
  initialStatus: StatusFilter;
};

function userListParams(page: number, role: RoleFilter, status: StatusFilter) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (role !== "ALL") params.set("role", role);
  if (status !== "ALL") params.set("status", status);
  return params;
}

export function UsersList({
  initialUsers,
  initialRole,
  initialStatus,
}: UsersListProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [previousUsers, setPreviousUsers] = useState(initialUsers);
  const [role, setRole] = useState<RoleFilter>(initialRole);
  const [status, setStatus] = useState<StatusFilter>(initialStatus);
  const [loadedRole, setLoadedRole] = useState<RoleFilter>(initialRole);
  const [loadedStatus, setLoadedStatus] = useState<StatusFilter>(initialStatus);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserAccount | null>(null);
  const [deleting, setDeleting] = useState(false);
  const requestId = useRef(0);
  const loading = role !== loadedRole || status !== loadedStatus;

  if (initialUsers !== previousUsers) {
    setPreviousUsers(initialUsers);
    setUsers(initialUsers);
    setRole(initialRole);
    setStatus(initialStatus);
    setLoadedRole(initialRole);
    setLoadedStatus(initialStatus);
  }

  useEffect(() => {
    if (!loading) return;
    const currentRequest = ++requestId.current;
    const params = userListParams(1, role, status);

    async function filterUsers() {
      try {
        const { data } = await httpClient.get<PaginatedUsers>(
          `${UserRoutes.list}${params.size ? `?${params}` : ""}`,
        );
        if (currentRequest !== requestId.current) return;
        setUsers(data);
        setLoadedRole(role);
        setLoadedStatus(status);
        window.history.replaceState(
          window.history.state,
          "",
          `${AppRoutes.adminUsers}${params.size ? `?${params}` : ""}`,
        );
      } catch {
        if (currentRequest !== requestId.current) return;
        toast.error(USER_MESSAGES.loadFailed);
        setRole(loadedRole);
        setStatus(loadedStatus);
      }
    }

    void filterUsers();
    return () => {
      requestId.current += 1;
    };
  }, [loading, role, status, loadedRole, loadedStatus]);

  function goToPage(page: number) {
    const params = userListParams(page, loadedRole, loadedStatus);
    router.push(`${AppRoutes.adminUsers}${params.size ? `?${params}` : ""}`, {
      scroll: false,
    });
  }

  async function saveUser(values: UserFormInput) {
    if (!editingUser) return;
    try {
      const { data } = await httpClient.patch<UserAccount>(
        UserRoutes.update(editingUser.id),
        values,
      );
      setUsers((current) => ({
        ...current,
        users: current.users.map((user) => (user.id === data.id ? data : user)),
      }));
      setEditingUser(null);
      toast.success(USER_MESSAGES.updateSuccess);
      router.refresh();
    } catch {
      toast.error(USER_MESSAGES.updateFailed);
    }
  }

  async function deleteUser() {
    if (!deletingUser || deleting) return;
    setDeleting(true);
    try {
      await httpClient.delete<null>(UserRoutes.delete(deletingUser.id));
      toast.success(USER_MESSAGES.deleteSuccess);
      setDeletingUser(null);
      if (users.page > 1 && users.users.length === 1) {
        goToPage(users.page - 1);
      } else {
        router.refresh();
      }
    } catch {
      toast.error(USER_MESSAGES.deleteFailed);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="mt-3 mb-7 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            จัดการผู้ใช้
          </h1>
          <p className="mt-1 text-sm text-slate-500 sm:text-base">
            จัดการบัญชีผู้เล่นและสิทธิ์การใช้งานระบบ
          </p>
        </div>
        <UsersFilters
          role={role}
          status={status}
          onRoleChange={setRole}
          onStatusChange={setStatus}
        />
      </div>
      {loading ? (
        <div
          role="status"
          className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500"
        >
          กำลังโหลดผู้ใช้...
        </div>
      ) : users.users.length === 0 ? (
        <EmptyState
          title={USER_MESSAGES.empty}
          icon={<PeopleOutlineRoundedIcon fontSize="large" />}
        />
      ) : (
        <>
          <UsersTable
            users={users.users}
            startIndex={(users.page - 1) * users.limit}
            onEdit={setEditingUser}
            onDelete={setDeletingUser}
          />
          <ListPagination
            totalItems={users.total}
            pageSize={users.limit}
            page={users.page}
            itemLabel="ผู้ใช้"
            onPageChange={goToPage}
          />
        </>
      )}
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
        busy={deleting}
        onCancel={() => setDeletingUser(null)}
        onConfirm={deleteUser}
      />
    </>
  );
}
