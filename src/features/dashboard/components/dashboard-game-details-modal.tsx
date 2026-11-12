"use client";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import IconButton from "@mui/material/IconButton";
import Modal from "@mui/material/Modal";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useId } from "react";
import type { DashboardGameLog } from "@/features/dashboard/dashboard";
import { formatTime } from "@/shared/lib/utils";

const format = (value: number) => new Intl.NumberFormat("th-TH").format(value);

export function DashboardGameDetailsModal({
  game,
  onClose,
}: {
  game: DashboardGameLog | null;
  onClose: () => void;
}) {
  const titleId = useId();
  return (
    <Modal
      open={Boolean(game)}
      onClose={onClose}
      aria-labelledby={titleId}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 text-secondary-dark shadow-2xl outline-none sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-2xl font-bold">
              รายละเอียดเกม
            </h2>
            <p className="mt-1 break-all text-xs text-slate-500">{game?.id}</p>
          </div>
          <IconButton aria-label="ปิดรายละเอียดเกม" onClick={onClose}>
            <CloseRoundedIcon />
          </IconButton>
        </div>
        <TableContainer className="mt-5 rounded-xl border border-slate-200">
          <Table size="small" aria-label="คะแนนแต่ละรอบ">
            <TableHead className="bg-slate-100">
              <TableRow>
                <TableCell>รอบ</TableCell>
                <TableCell>สถานที่</TableCell>
                <TableCell align="right">คะแนน</TableCell>
                <TableCell align="right">เวลา</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {game?.rounds.map((round) => (
                <TableRow key={round.questionNumber}>
                  <TableCell>{round.questionNumber}</TableCell>
                  <TableCell>
                    <span className="block font-medium">
                      {round.location.name}
                    </span>
                    <span
                      className="block max-w-48 truncate text-[0.7rem] text-slate-500"
                      title={round.location.id}
                    >
                      {round.location.id}
                    </span>
                  </TableCell>
                  <TableCell align="right">
                    {round.score === null ? "—" : format(round.score)}
                  </TableCell>
                  <TableCell align="right">
                    {round.playTimeSeconds === null
                      ? "—"
                      : formatTime(round.playTimeSeconds)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {game?.rounds.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-500">
            ยังไม่มีข้อมูลรอบเกม
          </p>
        )}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-orange-200 bg-orange-50 px-4 py-4">
            <div>
            <p className="text-xs text-slate-600">คะแนนโบนัส</p>
            <p className="text-xs text-slate-500">
              {game?.bonusScore == null ? "ไม่มีข้อมูลเวลาครบสำหรับคำนวณโบนัส" : "คำนวณจากเวลาเล่นรวม"}
            </p>
            </div>
            <p className="shrink-0 text-xl font-bold tabular-nums text-orange-700">
              {game?.bonusScore == null ? "—" : `+${format(game.bonusScore)}`}
            </p>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-orange-300 bg-orange-100 px-4 py-4">
            <p className="text-sm font-semibold text-slate-700">คะแนนรวม</p>
            <p className="shrink-0 text-2xl font-bold tabular-nums text-orange-800">
              {game?.totalScore === null || game?.totalScore === undefined
                ? "—"
                : format(game.totalScore)}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
