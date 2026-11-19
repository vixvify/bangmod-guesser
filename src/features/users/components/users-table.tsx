"use client";

import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { UserRole, type UserAccount } from "@/features/users/user";
import { TableBadge } from "@/shared/components/ui/table-badge";

type UsersTableProps = {
  users: UserAccount[];
  startIndex?: number;
  onEdit: (user: UserAccount) => void;
  onDelete: (user: UserAccount) => void;
};

function getStatusDisplay(user: UserAccount) {
  if (user.status === "ACTIVE") return { label: "ปกติ", tone: "positive" } as const;
  if (user.suspension.endDate) return { label: "ระงับชั่วคราว", tone: "caution" } as const;
  return { label: "ระงับถาวร", tone: "negative" } as const;
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
                  <TableBadge tone={user.role === UserRole.ADMIN ? "accent" : "neutral"}>
                    {user.role === UserRole.ADMIN ? "ผู้ดูแล" : "ผู้เล่น"}
                  </TableBadge>
                  <TableBadge tone={statusDisplay.tone}>
                    {statusDisplay.label}
                  </TableBadge>
                </div>
              </TableCell>
              <TableCell sx={{ fontVariantNumeric: "tabular-nums" }}>
                {user.gameCount.toLocaleString("th-TH")} เกม
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Tooltip title="แก้ไขผู้ใช้">
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
                  </Tooltip>
                  <Tooltip title="ลบผู้ใช้">
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
                  </Tooltip>
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
