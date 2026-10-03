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
import type { Location } from "@/core/domain/location";
import { AppRoutes } from "@/routes/app/routes";

type LocationsTableProps = {
  locations: Location[];
  onDelete: (location: Location) => void;
};

export function LocationsTable({ locations, onDelete }: LocationsTableProps) {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ border: "1px solid #e2e8f0", borderRadius: "1rem", boxShadow: "0 1px 3px rgb(15 23 42 / 6%)" }}
    >
      <Table
        aria-label="รายชื่อสถานที่"
        sx={{
          minWidth: "44rem",
          "& .MuiTableCell-root": { fontFamily: "var(--font-prompt), sans-serif", px: 2.5 },
        }}
      >
        <TableHead
          sx={{
            backgroundColor: "#f1f5f9",
            "& .MuiTableCell-root": { fontSize: "0.75rem", fontWeight: 700, color: "#475569" },
          }}
        >
          <TableRow>
            <TableCell sx={{ width: "5rem" }}>ลำดับ</TableCell>
            <TableCell>ชื่อสถานที่</TableCell>
            <TableCell sx={{ width: "9rem" }}>จำนวนภาพ</TableCell>
            <TableCell sx={{ width: "7rem" }}>จัดการ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {locations.map((location, index) => (
            <TableRow key={location.id} hover sx={{ "&:hover": { backgroundColor: "#fff7ed" } }}>
              <TableCell sx={{ color: "#64748b" }}>
                {String(index + 1).padStart(2, "0")}
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "var(--color-secondary-dark)" }}>
                {location.name}
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
                    sx={{ color: "var(--color-secondary-dark)", "&:hover": { color: "var(--color-primary-main)" } }}
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    aria-label={`ลบ ${location.name}`}
                    onClick={() => onDelete(location)}
                    size="small"
                    sx={{ color: "var(--color-secondary-dark)", "&:hover": { color: "#b91c1c" } }}
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
