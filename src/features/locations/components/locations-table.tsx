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
import Link from "next/link";
import { LocationStatus, type Location } from "@/features/locations/location";
import { AppRoutes } from "@/shared/routes/routes";

type LocationsTableProps = {
  locations: Location[];
  startIndex?: number;
  onDelete: (location: Location) => void;
};

const badgeClass =
  "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold whitespace-nowrap";

const statusClasses = {
  [LocationStatus.ACTIVE]:
    "border-emerald-200 bg-emerald-50 text-emerald-800",
  [LocationStatus.INACTIVE]:
    "border-slate-200 bg-slate-100 text-slate-700",
};

export function LocationsTable({
  locations,
  startIndex = 0,
  onDelete,
}: LocationsTableProps) {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: "1px solid var(--color-surface-border)",
        backgroundColor: "var(--color-surface-overlay)",
        borderRadius: "1rem",
        boxShadow: "0 1px 3px rgb(15 23 42 / 6%)",
      }}
    >
      <Table
        aria-label="รายชื่อสถานที่"
        sx={{
          minWidth: "50rem",
          "& .MuiTableCell-root": {
            fontFamily: "var(--font-prompt), sans-serif",
            color: "var(--color-surface-text)",
            borderColor: "var(--color-surface-border)",
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
            <TableCell>ชื่อสถานที่</TableCell>
            <TableCell sx={{ width: "9rem" }}>สถานะ</TableCell>
            <TableCell sx={{ width: "9rem" }}>จำนวนภาพ</TableCell>
            <TableCell sx={{ width: "7rem" }}>จัดการ</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {locations.map((location, index) => (
            <TableRow
              key={location.id}
              hover
              sx={{
                "&:hover": {
                  backgroundColor: "var(--color-surface-control-hover)",
                },
              }}
            >
              <TableCell sx={{ color: "var(--color-surface-muted)" }}>
                {String(startIndex + index + 1).padStart(2, "0")}
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 600,
                  color: "var(--color-surface-text)",
                }}
              >
                {location.name}
              </TableCell>

              <TableCell>
                <span
                  className={`${badgeClass} ${
                    statusClasses[location.status ?? LocationStatus.INACTIVE]
                  }`}
                >
                  {location.status === LocationStatus.ACTIVE
                    ? "เปิดใช้งาน"
                    : "ปิดใช้งาน"}
                </span>
              </TableCell>

              <TableCell sx={{ fontVariantNumeric: "tabular-nums" }}>
                {location.images.length} ภาพ
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-1">
                  <IconButton
                    component={Link}
                    href={AppRoutes.adminLocationEdit(location.id)}
                    aria-label={`แก้ไข ${location.name}`}
                    size="small"
                    sx={{
                      color: "var(--color-surface-text)",
                      "&:hover": {
                        color: "var(--color-primary-main)",
                      },
                    }}
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>

                  <IconButton
                    aria-label={`ลบ ${location.name}`}
                    onClick={() => onDelete(location)}
                    size="small"
                    sx={{
                      color: "var(--color-surface-text)",
                      "&:hover": {
                        color: "#b91c1c",
                      },
                    }}
                  >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
