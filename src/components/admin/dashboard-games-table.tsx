"use client";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import type { DashboardGameLog } from "@/core/domain/dashboard";

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
    <TableContainer className="rounded-xl border border-slate-200 bg-white">
      <Table aria-label="บันทึกเกมล่าสุด" size="small">
        <TableHead className="bg-slate-100">
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
          {games.map((game) => {
            const started = new Date(game.startedAt);
            return (
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
                    className={`inline-block whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium ${game.status === "COMPLETED" ? "bg-emerald-50 text-emerald-800" : game.status === "PLAYING" ? "bg-blue-50 text-blue-800" : "bg-amber-50 text-amber-800"}`}
                  >
                    {statusLabel[game.status]}
                  </span>
                </TableCell>
                <TableCell align="right">
                  {game.totalScore === null ? "—" : format(game.totalScore)}
                </TableCell>
                <TableCell>
                  {new Intl.DateTimeFormat("th-TH", {
                    timeZone: "Asia/Bangkok",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  }).format(started)}
                </TableCell>
                <TableCell>
                  {new Intl.DateTimeFormat("th-TH", {
                    timeZone: "Asia/Bangkok",
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                  }).format(started)}
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
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
