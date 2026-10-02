"use client";

import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import type { AdminUserStatus, ManagedUser } from "@/core/domain/admin-user";
import { UserRole } from "@/core/domain/user";

type UsersTableProps = {
  users: ManagedUser[];
  onEdit: (user: ManagedUser) => void;
  onDelete: (user: ManagedUser) => void;
};

const statusLabels: Record<AdminUserStatus, string> = {
  ACTIVE: "ปกติ",
  TEMPORARY: "ระงับชั่วคราว",
  SUSPENDED: "ระงับถาวร",
  DEACTIVATED: "ปิดใช้งาน",
};

const badgeClass = "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold whitespace-nowrap";
const roleClasses = {
  [UserRole.ADMIN]: "border-orange-200 bg-orange-50 text-orange-800",
  [UserRole.USER]: "border-slate-200 bg-slate-100 text-slate-700",
};
const statusClasses: Record<AdminUserStatus, string> = {
  ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-800",
  TEMPORARY: "border-amber-200 bg-amber-50 text-amber-800",
  SUSPENDED: "border-rose-200 bg-rose-50 text-rose-800",
  DEACTIVATED: "border-slate-300 bg-slate-200 text-slate-700",
};

export function UsersTable({ users, onEdit, onDelete }: UsersTableProps) {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: "1px solid #e2e8f0",
        borderRadius: "1rem",
        boxShadow: "0 1px 3px rgb(15 23 42 / 6%)",
      }}
    >
      <Table
        aria-label="รายชื่อผู้ใช้"
        sx={{
          minWidth: "44rem",
          "& .MuiTableCell-root": {
            fontFamily: "var(--font-prompt), sans-serif",
            px: 2.5,
          },
        }}
      >
        <TableHead
          sx={{
            backgroundColor: "#f1f5f9",
            "& .MuiTableCell-root": {
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#475569",
            },
          }}
        >
          <TableRow>
            <TableCell sx={{ width: "5rem" }}>ลำดับ</TableCell>
            <TableCell>ชื่อผู้ใช้</TableCell>
            <TableCell>บทบาท/สถานะ</TableCell>
            <TableCell>เกมที่เล่น</TableCell>
            <TableCell sx={{ width: "7rem" }}>จัดการ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user, index) => (
            <TableRow
              key={user.id}
              hover
              sx={{ "&:hover": { backgroundColor: "#fff7ed" } }}
            >
              <TableCell sx={{ color: "#64748b" }}>
                {String(index + 1).padStart(2, "0")}
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, color: "var(--color-secondary-dark)" }}
              >
                {user.name}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`${badgeClass} ${roleClasses[user.role]}`}
                  >
                    {user.role === UserRole.ADMIN ? "ผู้ดูแล" : "ผู้เล่น"}
                  </span>
                  <span
                    className={`${badgeClass} ${statusClasses[user.status]}`}
                  >
                    {statusLabels[user.status]}
                  </span>
                </div>
              </TableCell>
              <TableCell sx={{ fontVariantNumeric: "tabular-nums" }}>
                {user.gameCount.toLocaleString("th-TH")} เกม
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <IconButton
                    aria-label={`แก้ไข ${user.name}`}
                    onClick={() => onEdit(user)}
                    size="small"
                    sx={{
                      color: "var(--color-secondary-dark)",
                      "&:hover": { color: "var(--color-primary-main)" },
                    }}
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    aria-label={`ลบ ${user.name}`}
                    onClick={() => onDelete(user)}
                    size="small"
                    sx={{
                      color: "var(--color-secondary-dark)",
                      "&:hover": { color: "#b91c1c" },
                    }}
                  >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {users.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                align="center"
                sx={{ py: 6, color: "#64748b" }}
              >
                ไม่พบผู้ใช้ตามตัวกรองที่เลือก
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
