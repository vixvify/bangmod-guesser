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
import { UserRole, type UserAccount, type UserStatus } from "@/features/users/user";

type UsersTableProps = {
  users: UserAccount[];
  startIndex?: number;
  onEdit: (user: UserAccount) => void;
  onDelete: (user: UserAccount) => void;
};

const statusLabels: Record<UserStatus, string> = {
  ACTIVE: "ปกติ",
  SUSPENDED: "ระงับถาวร",
  INACTIVE: "ปิดใช้งาน",
};

const badgeClass =
  "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold whitespace-nowrap";
const roleClasses = {
  [UserRole.ADMIN]: "border-orange-200 bg-orange-50 text-orange-800",
  [UserRole.USER]: "border-surface-border bg-surface-control text-surface-muted",
};
const statusClasses: Record<UserStatus, string> = {
  ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-800",
  SUSPENDED: "border-rose-200 bg-rose-50 text-rose-800",
  INACTIVE: "border-surface-border bg-surface-control text-surface-muted",
};

function getStatusDisplay(user: UserAccount) {
  if (user.status === "SUSPENDED" && user.suspension.endDate) {
    return {
      label: "ระงับชั่วคราว",
      className: "border-amber-200 bg-amber-50 text-amber-800",
    };
  }

  return {
    label: statusLabels[user.status],
    className: statusClasses[user.status],
  };
}

export function UsersTable({ users, startIndex = 0, onEdit, onDelete }: UsersTableProps) {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: "1px solid var(--color-surface-border)",
        backgroundColor: "var(--color-surface-overlay)", borderRadius: "1rem",
        boxShadow: "0 1px 3px rgb(15 23 42 / 6%)",
      }}
    >
      <Table
        aria-label="รายชื่อผู้ใช้"
        sx={{
          minWidth: "44rem",
          "& .MuiTableCell-root": {
            fontFamily: "var(--font-prompt), sans-serif", color: "var(--color-surface-text)", borderColor: "var(--color-surface-border)",
            px: 2.5,
          },
        }}
      >
        <TableHead
          sx={{
            backgroundColor: "var(--color-surface-control)",
            "& .MuiTableCell-root": {
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "var(--color-surface-muted)",
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
          {users.map((user, index) => {
            const statusDisplay = getStatusDisplay(user);

            return (
              <TableRow
                key={user.id}
                hover
                sx={{ "&:hover": { backgroundColor: "var(--color-surface-control-hover)" } }}
            >
              <TableCell sx={{ color: "var(--color-surface-muted)" }}>
                {String(startIndex + index + 1).padStart(2, "0")}
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, color: "var(--color-surface-text)" }}
              >
                {user.name}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  <span className={`${badgeClass} ${roleClasses[user.role]}`}>
                    {user.role === UserRole.ADMIN ? "ผู้ดูแล" : "ผู้เล่น"}
                  </span>
                  <span
                    className={`${badgeClass} ${statusDisplay.className}`}
                  >
                    {statusDisplay.label}
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
                      color: "var(--color-surface-text)",
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
                      color: "var(--color-surface-text)",
                      "&:hover": { color: "#b91c1c" },
                    }}
                  >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </div>
              </TableCell>
              </TableRow>
            );
          })}
          {users.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                align="center"
                sx={{ py: 6, color: "var(--color-surface-muted)" }}
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
