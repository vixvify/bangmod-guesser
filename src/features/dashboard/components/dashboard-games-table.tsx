"use client";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { dashboardTableSx } from "@/features/dashboard/components/dashboard-table-style";
import type { DashboardGameLog } from "@/features/dashboard/dashboard";
import { formatThaiClockTime, formatThaiNumericDate } from "@/shared/lib/utils";

const format = (value: number) => new Intl.NumberFormat("th-TH").format(value);
const statusLabel: Record<DashboardGameLog["status"], string> = {
  PLAYING: "กำลังเล่น",
  COMPLETED: "จบเกม",
  INCOMPLETE: "ออกกลางคัน",
};

export function DashboardGamesTable({
  games,
  onView,
}: {
  games: DashboardGameLog[];
  onView: (game: DashboardGameLog) => void;
}) {
  return (
    <TableContainer className="rounded-xl border border-surface-border bg-surface-overlay">
      <Table sx={dashboardTableSx} aria-label="บันทึกเกมล่าสุด" size="small">
        <TableHead className="bg-surface-control">
          <TableRow>
            <TableCell>GAME ID</TableCell>
            <TableCell>ชื่อผู้ใช้</TableCell>
            <TableCell>สถานะ</TableCell>
            <TableCell align="right">คะแนน</TableCell>
            <TableCell>เวลาเริ่มเล่น</TableCell>
            <TableCell>วันที่</TableCell>
            <TableCell align="center">รายละเอียด</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {games.map((game) => (
              <TableRow key={game.id} hover>
                <TableCell>
                  <span
                    className="block max-w-28 truncate text-xs font-semibold"
                    title={game.id}
                  >
                    {game.id}
                  </span>
                </TableCell>
                <TableCell>{game.user.name}</TableCell>
                <TableCell>
                  <span
                    className={`inline-block whitespace-nowrap rounded-full border px-2 py-1 text-xs font-medium ${game.status === "COMPLETED" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : game.status === "PLAYING" ? "border-sky-400/30 bg-sky-400/10 text-sky-200" : "border-amber-400/30 bg-amber-400/10 text-amber-200"}`}
                  >
                    {statusLabel[game.status]}
                  </span>
                </TableCell>
                <TableCell align="right">
                  {game.totalScore === null ? "—" : format(game.totalScore)}
                </TableCell>
                <TableCell>
                  {formatThaiClockTime(game.startedAt)}
                </TableCell>
                <TableCell>
                  {formatThaiNumericDate(game.startedAt)}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    aria-label={`ดูรายละเอียดเกม ${game.id}`}
                    onClick={() => onView(game)}
                    size="small"
                  >
                    <VisibilityOutlinedIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
